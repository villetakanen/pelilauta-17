import { toClientEntry } from '@utils/client/entryUtils';
import { logError } from '@utils/logHelpers';
import { getAstroQueryParams } from '@utils/server/astroApiHelpers';
import type { APIContext } from 'astro';
import { type Site, siteFrom } from 'src/schemas/SiteSchema';

export async function GET({ request }: APIContext) {
  const publicSites = new Array<Site>();

  const searchParams = getAstroQueryParams(request);

  try {
    const { serverDB } = await import('src/firebase/server');

    const queryWithLimit = searchParams.limit
      ? serverDB
          .collection('sites')
          .where('hidden', '==', false)
          .limit(Number.parseInt(searchParams.limit))
          .orderBy('flowTime', 'desc')
      : serverDB.collection('sites').where('hidden', '==', false);

    const sitesCollection = searchParams.uid
      ? queryWithLimit.where('owners', 'array-contains', searchParams.uid)
      : queryWithLimit;

    const siteDocs = await sitesCollection.get();

    for (const siteDoc of siteDocs.docs) {
      publicSites.push(siteFrom(toClientEntry(siteDoc.data()), siteDoc.id));
    }

    publicSites.sort((a, b) => {
      return b.flowTime - a.flowTime;
    });

    return new Response(JSON.stringify(publicSites), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (e: unknown) {
    logError(e);
    return new Response('Error fetching sites', {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
