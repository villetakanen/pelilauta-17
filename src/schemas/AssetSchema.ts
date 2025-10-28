import { logError } from 'src/utils/logHelpers';
import { z } from 'zod';
import { LICENSE_KEYS, LicenseSchema } from './LicenseSchema';

export const ASSETS_COLLECTION_NAME = 'assets';

/**
 * @deprecated Use LICENSE_KEYS from LicenseSchema instead
 * Kept for backward compatibility during migration
 */
export const ASSET_LICENSES_KEYS = LICENSE_KEYS;

/**
 * @deprecated Use LicenseSchema from LicenseSchema instead
 * Kept for backward compatibility during migration
 */
export const ASSET_LICENSES = LicenseSchema;

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
