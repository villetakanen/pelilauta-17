import { NOTIFICATION_FIRESTORE_COLLECTION } from '@schemas/NotificationSchema';
import { logDebug } from '@utils/logHelpers';

export async function markRead(key: string, read: boolean) {
  const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
  const db = getFirestore();
  const notificationDoc = doc(db, NOTIFICATION_FIRESTORE_COLLECTION, key);
  logDebug(
    '@firebase/client/inbox/markRead',
    `Marking notification ${key} as read: ${read}`,
  );
  await updateDoc(notificationDoc, { read });
}
