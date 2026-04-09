import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const REQUIRED_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
] as const;

let _db: Firestore | null = null;

/**
 * Returns the Firestore instance, initializing Firebase on first call.
 * Throws if the required VITE_FIREBASE_* env vars are not set.
 */
export function getDb(): Firestore {
  if (_db) return _db;

  const missing = REQUIRED_ENV_KEYS.filter((key) => !import.meta.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase env vars: ${missing.join(', ')}. Populate them in your .env.local file.`
    );
  }

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  _db = getFirestore(app);
  return _db;
}
