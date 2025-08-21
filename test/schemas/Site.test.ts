import { expect, test } from 'vitest';
import { SiteSchema, siteFrom } from '../../src/schemas/SiteSchema';

test('siteFrom parses a site with minimal data', () => {
  const data = {
    key: 'a',
  };
  const site = siteFrom(data);
  const parsed = SiteSchema.parse(site);
  expect(parsed).toEqual(site);
});
