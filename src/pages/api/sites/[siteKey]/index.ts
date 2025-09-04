import type { APIContext } from 'astro';
import { getSiteData } from '../../../../firebase/server/sites';

export async function GET({ params, request }: APIContext): Promise<Response> {
  const { siteKey } = params;
  if (!siteKey) {
    return new Response('Invalid request', { status: 400 });
  }

  const site = await getSiteData(siteKey);

  if (!site) {
    return new Response('Site not found', { status: 404 });
  }

  // Generate ETag based on site's updatedAt timestamp
  const etag = `"${site.updatedAt}"`;

  // Check if client has current version
  if (request.headers.get('If-None-Match') === etag) {
    return new Response(null, { status: 304 });
  }

  return new Response(JSON.stringify(site), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ETag: etag,
      'Cache-Control': 's-maxage=300, stale-while-revalidate=1800', // 5min cache
    },
  });
}
