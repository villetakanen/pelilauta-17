import { serverDB } from '@firebase/server';
import {
  CHARACTERS_COLLECTION_NAME,
  type Character,
  CharacterSchema,
} from '@schemas/CharacterSchema';
import { logDebug, logError } from '@utils/logHelpers';
import { tokenToUid } from '@utils/server/auth/tokenToUid';
import type { APIRoute } from 'astro';
import { FieldValue } from 'firebase-admin/firestore';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Authenticate the user
    const uid = await tokenToUid(request);
    if (!uid) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Parse and validate the request body
    const body = await request.json();
    const characterData = CharacterSchema.partial().parse(body);

    // Ensure the current user is in the owners array
    const data: Partial<Character> = {
      ...characterData,
      owners: [uid], // Override to ensure current user owns the character
    };

    // Create the Firestore entry with server-side timestamps
    const firestoreData = {
      ...data,
      author: uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      flowTime: FieldValue.serverTimestamp(),
    };

    // Add to Firestore
    const docRef = await serverDB
      .collection(CHARACTERS_COLLECTION_NAME)
      .add(firestoreData);

    logDebug('api/characters', 'Character created successfully:', docRef.id);

    return new Response(
      JSON.stringify({
        success: true,
        id: docRef.id,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    logError('api/characters', 'Failed to create character:', error);

    if (error instanceof Error && error.message.includes('validation')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid character data',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
};
