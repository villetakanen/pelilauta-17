import { logError } from '@utils/logHelpers';
import { toDate } from '@utils/schemaHelpers';
import { z } from 'zod';
import { ContentEntrySchema } from './ContentEntry';

export const THREADS_COLLECTION_NAME = 'stream';

export const ImageArraySchema = z
  .array(
    z.object({
      url: z.string(),
      alt: z.string(),
    }),
  )
  .default([]);

export const ThreadSchema = ContentEntrySchema.extend({
  title: z.string(),
  channel: z.string(),
  siteKey: z.string().optional(),
  youtubeId: z.string().optional(),
  poster: z.string().optional(), // URL for the poster image
  images: ImageArraySchema.optional(),
  replyCount: z.number().optional(),
  lovedCount: z.number().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
  quoteRef: z.string().optional(),
  author: z.string().optional(),
});

export type Thread = z.infer<typeof ThreadSchema>;

export function parseThread(
  data: Record<string, unknown>,
  key?: string,
): Thread {
  let images = data.images || undefined;

  // Handle legacy image-data, these are of form { url: 'https://example.com/image.jpg' }
  if (
    data.images &&
    Array.isArray(data.images) &&
    typeof data.images[0] === 'string'
  ) {
    images = data.images.map((url: string) => ({ url, alt: `Image [${url}]` }));
  }

  // Forcing the author to be the first owner
  if (Array.isArray(data.owners) && data.owners.length > 0) {
    data.author = data.owners[0];
  }

  try {
    return ThreadSchema.parse({
      ...data,
      images,
      title: data.title || '',
      channel: data.channel || data.topic || '',
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      flowTime: toDate(data.flowTime).getTime(),
      key,
    });
  } catch (e) {
    logError('parseThread', e);
    throw e;
  }
}

export function createThread(
  source?: Partial<Thread>,
  threadKey?: string,
): Thread {
  const thread = {
    key: threadKey || source?.key || '',
    title: source?.title || '',
    channel: source?.channel || '',
    siteKey: source?.siteKey || undefined,
    youtubeId: source?.youtubeId || undefined,
    poster: source?.poster || '',
    images: source?.images || [],
    owners: source?.owners || [],
    author: source?.owners?.[0] || '-',
    replyCount: 0,
    lovedCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    flowTime: new Date().getTime(),
    markdownContent: source?.markdownContent || '',
    quoteRef: source?.quoteRef || undefined,
    public: source?.public || true,
    tags: source?.tags || undefined,
  };

  // Remove empty fields, empty strings, and empty arrays
  for (const key of Object.keys(thread) as (keyof typeof thread)[]) {
    if (
      thread[key] === undefined ||
      thread[key] === null ||
      (typeof thread[key] === 'string' && thread[key] === '') ||
      (Array.isArray(thread[key]) && thread[key].length === 0)
    ) {
      delete thread[key];
    }
  }

  return thread;
}
