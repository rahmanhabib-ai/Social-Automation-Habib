import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let app: any = null;
let dbInstance: Firestore | null = null;

export function getFirebaseApp() {
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getDb(): Firestore {
  if (!dbInstance) {
    const appInstance = getFirebaseApp();
    dbInstance = getFirestore(appInstance);
  }
  return dbInstance;
}

export const auth = getAuth(getFirebaseApp());
export const googleAuthProvider = new GoogleAuthProvider();
