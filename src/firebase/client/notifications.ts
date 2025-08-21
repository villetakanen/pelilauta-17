import {
  NOTIFICATION_FIRESTORE_COLLECTION,
  type Notification,
} from '@schemas/NotificationSchema';
import { toFirestoreEntry } from '@utils/client/toFirestoreEntry';
import { logDebug } from '@utils/logHelpers';

export async function addNotification(notification: Notification) {
  const { addDoc, getFirestore, collection, setDoc, doc } = await import(
    'firebase/firestore'
  );
  logDebug('addNotification', notification);
  const data = toFirestoreEntry(notification);
  if (!notification.key) {
    const doc = await addDoc(
      collection(getFirestore(), NOTIFICATION_FIRESTORE_COLLECTION),
      data,
    );
    return doc.id;
  }
  await setDoc(
    doc(getFirestore(), NOTIFICATION_FIRESTORE_COLLECTION, notification.key),
    data,
  );
  return notification.key;
}
