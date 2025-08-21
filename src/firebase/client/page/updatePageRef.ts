import type { Page } from '@schemas/PageSchema';

export async function updatePageRef(page: Page) {
  const { addPageRef } = await import('./addPageRef');

  const { key, name, flowTime, category, owners } = page;

  await addPageRef(
    {
      key,
      name,
      flowTime,
      category: category || '-',
      author: owners[0] || '-',
    },
    page.siteKey,
  );
}
