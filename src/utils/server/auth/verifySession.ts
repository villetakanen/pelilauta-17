import { serverAuth } from '@firebase/server';
import { logDebug } from '@utils/logHelpers';
import type { APIContext } from 'astro';

export async function verifySession(astro: APIContext) {
  const cookie = astro.cookies.get('session')?.value;
  if (!cookie) {
    return null;
  }
  try {
    const decodedToken = await serverAuth.verifySessionCookie(cookie, true);
    logDebug('auth', 'verifySession', 'Session cookie verified successfully');
    return decodedToken;
  } catch (error) {
    // Session cookie is invalid.
    return null;
  }
}
