<script lang="ts">
// Import utilities, stores, and lifecycle functions
import { completeAuthFlow } from 'src/utils/client/authUtils';
import { pushSessionSnack } from 'src/utils/client/snackUtils';
import { t } from 'src/utils/i18n';
import { logDebug, logError } from 'src/utils/logHelpers';
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
  logDebug('EmailLoginSection', 'Starting email link verification...');

  try {
    // Dynamically import Firebase Auth functions and instance
    const { signInWithEmailLink } = await import('firebase/auth');
    const { auth } = await import('../../../firebase/client');

    const emailFromStorage = window.localStorage.getItem('emailForSignIn');
    const loginRedirectRoute =
      window.localStorage.getItem('loginRedirectRoute');

    logDebug('EmailLoginSection', 'Retrieved from storage:', {
      emailFromStorage,
      loginRedirectRoute,
    });

    if (!emailFromStorage) {
      logError(
        'EmailLoginSection',
        'No email found in local storage - aborting verification.',
      );
      pushSessionSnack(t('login:error.noEmailStorage'), { type: 'error' }); // User feedback
      suspend = false;
      return;
    }

    logDebug('EmailLoginSection', 'Attempting to sign in with email link...');
    logDebug('EmailLoginSection', 'Email:', emailFromStorage);
    logDebug('EmailLoginSection', 'URL:', window.location.href);

    const userCredential = await signInWithEmailLink(
      auth,
      emailFromStorage,
      window.location.href,
    );

    logDebug('EmailLoginSection', 'Sign in successful:', userCredential.user);

    // Clear email from storage on success
    window.localStorage.removeItem('emailForSignIn');
    window.localStorage.removeItem('loginRedirectRoute'); // Also clear redirect route

    // Complete the authentication flow (save session + redirect)
    await completeAuthFlow(userCredential.user, loginRedirectRoute || redirect);
    // No need to set suspend = false due to redirect
  } catch (error) {
    logError('EmailLoginSection', 'Error verifying email link:', error);

    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('auth/invalid-action-code')) {
        pushSessionSnack(
          'The email link has expired or been used already. Please request a new one.',
          {
            type: 'error',
          },
        );
      } else if (error.message.includes('auth/invalid-email')) {
        pushSessionSnack('Invalid email address. Please try again.', {
          type: 'error',
        });
      } else {
        pushSessionSnack(`Error: ${error.message}`, {
          type: 'error',
        });
      }
    } else {
      pushSessionSnack(t('login:error.linkVerificationFailed'), {
        type: 'error',
      }); // User feedback
    }

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
    url: window.location.href, // Send user back to this exact URL
    handleCodeInApp: true,
  };

  logDebug(
    'EmailLoginSection',
    'Sending email link with settings:',
    actionCodeSettings,
  );

  try {
    // Dynamically import Firebase Auth functions and instance
    const { sendSignInLinkToEmail } = await import('firebase/auth');
    const { auth } = await import('../../../firebase/client');

    logDebug('EmailLoginSection', 'Storing email in localStorage:', email);
    window.localStorage.setItem('emailForSignIn', email);
    // Optionally store the intended redirect route if needed after login
    if (redirect) {
      window.localStorage.setItem('loginRedirectRoute', redirect);
    }

    logDebug('EmailLoginSection', 'Sending sign-in link to email:', email);
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    logDebug('EmailLoginSection', 'Email link sent successfully');

    // Inform the user to check their email
    sent = true;
    pushSessionSnack(t('login:withEmail.sent')); // Success feedback
  } catch (error) {
    logError('EmailLoginSection', 'Error sending email link:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      pushSessionSnack(`Error sending email: ${error.message}`, {
        type: 'error',
      });
    } else {
      pushSessionSnack(t('login:error.sendLinkFailed'), { type: 'error' });
    }

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
  const { auth } = await import('../../../firebase/client');

  // Debug logging to understand what's happening
  logDebug('EmailLoginSection', 'Current URL:', window.location.href);
  logDebug('EmailLoginSection', 'URL search params:', window.location.search);
  logDebug(
    'EmailLoginSection',
    'Is sign-in link?',
    isSignInWithEmailLink(auth, window.location.href),
  );

  // Also check for specific parameters that indicate this is an email link
  const urlParams = new URLSearchParams(window.location.search);
  const hasOobCode = urlParams.has('oobCode');
  const hasMode = urlParams.get('mode') === 'signIn';
  const hasApiKey = urlParams.has('apiKey');

  logDebug('EmailLoginSection', 'URL params check:', {
    hasOobCode,
    hasMode,
    hasApiKey,
  });

  if (isSignInWithEmailLink(auth, window.location.href)) {
    logDebug('EmailLoginSection', 'Verifying email link...');
    verifyLink();
  } else if (hasOobCode && hasMode && hasApiKey) {
    // Fallback: if we have the right parameters but isSignInWithEmailLink returns false
    // this might be a domain mismatch issue
    logDebug(
      'EmailLoginSection',
      'Parameters suggest email link but Firebase detection failed - attempting verification anyway',
    );
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