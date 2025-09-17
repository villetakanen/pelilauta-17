import { expect, test } from '@playwright/test';
import { authenticate } from './authenticate-e2e';
import { waitForAuthState } from './wait-for-auth';

test.describe('Character Keeper', () => {
  const siteKey = 'e2e-keeper-test-site';

  test('can view character in keeper', async ({ page }) => {
    await authenticate(page);
    await page.goto(`http://localhost:4321/sites/${siteKey}/keeper`);
    await waitForAuthState(page);

    await expect(page.getByText('E2E Keeper Test Character')).toBeVisible();

    await page.getByText('E2E Keeper Test Character').click();
    await page.waitForURL(/\/characters\//);
    expect(page.url()).toContain(
      `/sites/${siteKey}/characters/e2e-keeper-test-character`,
    );
  });
});
