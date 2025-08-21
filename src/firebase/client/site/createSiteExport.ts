import { type Page, parsePage } from '@schemas/PageSchema';
import type { Site } from '@schemas/SiteSchema';
import { toClientEntry } from '@utils/client/entryUtils';
import { DEFAULT_PROPS, entryToMarkdown } from '@utils/entryConversions';
import JSZip from 'jszip';

export async function createSiteExport(site: Site, origin: string) {
  const zip = new JSZip();

  // Add the site metadata to the zip file
  zip.file('site.json', JSON.stringify(site));

  // Fetch all pages from the API
  const pageResults = await fetch(`${origin}/api/sites/${site.key}/pages.json`);
  const pageData = await pageResults.json();
  const pages = pageData as Array<Page>;

  for (const page of pages) {
    const parsed = parsePage(toClientEntry(page), `${page.key}`, `${site.key}`);
    const file = entryToMarkdown(parsed, [
      ...DEFAULT_PROPS,
      'category',
      'siteKey',
    ]);

    zip.file(`${parsed.key}.md`, file);
  }

  return zip.generateAsync({ type: 'blob' });
}
