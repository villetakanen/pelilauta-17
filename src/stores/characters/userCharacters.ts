import { persistentAtom } from '@nanostores/persistent';
import { atom, effect, type WritableAtom } from 'nanostores';
import { type Character, CharacterSchema } from 'src/schemas/CharacterSchema';
import { logDebug, logError } from 'src/utils/logHelpers';
import { z } from 'zod';
import { uid } from '../session';

/**
 * A nanostore for caching the user's characters.
 */
export const userCharacters: WritableAtom<Character[]> = persistentAtom(
  'user-character-cache',
  [],
  {
    encode: JSON.stringify,
    decode: (data) => {
      try {
        const parsed = JSON.parse(data);
        const validationResult = z.array(CharacterSchema).safeParse(parsed);
        if (validationResult.success) {
          return validationResult.data;
        }
        logError(
          'userCharacters:decode',
          'Invalid data in localStorage',
          validationResult.error,
        );
        return [];
      } catch (error) {
        logError(
          'userCharacters:decode',
          'Failed to parse data from localStorage',
          error,
        );
        return [];
      }
    },
  },
);

/**
 * Loading state for the characters
 */
export const userCharactersLoading = atom<boolean>(false);

/**
 * Fetch characters from API and replace local cache if successful
 */
async function fetchAndReplaceCharacters(currentUid: string) {
  userCharactersLoading.set(true);

  try {
    logDebug(
      'userCharacters',
      `Fetching characters for ${currentUid} from API`,
    );

    // Use authedFetch helper instead of manual token handling
    const { authedGet } = await import('../../firebase/client/apiClient');
    const response = await authedGet('/api/characters');

    if (!response.ok) {
      logError('userCharacters', `API request failed: ${response.status}`);
      return;
    }

    const data = await response.json();
    const validationResult = z.array(CharacterSchema).safeParse(data);

    if (validationResult.success) {
      // Replace local cache with fresh data
      userCharacters.set(validationResult.data);
      logDebug(
        'userCharacters',
        `Replaced cache with ${validationResult.data.length} characters from API`,
      );
    } else {
      logError(
        'userCharacters',
        'Invalid characters data from API',
        validationResult.error,
      );
    }
  } catch (error) {
    logError('userCharacters', 'Failed to fetch characters from API:', error);
  } finally {
    userCharactersLoading.set(false);
  }
}

/**
 * React to authentication state changes
 */
effect(uid, (currentUid) => {
  if (currentUid) {
    // User logged in, try to fetch fresh data
    fetchAndReplaceCharacters(currentUid);
  } else {
    // User logged out, clear characters
    userCharacters.set([]);
    userCharactersLoading.set(false);
  }
});
