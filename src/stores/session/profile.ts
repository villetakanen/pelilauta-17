import { persistentAtom } from '@nanostores/persistent';
import { doc, onSnapshot } from 'firebase/firestore';
import { atom } from 'nanostores';
import {
  PROFILES_COLLECTION_NAME,
  type Profile,
  parseProfile,
} from 'src/schemas/ProfileSchema';
import { db } from '../../firebase/client';
import { logDebug } from '../../utils/logHelpers';

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

let unsubscribe: (() => void) | undefined;

export function subscribeToProfile(uid: string) {
  logDebug('profileStore', 'subscribeToProfile', { uid });

  // Make sure we unsubscribe from any existing subscription first
  if (unsubscribe) {
    logDebug(
      'profileStore',
      'subscribeToProfile',
      'Unsubscribing from existing subscription',
    );
    unsubscribe();
  }

  const profileRef = doc(db, PROFILES_COLLECTION_NAME, uid);
  unsubscribe = onSnapshot(profileRef, (snapshot) => {
    if (snapshot.exists()) {
      const profileData = parseProfile(snapshot.data(), snapshot.id);
      logDebug('profileStore', 'onSnapshot', 'Profile found', {
        nick: profileData.nick,
      });
      $profile.set(profileData);
      $profileMissing.set(false);
    } else {
      logDebug('profileStore', 'onSnapshot', 'Profile not found');
      $profileMissing.set(true);
    }
  });
}
export function unsubscribeFromProfile() {
  logDebug('profileStore', 'unsubscribeFromProfile', 'Clearing profile data');
  $profile.set(null);
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = undefined;
  }
}
