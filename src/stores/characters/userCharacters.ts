import { persistentAtom } from '@nanostores/persistent';
import {
  CHARACTERS_COLLECTION_NAME,
  type Character,
  CharacterSchema,
} from '@schemas/CharacterSchema';
import { uid } from '@stores/session';
import { toClientEntry } from '@utils/client/entryUtils';
import { logDebug, logError } from '@utils/logHelpers';
import { effect, type WritableAtom } from 'nanostores';
import { z } from 'zod';

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
let unsubscribe: CallableFunction = () => {};

/**
 * Adds or updates the character data in the user characters store.
 *
 * @param character the Character data to patch
 */
function patchCharacterData(character: Character) {
  const currentCharacters = userCharacters.get();
  const existingIndex = currentCharacters.findIndex(
    (c) => c.key === character.key,
  );

  let updatedCharacters: Character[];
  if (existingIndex !== -1) {
    // Update existing character immutably
    updatedCharacters = [
      ...currentCharacters.slice(0, existingIndex),
      character,
      ...currentCharacters.slice(existingIndex + 1),
    ];
  } else {
    // Add new character
    updatedCharacters = [...currentCharacters, character];
  }
  userCharacters.set(updatedCharacters);
}

async function subscribeToUserCharacters(currentUid: string) {
  logDebug(
    'userCharacters:subscribe',
    `Subscribing to user characters for ${currentUid}`,
  );
  unsubscribe(); // Unsubscribe from any previous listener
  try {
    const { db } = await import('@firebase/client');
    const { onSnapshot, collection, query, where } = await import(
      'firebase/firestore'
    );

    const q = query(
      collection(db, CHARACTERS_COLLECTION_NAME),
      where('owners', 'array-contains', currentUid),
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
      for (const change of snapshot.docChanges()) {
        const docId = change.doc.id;
        if (change.type === 'added' || change.type === 'modified') {
          const entry = toClientEntry(change.doc.data());
          // If you need to set the key, do it here:
          if (entry && typeof entry === 'object') {
            (entry as Character).key = docId;
          }
          const result = CharacterSchema.safeParse(entry);

          if (result.success) {
            patchCharacterData(result.data);
          } else {
            logError(
              'userCharacters:onSnapshot',
              `Invalid character data received for doc ${docId}`,
              result.error,
            );
          }
        } else if (change.type === 'removed') {
          userCharacters.set(
            userCharacters.get().filter((c) => c.key !== docId),
          );
        }
      }
    });
  } catch (error) {
    logError(
      'userCharacters:subscribe',
      `Failed to subscribe to user characters for ${currentUid}`,
      error,
    );
  }
}

effect(uid, (currentUid) => {
  unsubscribe();
  if (currentUid) {
    subscribeToUserCharacters(currentUid);
  } else {
    userCharacters.set([]);
  }
});
