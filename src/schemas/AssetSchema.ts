import { logError } from '@utils/logHelpers';
import { z } from 'zod';

export const ASSETS_COLLECTION_NAME = 'assets';

export const ASSET_LICENSES = z
  .enum([
    '0',
    'cc-by',
    'cc-by-sa',
    'cc-by-nc',
    'cc-by-nc-sa',
    'cc0',
    'public-domain',
    'OGL',
  ])
  .default('0');

export const ASSET_LICENSES_KEYS = [
  '0',
  'cc-by',
  'cc-by-sa',
  'cc-by-nc',
  'cc-by-nc-sa',
  'cc0',
  'public-domain',
  'OGL',
];

export const AssetSchema = z.object({
  url: z.string(),
  description: z.string().default(''),
  license: z.string().default('0'),
  name: z.string().default(''),
  mimetype: z.string().optional(),
  storagePath: z.string().optional(),
});

export type Asset = z.infer<typeof AssetSchema>;

export function parseAsset(data: Record<string, unknown>): Asset {
  try {
    return AssetSchema.parse({
      ...data,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      logError(err.issues);
    }
    throw err;
  }
}
