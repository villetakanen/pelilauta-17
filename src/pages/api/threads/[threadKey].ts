import { serverDB } from '@firebase/server';
import { isAdmin } from '@firebase/server/admin';
import {
  CHANNELS_META_REF,
  type Channel,
  ChannelSchema,
} from '@schemas/ChannelSchema';
import { THREADS_COLLECTION_NAME, ThreadSchema } from '@schemas/ThreadSchema';
import { logError, logWarn } from '@utils/logHelpers';
import { tokenToUid } from '@utils/server/auth/tokenToUid';
import type { APIContext } from 'astro';

export async function DELETE({ request, params }: APIContext) {
  const { threadKey } = params;
  const uid = await tokenToUid(request);

  if (!uid) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!threadKey) {
    return new Response('Bad Request: Missing threadKey', { status: 400 });
  }

  const threadRef = serverDB.collection(THREADS_COLLECTION_NAME).doc(threadKey);

  try {
    const threadDoc = await threadRef.get();

    if (!threadDoc.exists) {
      return new Response('Not Found', { status: 404 });
    }

    const thread = ThreadSchema.parse(threadDoc.data());

    const isOwner = thread.owners.includes(uid);
    const userIsAdmin = await isAdmin(uid);

    if (!isOwner && !userIsAdmin) {
      return new Response('Forbidden', { status: 403 });
    }

    // Critical task: Delete the thread document
    await threadRef.delete();

    // Respond immediately
    // Background task: Update channel thread count
    if (thread.channel) {
      const metaRef = serverDB.doc(CHANNELS_META_REF);
      metaRef
        .get()
        .then((doc) => {
          if (!doc.exists) return;
          const topics = doc.data()?.topics || [];
          const channels: Channel[] = topics.map((t: unknown) =>
            ChannelSchema.parse(t),
          );
          const channelIndex = channels.findIndex(
            (c: Channel) => c.slug === thread.channel,
          );
          if (channelIndex > -1) {
            channels[channelIndex].threadCount =
              (channels[channelIndex].threadCount || 1) - 1;
            metaRef.update({ topics: channels }).catch((err) => {
              logWarn(
                'deleteThread-background',
                `Failed to update topics in ${CHANNELS_META_REF}`,
                err,
              );
            });
          }
        })
        .catch((err) => {
          logWarn(
            'deleteThread-background',
            `Failed to get ${CHANNELS_META_REF}`,
            err,
          );
        });
    }

    return new Response(null, { status: 202 });
  } catch (error) {
    logError('deleteThread', 'Failed to delete thread:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
