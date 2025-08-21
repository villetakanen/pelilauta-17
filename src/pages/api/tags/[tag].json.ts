import { serverDB } from '@firebase/server';
import {
  TAG_FIRESTORE_COLLECTION,
  type Tag,
  TagSchema,
} from '@schemas/TagSchema';
import type { APIContext } from 'astro';

/* type Thread = {
  title: string;
  key: string;
  tags: string[];
  flowTime: number;
  author: string;
};

/**
 * Fetches 20 first of the threads from the firestore, that have the given tag
 *
 * @param tag [string] The tag to search for
 * @returns [Thread[]] An array of threads that have the given tag
 * /
async function fetchThreads(tag: string) {
  const docs = serverDB
    .collection(THREADS_COLLECTION_NAME)
    .where('tags', 'array-contains', tag)
    .orderBy('flowTime', 'desc')
    .limit(20);
  const threads = await docs.get();

  const threadData: Thread[] = [];

  for (const thread of threads.docs) {
    const data = thread.data();
    threadData.push({
      title: data.title as string,
      key: thread.id as string,
      tags: data.tags || [],
      flowTime: toDate(data.flowTime).getTime(),
      author: data.owners?.[0] as string,
    });
  }

  return threadData;
} */

export async function GET({ params }: APIContext): Promise<Response> {
  const { tag } = params;

  const docs = await serverDB
    .collection(TAG_FIRESTORE_COLLECTION)
    .where('tags', 'array-contains', tag)
    .get();

  const response = {
    entries: new Array<Tag>(),
  };
  for (const doc of docs.docs) {
    console.log(doc);
    const data = doc.data();
    response.entries.push(TagSchema.parse(data));
  }

  // The same should be done for the other entries with tags, but
  // for now, we will just return the threads with the tag

  if (response.entries.length === 0) {
    return new Response('No tags found', { status: 404 });
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=10, stale-while-revalidate',
    },
  });
}
