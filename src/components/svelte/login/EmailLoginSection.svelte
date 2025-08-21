<script lang="ts">
// Import utilities, stores, and lifecycle functions
import { completeAuthFlow } from '@utils/client/authUtils';
import { pushSessionSnack } from '@utils/client/snackUtils';
import { t } from '@utils/i18n';
import { logError } from '@utils/logHelpers';
import { onMount } from 'svelte';

interface Props {
  redirect?: string;
}
const { redirect = '/' }: Props = $props();

// Component state using Svelte runes
let email = $state('');
let suspend = $state(false); // Indicates an operation is in progress (sending link or verifying)
let sent = $state(false); // Indicates the link has been sent

/**
 * Verifies the sign-in link when the user returns to the app.
 * Dynamically imports Firebase Auth functions.
 */
const verifyLink = async () => {
  suspend = true; // Indicate verification is in progress
  try {
    // Dynamically import Firebase Auth functions and instance
    const { signInWithEmailLink } = await import('firebase/auth');
    const { auth } = await import('@firebase/client');

    const emailFromStorage = window.localStorage.getItem('emailForSignIn');
    const loginRedirectRoute =
      window.localStorage.getItem('loginRedirectRoute');

    if (!emailFromStorage) {
      logError('No email found in local storage - aborting verification.');
      pushSessionSnack(t('login:error.noEmailStorage'), { type: 'error' }); // User feedback
      suspend = false;
      return;
    }

    const userCredential = await signInWithEmailLink(
      auth,
      emailFromStorage,
      window.location.href,
    );

    // Clear email from storage on success
    window.localStorage.removeItem('emailForSignIn');
    window.localStorage.removeItem('loginRedirectRoute'); // Also clear redirect route

    // Complete the authentication flow (save session + redirect)
    await completeAuthFlow(userCredential.user, loginRedirectRoute || redirect);
    // No need to set suspend = false due to redirect
  } catch (error) {
    logError('Error verifying email link:', error);
    pushSessionSnack(t('login:error.linkVerificationFailed'), {
      type: 'error',
    }); // User feedback
    suspend = false; // Reset suspend state on error
  }
};

/**
 * Sends the sign-in link to the provided email address.
 * Dynamically imports Firebase Auth functions.
 */
const sendLink = async (e: SubmitEvent) => {
  e.preventDefault();
  if (!email) {
    pushSessionSnack(t('login:error.emailRequired'), { type: 'error' });
    return;
  }
  suspend = true;

  // Define action code settings here to capture current URL
  const actionCodeSettings = {
    url: `${window.location.origin}/`, // Send user back to the root after verification
    handleCodeInApp: true,
  };

  try {
    // Dynamically import Firebase Auth functions and instance
    const { sendSignInLinkToEmail } = await import('firebase/auth');
    const { auth } = await import('@firebase/client');

    window.localStorage.setItem('emailForSignIn', email);
    // Optionally store the intended redirect route if needed after login
    if (redirect) {
      window.localStorage.setItem('loginRedirectRoute', redirect);
    }

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    // Inform the user to check their email
    sent = true;
    pushSessionSnack(t('login:withEmail.sent')); // Success feedback
  } catch (error) {
    logError('Error sending email link:', error);
    pushSessionSnack(t('login:error.sendLinkFailed'), { type: 'error' }); // User feedback
    sent = false; // Reset sent state on error
  } finally {
    suspend = false; // Ensure suspend state is reset
  }
  email = ''; // Clear email input after sending the link
};

// Check for sign-in link on component mount
onMount(async () => {
  // Dynamically import Firebase Auth functions and instance
  const { isSignInWithEmailLink } = await import('firebase/auth');
  const { auth } = await import('@firebase/client');

  if (isSignInWithEmailLink(auth, window.location.href)) {
    verifyLink();
  }
});
</script>
  
  <section class="elevation-1 border-radius p-2" style="position: relative">
    <h2>{t('login:withEmail.title')}</h2>
  
    {#if suspend && !sent}
      <!-- Show loader only during initial link sending, not during verification redirect -->
      <div class="flex justify-center p-4">
        <cn-loader></cn-loader>
      </div>
    {:else if sent}
      <p>{t('login:withEmail.sent')}</p> 
    {:else}
      <p>{t('login:withEmail.info')}</p>
      <form onsubmit={sendLink}>
        <div class="form-field"> 
          <label for="email-login">{t('login:withEmail.label')}</label>
          <input
            id="email-login"
            type="email"
            placeholder={t('login:withEmail.placeholder')}
            bind:value={email}
            required
          />
        </div>
        <div class="toolbar justify-end">
          <button type="submit" disabled={suspend}>
            {#if suspend}
              <cn-loader></cn-loader>
            {/if}
            <span>{t('login:withEmail.sendAction')}</span>
          </button>
        </div>
      </form>
    {/if}
  </section>