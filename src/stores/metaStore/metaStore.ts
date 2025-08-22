import { persistentAtom } from '@nanostores/persistent';
import { doc, getDoc } from 'firebase/firestore';
import { onMount } from 'nanostores';
import { db } from 'src/firebase/client';
import type { AppMeta } from 'src/schemas/AppMetaSchema';

export const appMeta = persistentAtom<AppMeta>(
  'app-meta',
  {
    admins: [],
  },
  {
    encode: JSON.stringify,
    decode: (data) => {
      return JSON.parse(data);
    },
  },
);

onMount(appMeta, () => {
  fetchAppMeta();
});

async function fetchAppMeta() {
  const appMetaDoc = await getDoc(doc(db, 'meta', 'pelilauta'));
  if (appMetaDoc.exists()) {
    const data = appMetaDoc.data();
    if (data) {
      appMeta.set(data as AppMeta);
    }
  }
}
