import { pageFrom } from '@schemas/PageSchema';
import type { Site } from '@schemas/SiteSchema';

export function generateFrontPage(site: Site, uid: string) {
  return pageFrom({
    key: site.key,
    name: site.name,
    siteKey: site.key,
    owners: [uid],
    markdownContent: `# ${site.name} \n\n*${site.description}*`,
  });
}
