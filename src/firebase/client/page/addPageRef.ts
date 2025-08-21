import {
  type PageRef,
  parseSite,
  SITES_COLLECTION_NAME,
} from '@schemas/SiteSchema';
import { toClientEntry } from '@utils/client/entryUtils';
import { db } from '..';
import { updateSite } from '../site/updateSite';

export async function addPageRef(pageRef: PageRef, siteKey: string) {
  // Get the siteDoc and Site from the firestore
  const { getDoc, doc } = await import('firebase/firestore');
  const siteDoc = await getDoc(doc(db, SITES_COLLECTION_NAME, siteKey));
  if (!siteDoc.exists()) throw new Error('addPageRef: Site not found');
  const site = parseSite(toClientEntry(siteDoc.data()), siteKey);

  // Clone the pageRefs array and add the new pageRef
  const refs: PageRef[] = site.pageRefs ? [...site.pageRefs] : [];

  // Check if this slug exists in the pageRefs, if it does, replace it
  const existingIndex = refs.findIndex((ref) => ref.key === pageRef.key);
  if (existingIndex !== -1) {
    refs[existingIndex] = pageRef;
  } else {
    // Add the new pageRef to the refs
    refs.push(pageRef);
  }

  // Update the site with the new pageRefs
  await updateSite({ pageRefs: refs, key: siteKey });
}
