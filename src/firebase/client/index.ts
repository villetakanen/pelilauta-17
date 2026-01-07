/**
 * Client side firebase configuration and app initialization
 */
import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_apiKey,
  authDomain: import.meta.env.PUBLIC_authDomain,
  databaseURL: import.meta.env.PUBLIC_databaseURL,
  projectId: import.meta.env.PUBLIC_projectId,
  storageBucket: import.meta.env.PUBLIC_storageBucket,
  messagingSenderId: import.meta.env.PUBLIC_messagingSenderId,
  appId: import.meta.env.PUBLIC_appId,
  measurementId: import.meta.env.PUBLIC_measurementId,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Debug: Trace sign outs
const originalSignOut = auth.signOut.bind(auth);
auth.signOut = async () => {
  console.log('🐞 auth.signOut called!');
  console.trace('SignOut Trace');
  return originalSignOut();
};
// export const storage = getStorage(app);

// Force localStorage persistence for E2E tests (Playwright cannot capture IndexedDB easily)
// Only enable this when automation is detected (navigator.webdriver) to avoid race conditions
// during normal development (which caused the "logout" issues).
if (
  typeof window !== 'undefined' &&
  window.location.hostname === 'localhost' &&
  navigator.webdriver
) {
  console.log('🤖 Automation detected: forcing localStorage persistence');
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn('Failed to set auth persistence:', error);
  });
}
