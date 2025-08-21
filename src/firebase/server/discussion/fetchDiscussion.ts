import {
  REPLIES_COLLECTION,
  type Reply,
  parseReply,
} from '@schemas/ReplySchema';
import { THREADS_COLLECTION_NAME } from '@schemas/ThreadSchema';
import { toClientEntry } from '@utils/client/entryUtils';
import { fixImageData } from '@utils/fixImageData';
import { serverDB } from '..';

/**
 * Server side function to fetch a discussion related to a thread
 *
 * @param threadKey
 */
export async function fetchDiscussion(threadKey: string): Promise<Reply[]> {
  if (!threadKey) {
    return [];
  }
  const replies = serverDB
    .collection(THREADS_COLLECTION_NAME)
    .doc(threadKey)
    .collection(REPLIES_COLLECTION);

  const snapshot = await replies.get();

  const discussion: Reply[] = [];

  for (const doc of snapshot.docs) {
    const reply = parseReply(
      toClientEntry(fixImageData(doc.data())),
      doc.id,
      threadKey,
    );
    discussion.push(reply);
  }

  discussion.sort((a, b) => a.flowTime - b.flowTime);

  return discussion;
}
