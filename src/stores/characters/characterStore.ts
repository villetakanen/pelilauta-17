/**
 * A store for a character in a game.
 *
 * Subscribes to set character data and provides methods to get and update character information.
 */

import {
  CHARACTERS_COLLECTION_NAME,
  type Character,
  CharacterSchema,
} from '@schemas/CharacterSchema';
import { uid } from '@stores/session';
import { toClientEntry } from '@utils/client/entryUtils';
import { logDebug } from '@utils/logHelpers';
import { atom, computed, type WritableAtom } from 'nanostores';

const _character: WritableAtom<Character | null> = atom(null);
export const character = computed(_character, (value) => value);
export const canEdit = computed([_character, uid], (c, u) => {
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
  if (_character.get()?.key === key) {
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
      _character.set(CharacterSchema.parse({ ...entry, key }));
    } else {
      _character.set(null);
    }
    loading.set(false);
  });
}

export async function update(data: Partial<Character>) {
  logDebug('characterStore', 'Updating character:', data);
  const { updateDoc, doc } = await import('firebase/firestore');
  const { db } = await import('@firebase/client');
  const { toFirestoreEntry } = await import('@utils/client/toFirestoreEntry');

  const currentCharacter = _character.get();
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
