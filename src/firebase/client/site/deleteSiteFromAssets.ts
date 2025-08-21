import {
  parseSite,
  SITES_COLLECTION_NAME,
  type Site,
} from '@schemas/SiteSchema';
import { toClientEntry } from '@utils/client/entryUtils';
import { logError } from '@utils/logHelpers';

/**
 * Deletes a specific asset from Firebase Storage and updates the site's document in Firestore.
 *
 * @param site [Site] The site containing the asset.
 * @param storagePath [string] The storage path of the asset to delete.
 */
export async function deleteSiteAsset(site: Site, storagePath: string) {
  const { getFirestore, doc, getDoc, updateDoc } = await import(
    'firebase/firestore'
  );
  const { deleteObject, getStorage, ref } = await import('firebase/storage');
  const storage = getStorage();
  const assetRef = ref(storage, storagePath); // Reference to the asset in Storage
  const siteRef = doc(getFirestore(), SITES_COLLECTION_NAME, site.key);

  const siteDoc = await getDoc(siteRef);
  if (siteDoc.exists()) {
    // 1. Delete asset from Storage
    try {
      await deleteObject(assetRef);
    } catch (error) {
      logError('Error deleting asset from storage:', error);
    }

    // 2. Update Firestore document

    // Find the asset in the site's assets array
    const remoteSite = parseSite(toClientEntry(siteDoc.data()), site.key);
    const assets = remoteSite.assets ?? [];
    const assetIndex = assets.findIndex(
      (asset) => asset.storagePath === storagePath,
    );

    if (assetIndex > -1) {
      // Remove the asset from the array's index
      assets.splice(assetIndex, 1);
      await updateDoc(siteRef, {
        assets: assets,
      });
    } else {
      // Log an error if the asset was not found in the site
      logError('Asset not found in site:', storagePath);
    }
  }
}
