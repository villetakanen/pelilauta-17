import { SITES_COLLECTION_NAME, type Site } from 'src/schemas/SiteSchema';

/**
 * Async, dynamic import of firebase/firestore and updateDoc for Site
 * updates.
 *
 * @param site the Site object to update. Key is required for the update to work. Authz happens at firestore rules level.
 * @returns a Promise that resolves when the update is complete.
 */
export async function updateSite(
  site: Partial<Site>,
  silent = false,
): Promise<void> {
  //  Check for required fields, throw error if not present
  if (!site.key) {
    throw new Error('updateSite: site.key is required');
  }
  // Dynamic import of firebase/firestore and toFirestoreEntry
  const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
  const { toFirestoreEntry } = await import(
    'src/utils/client/toFirestoreEntry'
  );

  // Create ref and prep data for update
  const siteDoc = doc(getFirestore(), SITES_COLLECTION_NAME, site.key);
  const updateData = toFirestoreEntry(site, { silent });

  // Update the site doc
  const updateResult = updateDoc(siteDoc, updateData);

  // Trigger site-wide cache purging for the SSR pages
  // This is done asynchronously to avoid blocking the update operation
  if (!silent) {
    try {
      const { purgeCacheForSite } = await import('../cache/purgeCacheHelpers');
      await purgeCacheForSite(site.key);
    } catch (error) {
      // Cache purging failures should not block site updates
      const { logDebug } = await import('../../../utils/logHelpers');
      logDebug('updateSite', 'Cache purging failed but site update succeeded', error);
    }
  }

  return updateResult;
}
