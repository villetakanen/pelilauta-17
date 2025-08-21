import { persistentAtom } from '@nanostores/persistent';
import { doc, onSnapshot } from 'firebase/firestore';
import { atom } from 'nanostores';
import { db } from 'src/firebase/client';
import {
  PROFILES_COLLECTION_NAME,
  type Profile,
  parseProfile,
} from 'src/schemas/ProfileSchema';

/**
 * The nanostores atom that holds the current user Profile data.
 */
export const $profile = persistentAtom<Profile | null>(
  'session-profile',
  null,
  {
    encode: JSON.stringify,
    decode: (data) => {
      const object = JSON.parse(data);
      return object;
    },
  },
);
export const $profileMissing = atom(false);
export const profile = $profile;

let unsubscribe: () => void;

export function subscribeToProfile(uid: string) {
  const profileRef = doc(db, PROFILES_COLLECTION_NAME, uid);
  unsubscribe = onSnapshot(profileRef, (snapshot) => {
    if (snapshot.exists()) {
      $profile.set(parseProfile(snapshot.data(), snapshot.id));
      $profileMissing.set(false);
    } else {
      $profileMissing.set(true);
    }
  });
}
export function unsubscribeFromProfile() {
  $profile.set(null);
  unsubscribe?.();
}
