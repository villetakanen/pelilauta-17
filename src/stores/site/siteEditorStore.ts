import { SITES_COLLECTION_NAME, type Site } from '@schemas/SiteSchema';
import { logDebug, logError } from '@utils/logHelpers';
import { atom, computed } from 'nanostores';

const originalSite = atom<Site | null>(null);
export const activeSite = atom<Site | null>(null);
export const isSaving = atom(false);

export const dirty = computed(
  [originalSite, activeSite],
  (original, active) => {
    if (!original || !active) return false;
    return JSON.stringify(original) !== JSON.stringify(active);
  },
);

export function init(site: Site) {
  originalSite.set(site);
  activeSite.set(site);
}

export function reset() {
  const original = originalSite.get();
  if (original) {
    activeSite.set(original);
  }
}

/**
 * Optimistically updates the site data. Updates the local store immediately
 * for instant preview, then persists to Firestore and triggers cache purging.
 *
 * If the update fails, the local store is rolled back to the previous state.
 *
 * Note: Only the changed fields are sent to Firestore. updateDoc performs
 * a merge by default, preventing overwrites of concurrent changes by other users.
 *
 * @param updates - Partial Site object with fields to update
 */
export async function updateSite(updates: Partial<Site>): Promise<void> {
  const currentSite = activeSite.get();

  if (!currentSite) {
    logError('siteEditorStore', 'Cannot update: no site loaded');
    throw new Error('No site loaded in editor');
  }

  // Ensure key cannot be changed
  if (updates.key && updates.key !== currentSite.key) {
    logError('siteEditorStore', 'Cannot change site key');
    throw new Error('Site key cannot be changed');
  }

  // Store the previous state for rollback
  const previousSite = { ...currentSite };

  // Optimistically update the local store immediately for instant preview
  const optimisticSite: Site = {
    ...currentSite,
    ...updates,
    key: currentSite.key, // Ensure key stays the same
  };

  activeSite.set(optimisticSite);
  isSaving.set(true);

  logDebug('siteEditorStore:update', 'Optimistic update applied', updates);

  try {
    // Dynamic import of firebase/firestore for code splitting
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const { toFirestoreEntry } = await import('@utils/client/toFirestoreEntry');

    // Create ref and prep data for Firestore update
    const siteDoc = doc(getFirestore(), SITES_COLLECTION_NAME, currentSite.key);
    // IMPORTANT: Only send the partial updates, not the merged object
    // updateDoc performs a merge by default, preventing overwrites of concurrent changes
    const updateData = toFirestoreEntry(updates, { silent: true });

    // Persist to Firestore (only the changed fields)
    await updateDoc(siteDoc, updateData);

    logDebug('siteEditorStore:update', 'Firestore update completed');

    // Trigger site-wide cache purging for SSR pages (non-blocking)
    try {
      const { purgeCacheForSite } = await import(
        '@firebase/client/cache/purgeCacheHelpers'
      );
      await purgeCacheForSite(currentSite.key);
    } catch (cacheError) {
      // Cache purging failures should not block the update
      logDebug(
        'siteEditorStore:update',
        'Cache purging failed but site update succeeded',
        cacheError,
      );
    }
  } catch (error) {
    // Rollback to previous state on error
    logError('siteEditorStore:update', 'Update failed, rolling back', error);
    activeSite.set(previousSite);
    throw error;
  } finally {
    isSaving.set(false);
    originalSite.set(activeSite.get()); // Sync original to current after save attempt
  }
}
