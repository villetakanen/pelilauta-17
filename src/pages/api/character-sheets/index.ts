import crypto from 'node:crypto';
import {
  CHARACTER_SHEETS_COLLECTION_NAME,
  CharacterSheetSchema,
} from '@schemas/CharacterSheetSchema';
import { toClientEntry } from '@utils/client/entryUtils';
import { logError } from '@utils/logHelpers';
import type { APIContext } from 'astro';

export async function GET({ request }: APIContext) {
  try {
    const { serverDB } = await import('../../../firebase/server');

    const sheetsCollection = serverDB.collection(
      CHARACTER_SHEETS_COLLECTION_NAME,
    );
    const sheetDocs = await sheetsCollection.get();

    const sheets = [];
    for (const sheetDoc of sheetDocs.docs) {
      const sheetData = toClientEntry(sheetDoc.data());
      // Add the document ID as the key if it's missing
      if (!sheetData.key) {
        sheetData.key = sheetDoc.id;
      }
      sheets.push(CharacterSheetSchema.parse(sheetData));
    }

    // Sort by name for consistent ordering
    sheets.sort((a, b) => a.name.localeCompare(b.name));

    const body = JSON.stringify(sheets);
    const etag = crypto.createHash('sha1').update(body).digest('hex');

    const ifNoneMatch = request.headers.get('if-none-match');

    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304 });
    }

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        ETag: etag,
      },
    });
  } catch (error: unknown) {
    logError('character-sheets API', 'Error fetching character sheets:', error);
    return new Response('Error fetching character sheets', {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
