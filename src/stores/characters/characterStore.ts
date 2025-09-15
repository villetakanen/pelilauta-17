/**
 * A store for a character in a game.
 *
 * Subscribes to set character data and provides methods to get and update character information.
 */

import { atom, computed, type WritableAtom } from 'nanostores';
import {
  CHARACTERS_COLLECTION_NAME,
  type Character,
  CharacterSchema,
} from '@schemas/CharacterSchema';
import { toClientEntry } from '@utils/client/entryUtils';
import {
  resolveCharacterWithSheet,
  type CharacterWithResolvedSheet,
} from '@utils/characters/characterUtils';
import { logDebug } from '@utils/logHelpers';
import { uid } from '../session';

// The currently loaded character, transient store for reactive updates
// form the firestore subscription. Writable for initial state, and
// updates from the firestore.
//
// For non-initial data: Updating the state should be done using the
// store methods, not by using the atom set method directly.
export const character: WritableAtom<Character | null> = atom(null);
export const resolvedCharacter: WritableAtom<CharacterWithResolvedSheet | null> =
  atom(null);

// Is the character in edit mode (editable by the current user)
export const editor = atom(false);

export const canEdit = computed([character, uid], (c, u) => {
  // Check if the character is editable by the current user
  return c?.owners?.includes(u) ?? false;
});
export const loading = atom(false);

let unsubscribe: CallableFunction = () => {};

/**
 * Subscribe to character data.
 * @param key
 */
export async function subscribe(key: string) {
  logDebug('characterStore', 'Subscribing to character:', key);
  if (character.get()?.key === key) {
    // Already subscribed to this character
    return;
  }
  loading.set(true);
  unsubscribe();

  const { db } = await import('@firebase/client');
  const { onSnapshot, doc } = await import('firebase/firestore');
  const characterDoc = doc(db, CHARACTERS_COLLECTION_NAME, key);

  unsubscribe = onSnapshot(characterDoc, (snapshot) => {
    if (snapshot.exists()) {
      const entry = toClientEntry(snapshot.data());
      const parsedCharacter = CharacterSchema.parse({ ...entry, key });
      character.set(parsedCharacter);
      resolveCharacterWithSheet(parsedCharacter).then((c) =>
        resolvedCharacter.set(c),
      );
    } else {
      character.set(null);
      resolvedCharacter.set(null);
    }
    loading.set(false);
  });
}

export async function update(data: Partial<Character>) {
  logDebug('characterStore', 'Updating character:', data);
  const { updateDoc, doc } = await import('firebase/firestore');
  const { db } = await import('@firebase/client');
  const { toFirestoreEntry } = await import('@utils/client/toFirestoreEntry');

  const currentCharacter = character.get();
  if (!currentCharacter) {
    throw new Error('No character to update');
  }

  const characterDoc = doc(
    db,
    CHARACTERS_COLLECTION_NAME,
    currentCharacter.key,
  );
  const firestoreData = toFirestoreEntry({
    ...currentCharacter,
    ...data,
  });

  await updateDoc(characterDoc, firestoreData);
  logDebug(
    'characterStore',
    'Character updated successfully:',
    currentCharacter.key,
  );
}
