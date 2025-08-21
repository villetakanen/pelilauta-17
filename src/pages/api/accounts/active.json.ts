import { serverDB } from '@firebase/server';
import { ACCOUNTS_COLLECTION_NAME } from '@schemas/AccountSchema';

/**
 * Returns the active account UID's for the solution.
 *
 */
export async function GET() {
  const query = serverDB
    .collection(ACCOUNTS_COLLECTION_NAME)
    .orderBy('lastLogin', 'desc')
    .limit(11);

  const uids = new Array<string>();

  const accounts = await query.get();

  for (const account of accounts.docs) {
    if (!account.data().frozen) {
      uids.push(account.id);
    }
  }

  return new Response(JSON.stringify(uids), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=100',
    },
  });
}
