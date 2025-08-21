import {
  CHARACTER_SHEETS_COLLECTION_NAME,
  type CharacterSheet,
  CharacterSheetSchema,
} from '@schemas/CharacterSheetSchema';
import { logDebug, logError } from '@utils/logHelpers';
import { atom, onMount, type WritableAtom } from 'nanostores';

export const sheet: WritableAtom<CharacterSheet | null> = atom(null);
export const loading: WritableAtom<boolean> = atom(false);

onMount(sheet, () => {
  const key = sheet.get()?.key;
  if (!key) {
    return;
  }
  subscribeCharacterSheet(key);
});

/**
 * Subscribes to a character sheet in the database by its key to populate the store.
 * This function sets up a real-time listener for the character sheet data.
 *
 * @param sheetKey - The unique key of the character sheet to subscribe to.
 */
export async function subscribeCharacterSheet(sheetKey: string) {
  try {
    const { doc, onSnapshot } = await import('firebase/firestore');
    const { db } = await import('@firebase/client');

    logDebug(
      'characterSheetStore',
      'Subscribing to character sheet:',
      sheetKey,
    );

    const docRef = doc(db, CHARACTER_SHEETS_COLLECTION_NAME, sheetKey);

    onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const characterSheet = CharacterSheetSchema.parse({
          ...data,
          key: sheetKey,
        });
        logDebug(
          'characterSheetStore',
          'Character sheet updated:',
          characterSheet,
        );
        sheet.set(characterSheet);
      } else {
        logError(
          'characterSheetStore',
          'No character sheet found for key:',
          sheetKey,
        );
        sheet.set(null);
      }
    });
  } catch (error) {
    logError(
      'characterSheetStore',
      'Failed to subscribe to character sheet:',
      error,
    );
    throw error;
  }
}

/**
 * Creates a new character sheet in the database
 */
export async function createCharacterSheet(
  sheetData: Partial<CharacterSheet>,
): Promise<string> {
  try {
    const { addDoc, collection } = await import('firebase/firestore');
    const { db } = await import('@firebase/client');

    // Parse and validate the sheet data
    const characterSheet = CharacterSheetSchema.parse(sheetData);

    logDebug(
      'characterSheetStore',
      'Creating character sheet:',
      characterSheet,
    );

    const docRef = await addDoc(
      collection(db, CHARACTER_SHEETS_COLLECTION_NAME),
      {
        ...characterSheet,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );

    logDebug(
      'characterSheetStore',
      'Character sheet created successfully:',
      docRef.id,
    );
    return docRef.id;
  } catch (error) {
    logError('characterSheetStore', 'Failed to create character sheet:', error);
    throw error;
  }
}
