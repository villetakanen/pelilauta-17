import { CLOCKS_COLLECTION_NAME, type Clock } from '@schemas/ClockSchema';
import { SITES_COLLECTION_NAME } from '@schemas/SiteSchema';
import { toFirestoreEntry } from '@utils/client/toFirestoreEntry';
import { toMekanismiURI } from '@utils/mekanismiUtils';

export async function addClocktoSite(siteKey: string, clock: Clock) {
  const { getFirestore, setDoc, getDoc, doc } = await import(
    'firebase/firestore'
  );
  const data = toFirestoreEntry(clock);
  const key = toMekanismiURI(clock.label);

  const existingDoc = await getDoc(
    doc(
      getFirestore(),
      SITES_COLLECTION_NAME,
      siteKey,
      CLOCKS_COLLECTION_NAME,
      key,
    ),
  );

  if (existingDoc.exists()) {
    throw new Error(`Clock with key ${key} already exists in site ${siteKey}`);
  }

  await setDoc(
    doc(
      getFirestore(),
      SITES_COLLECTION_NAME,
      siteKey,
      CLOCKS_COLLECTION_NAME,
      key,
    ),
    data,
  );

  return key;
}
