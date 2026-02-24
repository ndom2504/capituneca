import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Vercel fournit les variables via process.env au moment du build.
    // loadEnv() ne lit que les fichiers .env*, donc on fusionne les deux.
    const fileEnv = loadEnv(mode, '.', '');
    const env: Record<string, string | undefined> = { ...process.env, ...fileEnv };
    const firebaseApiKey = env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY;
    const firebaseAuthDomain = env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN;
    const firebaseProjectId = env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID;
    const firebaseStorageBucket = env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET;
    const firebaseMessagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.FIREBASE_MESSAGING_SENDER_ID;
    const firebaseAppId = env.VITE_FIREBASE_APP_ID || env.FIREBASE_APP_ID;
    const firebaseMeasurementId = env.VITE_FIREBASE_MEASUREMENT_ID || env.FIREBASE_MEASUREMENT_ID;

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.FIREBASE_API_KEY': JSON.stringify(firebaseApiKey),
        'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(firebaseAuthDomain),
        'process.env.FIREBASE_PROJECT_ID': JSON.stringify(firebaseProjectId),
        'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(firebaseStorageBucket),
        'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(firebaseMessagingSenderId),
        'process.env.FIREBASE_APP_ID': JSON.stringify(firebaseAppId),
        'process.env.FIREBASE_MEASUREMENT_ID': JSON.stringify(firebaseMeasurementId),
        'import.meta.env.FIREBASE_API_KEY': JSON.stringify(firebaseApiKey),
        'import.meta.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(firebaseAuthDomain),
        'import.meta.env.FIREBASE_PROJECT_ID': JSON.stringify(firebaseProjectId),
        'import.meta.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(firebaseStorageBucket),
        'import.meta.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(firebaseMessagingSenderId),
        'import.meta.env.FIREBASE_APP_ID': JSON.stringify(firebaseAppId),
        'import.meta.env.FIREBASE_MEASUREMENT_ID': JSON.stringify(firebaseMeasurementId),
        'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(firebaseApiKey),
        'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(firebaseAuthDomain),
        'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(firebaseProjectId),
        'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(firebaseStorageBucket),
        'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(firebaseMessagingSenderId),
        'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(firebaseAppId),
        'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(firebaseMeasurementId)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
