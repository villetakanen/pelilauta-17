import {
  CHARACTERS_COLLECTION_NAME,
  type Character,
} from 'src/schemas/CharacterSchema';
import { logDebug, logError } from 'src/utils/logHelpers';

/**
 * Creates a new character in the database
 *
 * @param characterData - Partial character data
 * @param selectedSheet - Optional character sheet to embed
 * @returns Promise<string> - The ID of the created character
 */
export async function createCharacter(
  data: Partial<Character>,
): Promise<string> {
  try {
    const { addDoc, collection } = await import('firebase/firestore');
    const { db } = await import('src/firebase/client');
    const { toFirestoreEntry } = await import(
      'src/utils/client/toFirestoreEntry'
    );

    // Convert to Firestore format
    const firestoreData = toFirestoreEntry(data);

    const docRef = await addDoc(
      collection(db, CHARACTERS_COLLECTION_NAME),
      firestoreData,
    );

    logDebug('createCharacter', 'Character created successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    logError('createCharacter', 'Failed to create character:', error);
    throw error;
  }
}
