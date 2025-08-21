import { persistentAtom } from '@nanostores/persistent';
import { pushSnack } from '@utils/client/snackUtils';
import { logWarn } from '@utils/logHelpers';
import type { User } from 'firebase/auth';
import { computed, onMount } from 'nanostores';
import { auth } from 'src/firebase/client';
import {
  $account,
  subscribe as subscribeToAccount,
  reset as unsubscribeFromAccount,
} from './account';
import { subscribeToProfile, unsubscribeFromProfile } from './profile';
import { initSubscriberStore } from './subscriber';

// *** Primary session stores ******************************************

export type SessionState = 'initial' | 'loading' | 'active';
// Session state - used to determine if the session is active for UX purposes
export const sessionState = persistentAtom<SessionState>(
  'session-state',
  'initial',
);
// Legacy support for solid components
export const $loadingState = sessionState;

// Active user's UID, stored in localStorage for session persistence
export const uid = persistentAtom<string>('session-uid', '');

// *** Computed stores ******************************************

// Helper for the session state
export const active = computed(sessionState, (state) => state === 'active');

// Helper to identify anonymous session for UX purposes
export const anonymous = computed([active, uid], (active, uid) => {
  if (!active) return false;
  return !uid;
});
// Legacy support for solid components
export const $isAnonymous = anonymous;

// *** REFACTORED UP TO HERE ******************************************

export const $locale = computed(
  $account,
  (account) => account?.language || 'fi',
);
export const $theme = computed(
  $account,
  (account) => account?.lightMode || 'dark',
);

export { $profile, $profileMissing } from './profile';

// We need to listen to Firebase auth state changes if any of the components
// are interested in the session state
onMount(uid, () => {
  auth.onAuthStateChanged(handleFirebaseAuthChange);
  //logDebug('sessionStore mounted, subscribing to Firebase auth state changes');
});

/**
 * This function is called whenever the firebase auth state changes.
 *
 * @param user
 */
async function handleFirebaseAuthChange(user: User | null) {
  // Lets see if Firebase has a user for us
  if (user) {
    try {
      const token = await user.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      // We need to subscribe to the account data
      await subscribeToAccount(user.uid);
      subscribeToProfile(user.uid);
    } catch (error) {
      logWarn(
        'sessionStore',
        'handleFirebaseAuthChange',
        'Error subscribing to account or profile',
        error,
      );
      // If we fail to subscribe, we should log out the user
      pushSnack('app.login.error.firebase');
      await logout();
      return;
    }
    // Lets see if we have an active session, with same UID, if so, we are done
    if ($loadingState.get() === 'active' && user.uid === uid.get()) {
      // no-op
    } else {
      // We have a new user, lets login
      await login(user.uid);
    }
  } else {
    // User is logged out, lets clear the account store
    unsubscribeFromAccount();
    unsubscribeFromProfile();
    await logout();
  }
}

async function login(newUid: string) {
  if (!newUid) {
    logWarn('sessionStore', 'login', 'No uid provided');
    return;
  }
  uid.set(newUid);

  // subscribe to user subscriptions data
  initSubscriberStore(newUid);
}

async function clear() {
  window?.localStorage.clear();
  uid.set('');
  unsubscribeFromAccount();
  unsubscribeFromProfile();
}

export async function logout() {
  // As we are logging out, we need to set the loading state
  $loadingState.set('loading');

  // Clear the session
  await clear();
  $loadingState.set('initial');

  // Sign out from Firebase
  auth.signOut();

  // Clear the session cookie
  await fetch('/api/auth/session', { method: 'DELETE' });
}

export * from './account';
export * from './subscriber';
