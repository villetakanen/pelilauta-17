import { serverDB } from '@firebase/server';
import { PAGES_COLLECTION_NAME, parsePage } from '@schemas/PageSchema';
import { SITES_COLLECTION_NAME, siteFrom } from '@schemas/SiteSchema';
import { toClientEntry } from '@utils/client/entryUtils';
import { logError } from '@utils/logHelpers';
import { renderWikiContent } from '@utils/server/wiki/renderWikiContent';
import type { APIContext } from 'astro';

export async function GET({ params, url }: APIContext): Promise<Response> {
  const { siteKey, pageKey } = params;

  if (!siteKey || !pageKey) {
    return new Response('Invalid request', { status: 400 });
  }

  try {
    // We want to get the site and page data from the server
    const siteRef = serverDB.collection(SITES_COLLECTION_NAME).doc(siteKey);
    const pageRef = siteRef.collection(PAGES_COLLECTION_NAME).doc(pageKey);

    // Get the docs
    const siteDoc = await siteRef.get();
    const pageDoc = await pageRef.get();

    // Get the data
    const siteData = siteDoc.data();
    const pageData = pageDoc.data();

    // Return 404 if the site or page does not exist
    if (!siteDoc.exists || !siteData || !pageDoc.exists || !pageData) {
      return new Response('Site or page not found', { status: 404 });
    }

    // Convert the firestore data to client side objects
    const site = siteFrom(toClientEntry(siteData), siteDoc.id);
    const page = parsePage(toClientEntry(pageData), pageKey, siteKey);

    // page html content is either rendered at SSR, or privided from a legacy
    // data. This is handled in the renderWikiContent utility
    page.htmlContent = await renderWikiContent(page, site, url);

    // Return the page data and 200 OK
    return new Response(JSON.stringify(page), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // No cache, as pages can be edited
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (err: unknown) {
    logError(err);
    return new Response('Internal server error', { status: 500 });
  }
}
