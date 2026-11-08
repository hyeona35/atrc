import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

export interface FirebaseConfigValues {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const rawConfig: FirebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const isFirebaseConfigured: boolean = Boolean(
  rawConfig.apiKey &&
    rawConfig.apiKey !== "mock-api-key" &&
    rawConfig.projectId &&
    rawConfig.appId
);

let firebaseAppInstance: FirebaseApp | null = null;
let firebaseAuthInstance: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  try {
    if (!firebaseAppInstance) {
      firebaseAppInstance = getApps().length > 0 ? getApp() : initializeApp(rawConfig);
    }
    return firebaseAppInstance;
  } catch {
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured) return null;
  try {
    const app = getFirebaseApp();
    if (!app) return null;
    if (!firebaseAuthInstance) {
      firebaseAuthInstance = getAuth(app);
    }
    return firebaseAuthInstance;
  } catch {
    return null;
  }
}

export { rawConfig as firebaseConfig };
