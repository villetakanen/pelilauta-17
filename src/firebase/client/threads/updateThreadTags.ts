import { TAG_FIRESTORE_COLLECTION, TagSchema } from '@schemas/TagSchema';
import type { Thread } from '@schemas/ThreadSchema';
import { logError, logWarn } from '@utils/logHelpers';
import { toDate } from '@utils/schemaHelpers';

async function removeTags(key: string) {
  // remove the page tags entry from the tags collection
  const { getFirestore, deleteDoc, doc } = await import('firebase/firestore');
  try {
    await deleteDoc(doc(getFirestore(), TAG_FIRESTORE_COLLECTION, key));
  } catch (e) {
    logError('removeTags', e);
  }
}

async function setTags(thread: Partial<Thread>) {
  // set the page tags entry to the tags collection
  const { getFirestore, setDoc, doc } = await import('firebase/firestore');

  const tagData = TagSchema.parse({
    key: `${thread.key}`,
    title: thread.title,
    type: 'thread',
    author: thread.owners?.[0] || '',
    tags: thread.tags,
    flowTime: toDate(thread.flowTime).getTime(),
  });

  try {
    await setDoc(
      doc(getFirestore(), TAG_FIRESTORE_COLLECTION, `${thread.key}`),
      tagData,
    );
  } catch (e) {
    logError('setTags', e);
  }
}

export async function updateThreadTags(thread: Partial<Thread>) {
  const tags = thread.tags;
  if (!thread.key) {
    logWarn('updateThreadTags', 'Thread key is required for a tags update');
  }
  if (!thread.owners) {
    logWarn('updateThreadTags', 'Thread owners are required for a tags update');
  }
  if (!tags) {
    await removeTags(`${thread.key}`);
  } else {
    await setTags(thread);
  }
}
