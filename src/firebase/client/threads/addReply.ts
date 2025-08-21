import { NotificationRequestSchema } from '@schemas/NotificationSchema';
import {
  REACTIONS_COLLECTION_NAME,
  type Reactions,
} from '@schemas/ReactionsSchema';
import { REPLIES_COLLECTION, type Reply } from '@schemas/ReplySchema';
import {
  type ImageArraySchema,
  THREADS_COLLECTION_NAME,
  type Thread,
} from '@schemas/ThreadSchema';
import { createSnippet } from '@utils/contentHelpers';
import { logWarn } from '@utils/logHelpers';
import type { z } from 'astro/zod';
import { authedPost } from '../apiClient';
import { addAssetToThread } from './addAssetToThread';

/**
 * Adds a reply to a thread and sends notifications to thread owners
 * @param thread - The thread to add the reply to
 * @param author - The author's UID
 * @param markdownContent - The reply content in markdown
 * @param quoteref - Optional reference to quoted message
 * @param files - Optional files to upload
 * @returns Promise that resolves when reply is added (notifications are non-blocking)
 */
export async function addReply(
  thread: Thread,
  author: string,
  markdownContent: string,
  quoteref?: string,
  files: File[] = [],
): Promise<void> {
  const { db } = await import('@firebase/client');
  const {
    serverTimestamp,
    addDoc,
    collection,
    increment,
    doc,
    updateDoc,
    setDoc,
  } = await import('firebase/firestore');
  const { toFirestoreEntry } = await import('@utils/client/toFirestoreEntry');

  // Add a new reply to the thread
  const replyData: Partial<Reply> = {
    threadKey: thread.key,
    markdownContent, // Fixed typo
    owners: [author],
  };
  if (quoteref) replyData.quoteref = quoteref;

  if (files.length > 0) {
    const uploadedImages: z.infer<typeof ImageArraySchema> = [];
    for (const file of files) {
      const { downloadURL: url } = await addAssetToThread(thread.key, file);
      const alt = file.name;
      uploadedImages.push({ url, alt });
    }
    replyData.images = uploadedImages;
  }

  const data = toFirestoreEntry(replyData);

  const reply = await addDoc(
    collection(db, THREADS_COLLECTION_NAME, thread.key, REPLIES_COLLECTION),
    data,
  );

  // Update the thread with the new reply count and flow time (last reply/update/change time)
  await updateDoc(doc(db, THREADS_COLLECTION_NAME, thread.key), {
    replyCount: increment(1),
    flowTime: serverTimestamp(),
  });

  // Add a notification to the thread creator (the first owner of the thread)
  const targetTitle =
    markdownContent.length > 50 // Fixed typo
      ? `${markdownContent.substring(0, 50)}...`
      : markdownContent;

  const reactions: Reactions = {
    subscribers: [...thread.owners],
    love: [],
  };
  // Add the reactions to the reply
  await setDoc(doc(db, REACTIONS_COLLECTION_NAME, reply.id), reactions);

  // If the author of the reply is the same as the thread creator,
  // we don't need to add a notification to the thread creator
  if (thread.owners[0] === author) return;

  const notification = NotificationRequestSchema.parse({
    notification: {
      key: '',
      targetType: 'thread.reply',
      targetKey: thread.key,
      targetTitle,
      message: createSnippet(markdownContent, 120), // Fixed typo
    },
    // Intentionally only notify the first owner of the thread (i.e.)
    // the thread creator, not all owners.
    recipients: [thread.owners[0]],
    from: author,
  });

  // Add a notification for the thread owner. We do not wait
  // for this to complete, as it is not critical for the notification
  // to be sent immediately, or at all. Ie. Notifications are a convienience
  // feature, not a critical feature.
  authedPost('/api/notifications/send', {
    body: notification,
  }).catch((error) => {
    // Log but don't throw - notifications are non-critical
    logWarn('addReply', 'Failed to send notification:', error);
  });
}
