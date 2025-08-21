import { SITES_COLLECTION_NAME, type Site } from '@schemas/SiteSchema';

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
  const { toFirestoreEntry } = await import('@utils/client/toFirestoreEntry');

  // Create ref and prep data for update
  const siteDoc = doc(getFirestore(), SITES_COLLECTION_NAME, site.key);
  const updateData = toFirestoreEntry(site, { silent });

  // Update the site doc
  return updateDoc(siteDoc, updateData);
}
