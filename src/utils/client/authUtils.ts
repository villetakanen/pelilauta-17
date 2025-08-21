import { logError } from '@utils/logHelpers';
import type { User } from 'firebase/auth';

/**
 * Completes the authentication flow by saving the session cookie and redirecting.
 *
 * @param user - Firebase user object
 * @param redirectPath - Path to redirect to after successful authentication (default: '/')
 */
export async function completeAuthFlow(user: User, redirectPath = '/') {
  try {
    // Get the ID token from the user
    const idToken = await user.getIdToken();

    // Send the token to the server to create a session cookie
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: idToken }),
    });

    // Dynamically import client utilities
    const { pushSessionSnack } = await import('./snackUtils');
    const { t } = await import('@utils/i18n');

    pushSessionSnack(t('login:snacks.success'));

    // Redirect on successful authentication
    window.location.assign(redirectPath);
  } catch (error) {
    logError(
      'completeAuthFlow',
      'Failed to complete authentication flow:',
      error,
    );
    throw error; // Re-throw so calling code can handle the error
  }
}
