import type { APIContext } from 'astro';

export async function GET({ request }: APIContext) {
  const origin = new URL(request.url).origin;

  // Fetch all public sites
  const publicSitesResponse = await fetch(`${origin}/api/sites`);
  const publicSitesJson = await publicSitesResponse.json();
  const publicSites = publicSitesJson.map(
    (site: { key: string }) => `/sites/${site.key}`,
  );

  // Fetch latest public threads
  const publicThreadsResponse = await fetch(`${origin}/api/threads.json`);
  const publicThreadsJson = await publicThreadsResponse.json();
  const publicThreads = publicThreadsJson.map(
    (thread: { key: string }) => `/threads/${thread.key}`,
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url><loc>${origin}/</loc></url>
          ${publicSites.map((site: string) => `<url><loc>${origin}${site}</loc></url>`).join('')}
          ${publicThreads.map((thread: string) => `<url><loc>${origin}${thread}</loc></url>`).join('')}
        </urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=60',
      'CDN-Cache-Control': 'max-age=360',
      'Vercel-CDN-Cache-Control': 'max-age=3600',
    },
  });
}
