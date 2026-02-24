
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  limit, 
  getDocs, 
  startAfter, 
  where,
  DocumentSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { UserProfile, UserRole, ExpertBadge, VerificationStatus, DocumentStatus } from '../types';

export const userService = {
  // Méthode asynchrone pour récupérer le profil actuel
  getCurrentProfile: async (): Promise<UserProfile | null> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('Aucun utilisateur connecté');
        return null;
      }

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn('Profil utilisateur introuvable');
        return null;
      }

      return { id: userSnap.id, ...userSnap.data() } as UserProfile;
    } catch (error) {
      const message = String(error?.message || '');
      const code = String(error?.code || '');

      // En production, Firestore peut être temporairement indisponible (réseau, DNS, adblock).
      // On évite de casser l'app: on retourne null et l'UI peut utiliser un fallback.
      const isOffline =
        message.toLowerCase().includes('client is offline') ||
        code === 'unavailable' ||
        code === 'failed-precondition' ||
        code === 'permission-denied';

      if (isOffline) {
        console.warn('⚠️ Firestore indisponible, profil non chargé (fallback UI):', error);
        return null;
      }

      console.error('Erreur lors de la récupération du profil:', error);
      throw new Error('Impossible de charger votre profil.');
    }
  },

  // Méthode synchrone TEMPORAIRE pour compatibilité avec le code existant
  // TODO: À remplacer par des hooks React dans les composants
  getCurrentProfileSync: (role: UserRole): UserProfile => {
    console.warn('⚠️ getCurrentProfileSync est deprecated - utilisez des hooks React avec getCurrentProfile()');
    
    // Mock data pour la compatibilité
    if (role === UserRole.ADMIN) {
      return {
        id: 'super-admin',
        fullName: 'Super-Administrateur',
        role: UserRole.ADMIN,
        email: 'info@misterdil.ca',
        bio: 'Direction de la Gouvernance et de l\'Excellence Institutionnelle Capitune.',
        isPublic: false,
        points: 99999,
        verificationStatus: VerificationStatus.CERTIFIED,
        avatar: 'https://picsum.photos/seed/admin/100/100',
        documents: []
      };
    }

    return {
      id: 'current-user',
      fullName: role === UserRole.PARTENAIRE ? 'Université de Montréal' : 'Utilisateur',
      role,
      email: 'user@capitune.com',
      isPublic: true,
      points: 1250,
      verificationStatus: VerificationStatus.NONE,
      documents: []
    } as UserProfile;
  },

  getProfileById: async (userId: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      return { id: userSnap.id, ...userSnap.data() } as UserProfile;
    } catch (error) {
      const message = String((error as any)?.message || '');
      const code = String((error as any)?.code || '');

      const isOffline =
        message.toLowerCase().includes('client is offline') ||
        code === 'unavailable' ||
        code === 'failed-precondition' ||
        code === 'permission-denied';

      if (isOffline) {
        console.warn('⚠️ Firestore indisponible, profil non chargé (fallback UI):', error);
        return null;
      }

      console.error('Erreur lors de la récupération du profil:', error);
      throw new Error('Impossible de charger le profil utilisateur.');
    }
  },

  updateProfile: async (profile: UserProfile): Promise<UserProfile> => {
    try {
      const userRef = doc(db, "users", profile.id);
      const { id, ...updateData } = profile;
      
      await updateDoc(userRef, { 
        ...updateData,
        updatedAt: serverTimestamp()
      });

      return profile;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw new Error('Impossible de mettre à jour le profil.');
    }
  },

  getPublicUsersPaginated: async (
    pageSize: number = 6, 
    lastDocSnapshot?: DocumentSnapshot, 
    roleFilter?: UserRole | 'ALL'
  ): Promise<{ data: UserProfile[], lastDoc?: DocumentSnapshot, hasMore: boolean }> => {
    try {
      const usersRef = collection(db, "users");
      let q = query(usersRef, where("isPublic", "==", true), limit(pageSize));
      
      if (roleFilter && roleFilter !== 'ALL') {
        q = query(usersRef, where("isPublic", "==", true), where("role", "==", roleFilter), limit(pageSize));
      }

      if (lastDocSnapshot) {
        q = query(q, startAfter(lastDocSnapshot));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as UserProfile));
      
      return { 
        data, 
        lastDoc: snapshot.docs[snapshot.docs.length - 1], 
        hasMore: snapshot.docs.length === pageSize 
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs publics:', error);
      throw new Error('Impossible de charger les utilisateurs.');
    }
  },

  getExpertsPaginated: async (
    pageSize: number = 6, 
    lastDocSnapshot?: DocumentSnapshot
  ): Promise<{ data: UserProfile[], lastDoc?: DocumentSnapshot, hasMore: boolean }> => {
    return userService.getPublicUsersPaginated(pageSize, lastDocSnapshot, UserRole.PROFESSIONNEL);
  },

  submitDocument: async (userId: string, type: string, fileUrl: string): Promise<{ success: boolean, status: DocumentStatus }> => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Utilisateur introuvable');
      }

      const userData = userSnap.data() as UserProfile;
      const documents = userData.documents || [];

      // Mise à jour ou ajout du document
      const existingDocIndex = documents.findIndex(d => d.type === type);
      const newDoc = {
        type,
        status: DocumentStatus.PENDING,
        url: fileUrl,
        uploadedAt: new Date().toISOString()
      };

      if (existingDocIndex > -1) {
        documents[existingDocIndex] = newDoc;
      } else {
        documents.push(newDoc);
      }

      await updateDoc(userRef, { 
        documents,
        updatedAt: serverTimestamp()
      });

      return { success: true, status: DocumentStatus.PENDING };
    } catch (error) {
      console.error('Erreur lors de la soumission du document:', error);
      throw new Error('Impossible de soumettre le document.');
    }
  },

  verifyUser: async (userId: string, status: VerificationStatus): Promise<boolean> => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { 
        verificationStatus: status,
        verifiedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      throw new Error('Impossible de vérifier l\'utilisateur.');
    }
  }
};
