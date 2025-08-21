import { ACCOUNTS_COLLECTION_NAME } from '@schemas/AccountSchema';
import { logError } from '@utils/logHelpers';

export async function setFrozen(frozen: boolean, accountUid: string) {
  const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
  const { uid } = await import('@stores/session');
  const { appMeta } = await import('@stores/metaStore/metaStore');

  if (!appMeta.get().admins.includes(uid.get())) {
    logError(
      'Aborted setFrozen: Firestore would stop the operation due to security rules',
    );
    throw new Error('Unauthorized');
  }

  const accountRef = doc(getFirestore(), ACCOUNTS_COLLECTION_NAME, accountUid);

  await updateDoc(accountRef, {
    frozen,
  });
}
