
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration Firebase utilisant les variables d'environnement Vite (import.meta.env)
const firebaseConfig = {
  apiKey:
    import.meta.env.FIREBASE_API_KEY ||
    import.meta.env.VITE_FIREBASE_API_KEY ||
    (process.env as any).FIREBASE_API_KEY,
  authDomain:
    import.meta.env.FIREBASE_AUTH_DOMAIN ||
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    (process.env as any).FIREBASE_AUTH_DOMAIN,
  projectId:
    import.meta.env.FIREBASE_PROJECT_ID ||
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    (process.env as any).FIREBASE_PROJECT_ID,
  storageBucket:
    import.meta.env.FIREBASE_STORAGE_BUCKET ||
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    (process.env as any).FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    import.meta.env.FIREBASE_MESSAGING_SENDER_ID ||
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    (process.env as any).FIREBASE_MESSAGING_SENDER_ID,
  appId:
    import.meta.env.FIREBASE_APP_ID ||
    import.meta.env.VITE_FIREBASE_APP_ID ||
    (process.env as any).FIREBASE_APP_ID,
  measurementId:
    import.meta.env.FIREBASE_MEASUREMENT_ID ||
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
    (process.env as any).FIREBASE_MEASUREMENT_ID
};

// Validation de la configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is missing. Please check your .env.local file.');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
