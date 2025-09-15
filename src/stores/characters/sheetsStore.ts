import { persistentAtom } from '@nanostores/persistent';
import { CharacterSheetSchema } from '@schemas/CharacterSheetSchema';
import { logWarn } from '@utils/logHelpers';
import { onMount } from 'nanostores';
import { z } from 'zod';

const SheetsSchema = z.array(CharacterSheetSchema);

/**
 * Locally cached list of available character sheets.
 */
export const sheets = persistentAtom<z.infer<typeof SheetsSchema>>(
  'characterSheets',
  [],
  {
    encode: JSON.stringify,
    decode: (data: unknown) => {
      const array = JSON.parse(data as string);
      try {
        return SheetsSchema.parse(array);
      } catch (error) {
        logWarn(
          'sheetsStore',
          'Failed to parse sheets from local storage, proceeding with empty list',
          error,
        );
        return [];
      }
    },
  },
);

async function refreshSheets() {
  try {
    const response = await fetch('/api/character-sheets');
    const data = await response.json();
    // This is just for safety, the API should always return valid data
    // as it uses the same Zod schema for validation.
    const parsed = SheetsSchema.parse(data);
    // --> Replace local storage with fresh data from the API
    sheets.set(parsed);
  } catch (error) {
    logWarn(
      'sheetsStore',
      'Failed to fetch character sheets from API, continuing with local data',
      error,
    );
  }
}

/** On mount, fetch list of character sheets from the API - refresh local storage */
onMount(sheets, () => {
  refreshSheets();
});
