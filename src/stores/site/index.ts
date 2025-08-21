import { updateSite } from '@firebase/client/site/updateSite';
import {
  parseSite,
  SITES_COLLECTION_NAME,
  type Site,
} from '@schemas/SiteSchema';
import { toClientEntry } from '@utils/client/entryUtils';
import { logDebug, logWarn } from '@utils/logHelpers';
import { atom, onMount } from 'nanostores';

export const site = atom<Site | null>(null);

onMount(site, () => {
  const key = site.get()?.key;
  if (!key) {
    return;
  }
  subscribe(key);
});

async function subscribe(key: string) {
  const { db } = await import('src/firebase/client');
  const { doc, onSnapshot } = await import('firebase/firestore');
  onSnapshot(doc(db, SITES_COLLECTION_NAME, key), (doc) => {
    if (doc.exists()) {
      site.set(parseSite(toClientEntry(doc.data()), key));
    } else {
      site.set(null);
    }
  });
}

export async function update(data: Partial<Site>) {
  const key = site.get()?.key;
  if (!key) {
    logWarn('Site key is required to update the site data, aborting');
    return;
  }
  // Merge the updates with the current site data
  // updateSite will handle the actual update. Note: site Key
  // is required for the update to work. It also can't be updated
  // for obvious reasons.
  const updated = { ...site.get(), ...data, key };
  // Silent update of the Site Data
  logDebug('Updating site data', updated);
  await updateSite(updated, true);
}

// Export import store
export * from './importsStore';
