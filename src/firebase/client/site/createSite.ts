import {
  parseSite,
  SITES_COLLECTION_NAME,
  type Site,
} from '@schemas/SiteSchema';
import { uid } from '@stores/session';
import { logDebug } from '@utils/logHelpers';
import { updateDoc } from 'firebase/firestore';

/**
 * Creates a new site in the database, returns the key of the new site
 *
 * @param site: Partial<Site> - the site to create
 * @returns string - the key of the new site
 */
export async function createSite(site: Partial<Site>): Promise<string> {
  const { getFirestore, doc, getDoc, setDoc, addDoc, collection } =
    await import('firebase/firestore');
  const { toFirestoreEntry } = await import('@utils/client/toFirestoreEntry');

  logDebug('createSite', site);

  // Get the current user's uid
  const u = uid.get();
  if (!u) {
    throw new Error('Site creation aborted, session uid not set');
  }

  // Create a new site object based on the params
  const parsedSite = parseSite(site);
  const siteData = toFirestoreEntry(parsedSite);

  // Add the current user's uid to the site's owners
  siteData.owners = [u];

  // If the site has a key, try to create the site with that given key
  if (site.key && site.usePlainTextURLs) {
    const siteRef = doc(getFirestore(), SITES_COLLECTION_NAME, site.key);
    const siteDoc = await getDoc(siteRef);
    if (siteDoc.exists()) {
      throw new Error(`Site with key ${site.key} already exists`);
    }
    logDebug('createSite', 'Creating site with given key', siteData);
    await setDoc(siteRef, siteData);

    setDoc(doc(getFirestore(), `reactions/${site.key}`), {
      subscribers: siteData.owners,
    });

    return site.key;
  }
  //logDebug('createSite', 'Creating site with automatic key', siteData);
  const { id } = await addDoc(
    collection(getFirestore(), SITES_COLLECTION_NAME),
    siteData,
  );
  await updateDoc(doc(getFirestore(), SITES_COLLECTION_NAME, id), {
    key: id,
    homepage: id,
  });

  setDoc(doc(getFirestore(), `reactions/${id}`), {
    subscribers: siteData.owners,
  });

  return id;
}
