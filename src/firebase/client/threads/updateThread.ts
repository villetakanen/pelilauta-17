import { THREADS_COLLECTION_NAME, type Thread } from '@schemas/ThreadSchema';

export async function updateThread(data: Partial<Thread>) {
  if (!data.key) {
    throw new Error('Thread key is required to update thread');
  }

  const { doc, getFirestore, updateDoc, serverTimestamp } = await import(
    'firebase/firestore'
  );
  const threadRef = doc(getFirestore(), THREADS_COLLECTION_NAME, data.key);
  await updateDoc(threadRef, {
    ...data,
    flowTime: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
