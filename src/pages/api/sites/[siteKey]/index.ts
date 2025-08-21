import { serverDB } from '@firebase/server';
import { SITES_COLLECTION_NAME, parseSite } from '@schemas/SiteSchema';
import { toClientEntry } from '@utils/client/entryUtils';
import type { APIContext } from 'astro';

export async function GET({ params }: APIContext): Promise<Response> {
  const { siteKey } = params;

  if (!siteKey) {
    return new Response('Invalid request', { status: 400 });
  }

  const siteDoc = await serverDB
    .collection(SITES_COLLECTION_NAME)
    .doc(siteKey)
    .get();
  const data = siteDoc.data();

  if (!siteDoc.exists || !data) {
    return new Response('Site not found', { status: 404 });
  }

  try {
    const page = parseSite(toClientEntry(data), siteKey);
    return new Response(JSON.stringify(page), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Vercel cache control, 5 seconds
        // 'Cache-Control': 's-maxage=5, stale-while-revalidate',
      },
    });
  } catch (err: unknown) {
    return new Response('Invalid site data', { status: 500 });
  }
}
