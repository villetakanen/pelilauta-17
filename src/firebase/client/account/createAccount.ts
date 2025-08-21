import { ACCOUNTS_COLLECTION_NAME, type Account } from '@schemas/AccountSchema';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '..';

export async function createAccount(data: Partial<Account>, uid: string) {
  const accountRef = doc(db, ACCOUNTS_COLLECTION_NAME, uid);

  const existingAccount = await getDoc(accountRef);
  if (existingAccount.exists()) {
    throw new Error('Account already exists');
  }

  const account = {
    ...data,
    uid,
    lastLogin: serverTimestamp(),
    updatedAt: serverTimestamp(),
    eulaAccepted: true,
    lightMode: window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark',
  };

  await setDoc(accountRef, account);
}
