import { type User, getAuth } from 'firebase/auth';
import { app as firebaseApp } from '.';

const auth = getAuth(firebaseApp);

/**
 * A wrapper around the native fetch function that automatically adds the
 * Firebase Authentication ID token to the Authorization header for requests
 * to your backend API.
 *
 * @param input - The resource URL (like fetch).
 * @param options - The options for the request (like fetch).
 * @returns A Promise that resolves with the Response object.
 * @throws Throws an error if the user is not logged in or if fetching the token fails.
 */
export async function authedFetch(
  input: RequestInfo | URL,
  options?: RequestInit,
): Promise<Response> {
  const currentUser: User | null = auth.currentUser;

  // 1. Check if user is logged in client-side
  if (!currentUser) {
    console.error('authedFetch: No user is currently logged in.');
    // You might want to redirect to login or throw a specific error type
    throw new Error('User not authenticated');
  }

  let idToken: string;
  try {
    // 2. Get the Firebase ID token
    // Note: getIdToken() automatically handles refreshing the token if it's expired.
    idToken = await currentUser.getIdToken();
  } catch (error) {
    console.error('authedFetch: Failed to get ID token:', error);
    // Handle token fetch error - maybe the user's session is invalid?
    throw new Error('Failed to retrieve authentication token');
  }

  // 3. Prepare headers
  const headers = new Headers(options?.headers); // Create Headers object from existing options
  headers.set('Authorization', `Bearer ${idToken}`); // Set the Authorization header

  // Ensure Content-Type is set for methods that typically have a body, if not already set
  if (options?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json'); // Default to JSON, adjust if needed
  }

  // 4. Call the original fetch with the modified options
  try {
    const response = await fetch(input, {
      ...options, // Spread existing options (method, body, etc.)
      headers: headers, // Use the modified headers object
    });

    // Optional: Add generic error handling for non-ok responses
    // if (!response.ok) {
    //     const errorData = await response.text(); // or response.json() if your API returns JSON errors
    //     console.error(`authedFetch: HTTP error! Status: ${response.status}`, errorData);
    //     throw new Error(`HTTP error! Status: ${response.status}`);
    // }

    return response;
  } catch (error) {
    console.error('authedFetch: Network or fetch error:', error);
    // Re-throw the error so the calling code can handle it
    throw error;
  }
}

// --- Convenience methods for common HTTP verbs ---

export const authedGet = (input: RequestInfo | URL, options?: RequestInit) =>
  authedFetch(input, { ...options, method: 'GET' });

export const authedPost = (
  input: RequestInfo | URL,
  body: unknown,
  options?: RequestInit,
) =>
  authedFetch(input, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });

export const authedPut = (
  input: RequestInfo | URL,
  body: unknown,
  options?: RequestInit,
) =>
  authedFetch(input, { ...options, method: 'PUT', body: JSON.stringify(body) });

export const authedDelete = (input: RequestInfo | URL, options?: RequestInit) =>
  authedFetch(input, { ...options, method: 'DELETE' });
