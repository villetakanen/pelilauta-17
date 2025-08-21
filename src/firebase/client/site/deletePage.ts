import { PAGES_COLLECTION_NAME } from '@schemas/PageSchema';
import { SITES_COLLECTION_NAME, parseSite } from '@schemas/SiteSchema';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '..';

/**
 * Deletes a page from a site and updates the table of contents.
 *
 * Authorization is done with the firebase security rules, so this function
 * will throw an error if the user is not authorized to delete the page.
 *
 * @param siteKey - The key of the site.
 * @param pageKey - The key of the page.
 */
export async function deletePage(siteKey: string, pageKey: string) {
  await deleteDoc(
    doc(db, SITES_COLLECTION_NAME, siteKey, PAGES_COLLECTION_NAME, pageKey),
  );

  const siteDoc = await getDoc(doc(db, SITES_COLLECTION_NAME, siteKey));

  const site = parseSite(siteDoc.data() || {}, siteDoc.id);

  const toc = site.pageRefs?.filter((ref) => ref.key !== pageKey) || [];

  await updateDoc(doc(db, SITES_COLLECTION_NAME, siteKey), {
    pageRefs: toc,
  });
}
