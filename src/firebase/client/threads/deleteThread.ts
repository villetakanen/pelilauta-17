import { ChannelsSchema } from '@schemas/ChannelSchema';
import { THREADS_COLLECTION_NAME, type Thread } from '@schemas/ThreadSchema';

/**
 * Delete a thread from the database and update the channel thread count. Please
 * note that the authz is checked in the server, so this function throws an error
 * if the thread does not exist or if the user does not have permission to delete
 * it.
 *
 * @param thread a Thread object to be deleted
 */
export async function deleteThread(thread: Thread) {
  const { db } = await import('..');
  const { deleteDoc, doc } = await import('firebase/firestore');

  if (!thread.key) throw new Error('Thread key is required to delete a thread');

  await deleteDoc(doc(db, THREADS_COLLECTION_NAME, thread.key));

  await updateChannelThreadCount(thread);
}

/**
 * Helper function to update the thread count of a channel (if it exists) when a
 * thread is deleted. This function is called from the deleteThread function.
 *
 * @param thread the Thread object that was deleted
 */
async function updateChannelThreadCount(thread: Thread) {
  const { db } = await import('..');
  const { doc, updateDoc, getDoc } = await import('firebase/firestore');
  // Update thread count of the channel
  if (thread.channel) {
    const threadsMetaDoc = await getDoc(doc(db, 'meta', 'threads'));
    const threadsMeta = threadsMetaDoc.data();
    const channelsArray = ChannelsSchema.parse(threadsMeta?.topics || []);

    const channel = channelsArray.find((c) => c.slug === thread.channel);
    if (channel) {
      const threadCount = channel.threadCount || 1; // Default to 1 if undefined, so we don't go negative
      const updatedChannel = {
        ...channel,
        threadCount: threadCount - 1,
      };
      const updatedChannels = channelsArray.map((c) =>
        c.slug === thread.channel ? updatedChannel : c,
      );
      await updateDoc(doc(db, 'meta', 'threads'), {
        topics: updatedChannels,
      });
    }
  }
}
