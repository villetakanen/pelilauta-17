import { type Asset, parseAsset } from '@schemas/AssetSchema';
import {
  parseSite,
  SITES_COLLECTION_NAME,
  type Site,
} from '@schemas/SiteSchema';
import { toClientEntry } from '@utils/client/entryUtils';
import { logError } from '@utils/logHelpers';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { app, db } from '..';

/**
 * Adds an asset to the given site in Firebase Storage.
 *
 * @param site [Site] The site to add the asset to.
 * @param file [File] The asset file to upload.
 * @returns {Promise<{ downloadURL: string, storagePath: string }>} A promise that resolves
 * with the download URL and storage path of the uploaded asset.
 */
async function addAssetToStorage(
  site: Site,
  file: File,
): Promise<{ downloadURL: string; storagePath: string }> {
  const uniqueFilename = `${uuidv4()}-${file.name}`; // Generate a unique filename
  const storagePath = `Sites/${site.key}/${uniqueFilename}`; // The path to store the file in Firebase Storage
  const { getStorage } = await import('firebase/storage');
  const storage = getStorage(app);
  const siteAssetsRef = ref(storage, storagePath);

  try {
    // Upload the file
    await uploadBytes(siteAssetsRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(siteAssetsRef);

    // Return the download URL
    return { downloadURL, storagePath };
  } catch (error) {
    logError('Error uploading asset to storage', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Adds an asset to the given site in Firebase Storage.
 *
 * @param site [Site] The site to add the asset to.
 * @param file [File] The asset file to upload.
 * @param metadata [Record<string, string>] The metadata to attach to the asset.
 * @returns {Promise<string>} A promise that resolves with the download URL of the uploaded asset.
 */
export async function addAssetToSite(
  site: Site,
  file: File,
  metadata: Partial<Asset> = {},
): Promise<string> {
  const siteRef = doc(db, SITES_COLLECTION_NAME, site.key);
  const siteDoc = await getDoc(siteRef);

  if (!siteDoc.exists()) {
    throw new Error(`Site with key ${site.key} not found`);
  }

  const { downloadURL, storagePath } = await addAssetToStorage(site, file);
  const remoteSite = parseSite(toClientEntry(siteDoc.data()), site.key);

  // Update the site's assets list
  const assetData = parseAsset({
    url: downloadURL,
    description: metadata.description || '',
    license: metadata.license || '0',
    name: metadata.name || file.name,
    mimetype: file.type,
    storagePath: storagePath,
  });

  const assets = remoteSite.assets || [];
  assets.push(assetData);

  // Raw update to site, no need to update metadata fields
  await updateDoc(siteRef, { assets: assets });

  // Return the download URL
  return downloadURL;
}
