import { serverDB } from '@firebase/server';
import { parseReply, REPLIES_COLLECTION } from '@schemas/ReplySchema';
import { THREADS_COLLECTION_NAME } from '@schemas/ThreadSchema';
import { toClientEntry } from '@utils/client/entryUtils';
import type { APIContext } from 'astro';

export async function GET({ params }: APIContext): Promise<Response> {
  const { threadKey, replyKey } = params;

  if (!threadKey || !replyKey) {
    return new Response('Invalid request', { status: 400 });
  }

  const replyDoc = await serverDB
    .collection(THREADS_COLLECTION_NAME)
    .doc(threadKey)
    .collection(REPLIES_COLLECTION)
    .doc(replyKey)
    .get();

  const data = replyDoc.data();

  if (!replyDoc.exists || !data) {
    return new Response('Reply not found', { status: 404 });
  }

  try {
    const reply = parseReply(toClientEntry(data), replyKey, threadKey);
    return new Response(JSON.stringify(reply), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=60, stale-while-revalidate',
      },
    });
  } catch (_err: unknown) {
    return new Response('Invalid thread data', { status: 500 });
  }
}
