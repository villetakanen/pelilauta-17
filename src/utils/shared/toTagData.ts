import type { ContentEntry } from '@schemas/ContentEntry';
import { type Tag, TagSchema } from '@schemas/TagSchema';

/**
 * Converts a ContentEntry to TagSchema data for the tag index collection.
 *
 * This helper ensures consistent tag normalization (lowercase) across all
 * content types (threads, pages, etc.) to fix case-sensitivity issues with
 * Firestore queries using TAG_SYNONYMS.
 *
 * @param entry - The content entry (thread, page, etc.)
 * @param key - The unique key for the tag index entry
 * @param type - The content type ('thread' or 'page')
 * @param flowTime - The flow time as timestamp (milliseconds)
 * @returns Parsed Tag object ready for Firestore
 */
export function toTagData(
  entry: Pick<ContentEntry, 'tags' | 'owners'> & {
    title?: string;
    name?: string;
  },
  key: string,
  type: 'thread' | 'page',
  flowTime: number,
): Tag {
  const title = 'title' in entry ? entry.title : entry.name;

  return TagSchema.parse({
    key,
    title: title || '',
    type,
    author: entry.owners?.[0] || '',
    tags: entry.tags?.map((t) => t.toLowerCase()) || [],
    flowTime,
  });
}
