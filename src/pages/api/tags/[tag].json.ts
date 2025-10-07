import { log } from 'node:console';
import type { APIContext } from 'astro';
import {
  TAG_FIRESTORE_COLLECTION,
  type Tag,
  TagSchema,
} from 'src/schemas/TagSchema';
import { getTagDisplayInfo, resolveTagSynonym } from 'src/schemas/TagSynonyms';
import { serverDB } from '../../../firebase/server';

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

  if (!tag) {
    return new Response('Tag required', { status: 400 });
  }

  // Resolve synonym to canonical tag
  const canonicalTag = resolveTagSynonym(tag);
  const tagInfo = getTagDisplayInfo(canonicalTag);

  // Fetch entries for canonical tag AND its synonyms
  const allTags = tagInfo
    ? [canonicalTag, ...tagInfo.synonyms]
    : [canonicalTag];

  log(`Fetching entries for tags: ${allTags.join(', ')}`);

  // Query for all variations using array-contains-any
  const docs = await serverDB
    .collection(TAG_FIRESTORE_COLLECTION)
    .where('tags', 'array-contains-any', allTags)
    .orderBy('flowTime', 'desc')
    .limit(50)
    .get();

  const response = {
    entries: [] as Tag[],
    canonical: canonicalTag,
    displayName: tagInfo?.displayName || canonicalTag,
    description: tagInfo?.description,
    synonymCount: tagInfo?.synonyms.length || 0,
  };

  for (const doc of docs.docs) {
    const data = doc.data();
    response.entries.push(TagSchema.parse(data));
  }

  if (response.entries.length === 0) {
    return new Response('No entries found', { status: 404 });
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=300, stale-while-revalidate=1800', // 5min cache, 30min stale
    },
  });
}
