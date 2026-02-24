
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  sendEmailVerification,
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider,
  OAuthProvider,
  fetchSignInMethodsForEmail,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  getIdTokenResult
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserRole, UserProfile, VerificationStatus } from '../types';

const resolveRoleForUser = async (user: any, roleFallback?: UserRole): Promise<UserRole | null> => {
  // 1) Custom claims
  try {
    const tokenResult = await getIdTokenResult(user, true);
    const tokenRole = tokenResult.claims.role as UserRole | undefined;
    if (tokenRole) {
      localStorage.setItem('capitune_role', tokenRole);
      return tokenRole;
    }
  } catch {
    // ignore
  }

  // 2) Firestore
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      if (userData?.role) {
        localStorage.setItem('capitune_role', userData.role);
        return userData.role;
      }
    }
  } catch {
    // ignore
  }

  // 3) Fallback
  if (roleFallback) {
    localStorage.setItem('capitune_role', roleFallback);
    return roleFallback;
  }
  return (localStorage.getItem('capitune_role') as UserRole | null) || null;
};

export const authService = {
  getStoredRole: (): UserRole | null => {
    const saved = localStorage.getItem('capitune_role');
    return saved ? (saved as UserRole) : null;
  },

  signupWithEmail: async (email: string, password: string, role: UserRole): Promise<void> => {
    // Stocker le rôle choisi pour la création de profil
    sessionStorage.setItem('capitune_pending_role', role);
    localStorage.setItem('capitune_pending_role', role);

    // Si le compte existe déjà, on peut directement renvoyer vers la vérification
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods && methods.length > 0) {
        const err: any = new Error('Account already exists');
        err.code = 'auth/email-already-in-use';
        throw err;
      }
    } catch (e: any) {
      // Si fetchSignInMethods échoue (config/API), laisser createUser gérer l'erreur.
      if (e?.code === 'auth/email-already-in-use') throw e;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Envoyer l'email de vérification (best-effort).
    // NOTE: La vérification n'est pas bloquante pour le moment.
    try {
      await sendEmailVerification(user);
    } catch {
      // ignore
    }

    // Créer un profil minimal en base (sans bloquer l'utilisateur en cas de Firestore indisponible)
    const userDocRef = doc(db, 'users', user.uid);
    const newUserProfile: any = {
      fullName: user.displayName || '',
      role,
      email: user.email || email,
      isPublic: true,
      verificationStatus: VerificationStatus.PENDING,
      points: 0,
      tutorialStep: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(userDocRef, newUserProfile, { merge: true } as any);
    } catch (persistError) {
      console.warn('⚠️ Impossible de persister le profil (Firestore indisponible):', persistError);
    }

    // NOTE: On laisse l'utilisateur connecté même si l'email n'est pas vérifié
    // afin de ne pas bloquer l'accès en cas de délivrabilité email défaillante.
  },

  resendEmailVerification: async (email: string, password: string): Promise<void> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    await signOut(auth);
  },

  /**
   * Note: Dans un environnement réel, le rôle est injecté dans le jeton ID 
   * via une Cloud Function après la création du document utilisateur.
   */
  login: async (email?: string, password?: string, role?: UserRole): Promise<UserRole | null> => {
    if (email && password) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // NOTE: La vérification email est désactivée (non bloquante) pour le moment.
      // On peut la réactiver plus tard une fois la délivrabilité email confirmée.
      
      // On vérifie d'abord si le rôle est dans le token (Custom Claims)
      const tokenResult = await getIdTokenResult(user);
      const tokenRole = tokenResult.claims.role as UserRole;
      
      if (tokenRole) {
        localStorage.setItem('capitune_role', tokenRole);
        return tokenRole;
      }

      // Fallback: Récupérer le rôle depuis Firestore si le token n'est pas encore propagé
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        localStorage.setItem('capitune_role', userData.role);
        return userData.role;
      }
    }
    
    // Fallback pour la démo locale ou accès direct
    if (role) {
      localStorage.setItem('capitune_role', role);
      return role;
    }
    return null;
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
    localStorage.removeItem('capitune_role');
  },

  getCurrentUser: () => auth.currentUser,

  resolveRoleAfterAuth: async (roleFallback?: UserRole): Promise<UserRole | null> => {
    const user = auth.currentUser;
    if (!user) return null;
    return resolveRoleForUser(user, roleFallback);
  },

  onAuthChange: (callback: (role: UserRole | null) => void) => {
    return onAuthStateChanged(auth, async (user) => {
      console.log("🔥 onAuthStateChanged Triggered:", user ? user.uid : "No User");

      if (!user) {
        console.log("👋 Déconnexion détectée");
        localStorage.removeItem('capitune_role');
        callback(null);
        return;
      }

      const pendingRole = (sessionStorage.getItem('capitune_pending_role')
        || localStorage.getItem('capitune_pending_role')) as UserRole | null;

      try {
        // 1) Custom claims (idéal)
        const tokenResult = await getIdTokenResult(user, true);
        const tokenRole = tokenResult.claims.role as UserRole | undefined;
        if (tokenRole) {
          console.log("✅ Rôle trouvé dans le token:", tokenRole);
          localStorage.setItem('capitune_role', tokenRole);
          callback(tokenRole);
          return;
        }

        // 2) Fallback Firestore (peut échouer si offline)
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            if (userData.role) {
              console.log("✅ Rôle trouvé dans Firestore:", userData.role);
              localStorage.setItem('capitune_role', userData.role);
              callback(userData.role);
              return;
            }

            console.warn("⚠️ User sans rôle dans Firestore");
            const lastKnownRole = localStorage.getItem('capitune_role') as UserRole | null;
            callback(pendingRole || lastKnownRole || null);
            return;
          }

          // 3) Première connexion: création de profil (ne doit pas casser si Firestore offline)
          if (pendingRole) {
            console.log("🛠️ Création profil de secours avec rôle:", pendingRole);
            const newUserProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              role: pendingRole,
              verificationStatus: VerificationStatus.PENDING,
              points: 0,
              tutorialStep: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            // Optimiste: on ne bloque pas l'UI sur Firestore
            localStorage.setItem('capitune_role', pendingRole);
            callback(pendingRole);

            try {
              await setDoc(userDocRef, newUserProfile);
            } catch (persistError) {
              console.warn('⚠️ Impossible de persister le profil (Firestore indisponible):', persistError);
            }
            return;
          }

          // Dernier recours
          const lastKnownRole = localStorage.getItem('capitune_role') as UserRole | null;
          if (lastKnownRole) {
            console.log("⚠️ Récupération dernier rôle connu:", lastKnownRole);
            callback(lastKnownRole);
            return;
          }

          console.error("❌ Utilisateur authentifié sans aucune trace de rôle");
          callback(null);
          return;
        } catch (firestoreError) {
          // Typiquement: FirebaseError: Failed to get document because the client is offline.
          console.warn('⚠️ Firestore indisponible, fallback rôle local:', firestoreError);
          const lastKnownRole = localStorage.getItem('capitune_role') as UserRole | null;
          callback(pendingRole || lastKnownRole || null);
          return;
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du rôle:", error);
        const lastKnownRole = localStorage.getItem('capitune_role') as UserRole | null;
        callback(pendingRole || lastKnownRole || null);
      }
    });
  },

  hasPermission: (userRole: UserRole | null, allowedRoles: UserRole[]): boolean => {
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  },

  processRedirectResult: async (): Promise<UserRole | null> => {
    try {
      const result = await getRedirectResult(auth);
      if (!result || !result.user) return null;

      const user = result.user;
      let pendingRole = (sessionStorage.getItem('capitune_pending_role')
        || localStorage.getItem('capitune_pending_role')) as UserRole | null;

      // Nettoyage après récupération
      if (pendingRole) {
        sessionStorage.removeItem('capitune_pending_role');
        localStorage.removeItem('capitune_pending_role');
      }

      // 1. Vérifier si le rôle est déjà dans les claims (cas idéal)
      const tokenResult = await getIdTokenResult(user);
      const tokenRole = tokenResult.claims.role as UserRole | undefined;
      if (tokenRole) {
        localStorage.setItem('capitune_role', tokenRole);
        return tokenRole;
      }

      // 2. Vérifier si l'utilisateur existe déjà en base
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        if (userData.role) {
          localStorage.setItem('capitune_role', userData.role);
          return userData.role;
        }
      }

      // 3. Cas de la première connexion (création de compte)
      if (pendingRole) {
        const newUserProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: pendingRole,
          verificationStatus: VerificationStatus.PENDING,
          points: 0,
          tutorialStep: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await setDoc(userDocRef, newUserProfile);
        localStorage.setItem('capitune_role', pendingRole);
        return pendingRole;
      }
      
      return null;
    } catch (error) {
      console.error("Erreur dans processRedirectResult:", error);
      return null;
    }
  },

  /**
   * Connexion avec Google - Force l'affichage du sélecteur de compte
   */
  loginWithGoogle: async (role: UserRole): Promise<UserRole | null> => {
    try {
      const provider = new GoogleAuthProvider();
      // Force Google à afficher le sélecteur de compte à chaque fois
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Vérifier si l'utilisateur existe déjà dans Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Utilisateur existant - récupérer son rôle
        const userData = userDoc.data() as UserProfile;
        localStorage.setItem('capitune_role', userData.role);
        return userData.role;
      } else {
        // Nouvel utilisateur - créer le profil avec le rôle choisi
        const newUserProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: role,
          verificationStatus: VerificationStatus.PENDING,
          points: 0,
          tutorialStep: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(userDocRef, newUserProfile);
        localStorage.setItem('capitune_role', role);
        return role;
      }
    } catch (error: any) {
      console.error('Erreur connexion Google:', error);
      throw error;
    }
  },

  /**
   * Connexion Google via redirection (plus fiable que popup)
   * NOTE: Modifié temporairement pour utiliser Popup car Redirect pose problème en production (boucle)
   */
  loginWithGoogleRedirect: async (role: UserRole): Promise<void> => {
    sessionStorage.setItem('capitune_pending_role', role);
    localStorage.setItem('capitune_pending_role', role);
    // On utilise la logique de loginWithGoogle (Popup) mais on garde la signature void
    // pour ne pas casser les appelants.
    await authService.loginWithGoogle(role); 
  },

  /**
   * Connexion avec Microsoft - Force l'affichage du sélecteur de compte
   */
  loginWithMicrosoft: async (role: UserRole): Promise<UserRole | null> => {
    try {
      const provider = new OAuthProvider('microsoft.com');
      // Force Microsoft à afficher le sélecteur de compte
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Vérifier si l'utilisateur existe déjà dans Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Utilisateur existant - récupérer son rôle
        const userData = userDoc.data() as UserProfile;
        localStorage.setItem('capitune_role', userData.role);
        return userData.role;
      } else {
        // Nouvel utilisateur - créer le profil avec le rôle choisi
        const newUserProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: role,
          verificationStatus: VerificationStatus.PENDING,
          points: 0,
          tutorialStep: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(userDocRef, newUserProfile);
        localStorage.setItem('capitune_role', role);
        return role;
      }
    } catch (error: any) {
      console.error('Erreur connexion Microsoft:', error);
      throw error;
    }
  },

  /**
   * Connexion Microsoft via redirection (plus fiable que popup)
   * NOTE: Modifié temporairement pour utiliser Popup car Redirect pose problème en production (boucle)
   */
  loginWithMicrosoftRedirect: async (role: UserRole): Promise<void> => {
    sessionStorage.setItem('capitune_pending_role', role);
    localStorage.setItem('capitune_pending_role', role);
    // On utilise la logique de loginWithMicrosoft (Popup) mais on garde la signature void
    await authService.loginWithMicrosoft(role);
  }
};