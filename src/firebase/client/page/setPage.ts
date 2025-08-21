import {
  PAGES_COLLECTION_NAME,
  type Page,
  parsePage,
} from '@schemas/PageSchema';
import { SITES_COLLECTION_NAME } from '@schemas/SiteSchema';
import { toClientEntry } from '@utils/client/entryUtils';
import { toFirestoreEntry } from '@utils/client/toFirestoreEntry';
import { db } from '..';
import { updatePageRef } from './updatePageRef';
import { updatePageTags } from './updatePageTags';

async function setPageToFirestore(
  siteKey: string,
  page: Partial<Page>,
  key: string,
) {
  const { setDoc, doc } = await import('firebase/firestore');
  const fsPage = toFirestoreEntry(page);
  await setDoc(
    doc(db, SITES_COLLECTION_NAME, siteKey, PAGES_COLLECTION_NAME, key),
    fsPage,
  );
}

export async function setPage(
  siteKey: string,
  page: Partial<Page>,
  key: string,
) {
  const { getDoc, doc } = await import('firebase/firestore');
  await setPageToFirestore(siteKey, page, key);

  const pageDoc = await getDoc(
    doc(db, SITES_COLLECTION_NAME, siteKey, PAGES_COLLECTION_NAME, key),
  );
  if (!pageDoc.exists()) throw new Error('updatePage: Page not found');

  // Then we need to update the page references
  const updatedPage = parsePage(
    toClientEntry(pageDoc.data() as Record<string, unknown>),
    key,
  );
  await updatePageRef(updatedPage);
  await updatePageTags(updatedPage);
}
