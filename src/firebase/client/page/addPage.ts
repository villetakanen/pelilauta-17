import {
  PAGES_COLLECTION_NAME,
  type Page,
  parsePage,
} from '@schemas/PageSchema';
import { SITES_COLLECTION_NAME } from '@schemas/SiteSchema';
import { toClientEntry } from '@utils/client/entryUtils';
import { toFirestoreEntry } from '@utils/client/toFirestoreEntry';
import { logDebug, logError } from '@utils/logHelpers';
import { db } from '..';
import { updatePageRef } from './updatePageRef';
import { updatePageTags } from './updatePageTags';

async function addPageToFirestore(
  siteKey: string,
  page: Partial<Page>,
  slug?: string,
) {
  const { getDoc, doc, setDoc, collection, addDoc } = await import(
    'firebase/firestore'
  );
  const fsPage = toFirestoreEntry(page);
  logDebug('addPageToFirestore', fsPage);
  if (slug) {
    const pageRef = doc(
      db,
      SITES_COLLECTION_NAME,
      siteKey,
      PAGES_COLLECTION_NAME,
      slug,
    );
    const pageDoc = await getDoc(pageRef);
    if (pageDoc.exists()) {
      logError(
        'createPage',
        'slug already exists in firestore. Cannot create the page.',
      );
      throw new Error(`Page slug ${slug} already exists`);
    }
    await setDoc(pageRef, fsPage);
    return slug;
  }
  return (
    await addDoc(
      collection(db, SITES_COLLECTION_NAME, siteKey, PAGES_COLLECTION_NAME),
      fsPage,
    )
  ).id;
}

export async function addPage(
  siteKey: string,
  page: Partial<Page>,
  slug?: string,
) {
  logDebug('addPage', siteKey, page, slug);
  const { getDoc, doc } = await import('firebase/firestore');
  const key = await addPageToFirestore(siteKey, page, slug);

  const pageDoc = await getDoc(
    doc(db, SITES_COLLECTION_NAME, siteKey, PAGES_COLLECTION_NAME, key),
  );

  const updatedPage = parsePage(
    toClientEntry(pageDoc.data() as Record<string, unknown>),
    key,
  );

  await updatePageRef(updatedPage);
  await updatePageTags(updatedPage);

  return key;
}
