import { toClientEntry } from '@utils/client/entryUtils';
import { logError } from '@utils/logHelpers';
import { parseFlowTime } from '@utils/schemaHelpers';
import { z } from 'zod';
import { AssetSchema } from './AssetSchema';
import { EntrySchema } from './EntrySchema';

export const SITES_COLLECTION_NAME = 'sites';

/**
 * Each site has a page index. This is a list of keys that point to pages with
 * some metadata about the page, to help building the different page listings (such as index, last 3 changes, etc)
 *
 * BREAKING CHANGE: This replaces earlier (< 16.x.y) index metadata that was stored in firestore db
 */
export const PageRefSchema = z.object({
  key: z.string(),
  name: z.string(),
  author: z.string(),
  category: z.string().optional(),
  // Note: we save flowTime instead of updatedAt, as firestore
  // does not fully support timestamps in array fields
  flowTime: z.number(),
});

export type PageRef = z.infer<typeof PageRefSchema>;

/**
 * Breaking change: This replaces earlier (< 16.x.y) category metadata that was stored in firestore db
 * as "Categories" array in the site document
 */
export const CategoryRefSchema = z.object({
  slug: z.string(),
  name: z.string(),
});

export type CategoryRef = z.infer<typeof CategoryRefSchema>;

export function parseCategories(data: Partial<CategoryRef[]>): CategoryRef[] {
  return data.map((category) => {
    return CategoryRefSchema.parse(category);
  });
}

export const SiteSortOrderSchema = z.enum([
  'name',
  'createdAt',
  'flowTime',
  'manual',
]);
export type SiteSortOrder = z.infer<typeof SiteSortOrderSchema>;

export const SiteSchema = EntrySchema.extend({
  assets: z.array(AssetSchema).optional(),
  name: z.string(),
  system: z.string().optional(),
  posterURL: z.string().optional(),
  hidden: z.boolean(),
  avatarURL: z.string().optional(),
  homepage: z.string().optional(),
  description: z.string().optional(),
  players: z.array(z.string()).optional(),
  sortOrder: SiteSortOrderSchema,
  backgroundURL: z.string().optional(),
  customPageKeys: z.boolean().optional(),
  pageRefs: z.array(PageRefSchema).optional(),
  pageCategories: z.array(CategoryRefSchema).optional(),
  // Metadata
  license: z.string().optional(),
  // Options
  usePlayers: z.boolean().optional(),
  useClocks: z.boolean().optional(),
  useHandouts: z.boolean().optional(),
  useRecentChanges: z.boolean().optional(),
  useSidebar: z.boolean().optional(), // Defaults to true if unset
  sidebarKey: z.string().optional(), // The page key to display in sidebar
  usePlainTextURLs: z.boolean().optional(),
  useCharacters: z.boolean().optional(),
});

export type Site = z.infer<typeof SiteSchema>;

export const emptySite: Site = {
  key: '',
  flowTime: 0,
  name: '',
  owners: [],
  hidden: true,
  sortOrder: 'name',
};

export function parseSite(data: Partial<Site>, newKey?: string): Site {
  // Forcing key to be a string, even if it's undefined. Legacy support for key field.
  const key = newKey || data.key || '';
  // Legacy support for system field
  const system = data.system ? data.system : 'homebrew';

  // Legacy support for hidden field
  const hidden = data.hidden ? data.hidden : false;

  // Legacy support for homepage field
  const homepage = data.homepage ? data.homepage : key;

  // Legacy support for sortOrder field
  const sortOrder = data.sortOrder ? data.sortOrder : 'name';

  // Legacy support for customPageKeys field
  const customPageKeys = data.customPageKeys ? data.customPageKeys : false;

  try {
    return SiteSchema.parse({
      ...toClientEntry(data),
      name: data.name || '[...]',
      system,
      flowTime: parseFlowTime(data),
      hidden,
      homepage,
      sortOrder,
      customPageKeys,
      key,
      // useSidebar defaults to true if unset
      useSidebar: data.useSidebar !== false,
      // customPageKeys is the legacy field for usePlainTextUrls, but inverted - use it's value
      // if usePlainTextUrls is not set
      usePlainTextUrls: data.usePlainTextURLs || !customPageKeys,
      license: data.license || '0',
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      logError('SiteSchema', err.issues);
    }
    throw err;
  }
}

/**
 * Utility for creating a site entry from a partial data. Sets default values
 * where schema does not provide them.
 *
 * @param template
 * @returns a Site object (extends Entry)
 */
export function siteFrom(template: Partial<Site>, key?: string): Site {
  const coerced: Partial<Site> = {
    ...template,
    key: key ?? template.key ?? '',
    flowTime: template.flowTime ?? 0,
    name: template.name || '-',
    description: template.description || '',
    owners: template.owners || [],
    hidden: template.hidden || false,
    system: template.system || 'homebrew',
    sortOrder: template.sortOrder || 'name',
    customPageKeys: template.customPageKeys || !template.usePlainTextURLs,
    usePlainTextURLs: template.usePlainTextURLs || false,
    license: template.license || '0',
  };

  return SiteSchema.parse(coerced);
}
