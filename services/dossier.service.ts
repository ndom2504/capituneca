
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { Dossier, DossierStatus, UserRole, DocumentStatus, DossierMessage, Appointment } from '../types';

// Templates par défaut pour les nouveaux dossiers
const DEFAULT_STEPS = [
  { id: '1', label: 'Collecte Documents', isCompleted: false, isCurrent: true },
  { id: '2', label: 'Révision Expert', isCompleted: false, isCurrent: false },
  { id: '3', label: 'Soumission IRCC', isCompleted: false, isCurrent: false },
  { id: '4', label: 'Décision Finale', isCompleted: false, isCurrent: false },
];

const DEFAULT_CHECKLIST = [
  { id: 'c1', label: 'Passeport valide', status: DocumentStatus.MISSING },
  { id: 'c2', label: 'Preuve de fonds', status: DocumentStatus.MISSING },
  { id: 'c3', label: 'Lettre admission', status: DocumentStatus.MISSING },
];

export const dossierService = {
  getDossiersPaginated: async (
    role: UserRole, 
    pageSize: number = 8, 
    lastDocSnapshot?: DocumentSnapshot
  ): Promise<{ data: Dossier[], lastDoc?: DocumentSnapshot, hasMore: boolean }> => {
    try {
      const dossiersRef = collection(db, 'dossiers');
      let q = query(dossiersRef, orderBy('updatedAt', 'desc'), limit(pageSize));

      // Filtrage par rôle
      if (role === UserRole.PARTICULIER) {
        const userId = localStorage.getItem('capitune_userId') || 'current-user';
        q = query(dossiersRef, where('clientId', '==', userId), orderBy('updatedAt', 'desc'), limit(pageSize));
      } else if (role === UserRole.PROFESSIONNEL) {
        const expertId = localStorage.getItem('capitune_userId') || 'current-expert';
        q = query(
          dossiersRef, 
          where('expertId', 'in', [expertId, null]),
          orderBy('updatedAt', 'desc'), 
          limit(pageSize)
        );
      }

      // Pagination
      if (lastDocSnapshot) {
        q = query(q, startAfter(lastDocSnapshot));
      }

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Dossier));

      return { 
        data, 
        lastDoc: snapshot.docs[snapshot.docs.length - 1], 
        hasMore: snapshot.docs.length === pageSize 
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des dossiers:', error);
      throw new Error('Impossible de charger les dossiers. Veuillez réessayer.');
    }
  },

  getDossierById: async (id: string): Promise<Dossier | null> => {
    try {
      const dossierRef = doc(db, 'dossiers', id);
      const dossierSnap = await getDoc(dossierRef);

      if (!dossierSnap.exists()) {
        return null;
      }

      return { id: dossierSnap.id, ...dossierSnap.data() } as Dossier;
    } catch (error) {
      console.error('Erreur lors de la récupération du dossier:', error);
      throw new Error('Impossible de charger le dossier.');
    }
  },

  sendMessage: async (
    dossierId: string, 
    content: string, 
    sender: { id: string, name: string }
  ): Promise<DossierMessage> => {
    try {
      const messagesRef = collection(db, 'dossiers', dossierId, 'messages');
      const newMessage = {
        senderId: sender.id,
        senderName: sender.name,
        content,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(messagesRef, newMessage);
      
      return {
        id: docRef.id,
        ...newMessage,
        timestamp: 'À l\'instant'
      } as DossierMessage;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw new Error('Impossible d\'envoyer le message.');
    }
  },

  bookAppointment: async (
    dossierId: string, 
    date: string, 
    time: string, 
    expert: { id: string, name: string }
  ): Promise<Appointment> => {
    try {
      const appointmentsRef = collection(db, 'dossiers', dossierId, 'appointments');
      const newAppointment = {
        date,
        time,
        status: 'pending' as const,
        expertId: expert.id,
        expertName: expert.name,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(appointmentsRef, newAppointment);

      return {
        id: docRef.id,
        ...newAppointment
      } as Appointment;
    } catch (error) {
      console.error('Erreur lors de la réservation du rendez-vous:', error);
      throw new Error('Impossible de réserver le rendez-vous.');
    }
  },

  transmitToExpert: async (dossierId: string, expertId: string): Promise<boolean> => {
    try {
      const dossierRef = doc(db, 'dossiers', dossierId);
      await updateDoc(dossierRef, {
        status: DossierStatus.EN_ATTENTE_EXPERT,
        expertRequestedId: expertId,
        transmissionDate: new Date().toLocaleDateString(),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la transmission à l\'expert:', error);
      throw new Error('Impossible de transmettre le dossier.');
    }
  },

  acceptDossier: async (dossierId: string, expertId: string): Promise<boolean> => {
    try {
      const dossierRef = doc(db, 'dossiers', dossierId);
      await updateDoc(dossierRef, {
        status: DossierStatus.EN_COURS,
        expertId: expertId,
        expertRequestedId: null,
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'acceptation du dossier:', error);
      throw new Error('Impossible d\'accepter le dossier.');
    }
  },

  rejectDossier: async (dossierId: string): Promise<boolean> => {
    try {
      const dossierRef = doc(db, 'dossiers', dossierId);
      await updateDoc(dossierRef, {
        status: DossierStatus.OUVERT,
        expertRequestedId: null,
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors du rejet du dossier:', error);
      throw new Error('Impossible de rejeter le dossier.');
    }
  }
};
