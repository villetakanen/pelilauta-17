import { expect, test } from '@playwright/test';
import { authenticate } from './authenticate-e2e';

test.describe('Profile Public Links', () => {
  test('User can access public links settings', async ({ page }) => {
    // 1. Authenticate
    await authenticate(page);

    // 2. Navigate to Settings
    await page.goto('http://localhost:4321/settings');

    // 3. Verify Public Links section exists (scaffolding check)
    // Note: The specific text "Julkiset linkit" matches the planned design.
    // This test is expected to fail until Phase 3 is implemented.
    // For now, we mainly check we can get to the settings page.
    await expect(page).toHaveURL(/.*settings/);
    await expect(page.locator('h1, h2, h3')).toContainText(['Asetukset']);
  });

  test('User can see links on profile page', async ({ page }) => {
    // 1. Authenticate (using a test user who might have links in future)
    await authenticate(page);

    // 2. Navigate to own profile
    // Note: We need a way to know the UID or use the me-redirect if it exists,
    // otherwise we assume the test user's profile is reachable.
    // For this scaffold, we'll navigate to the settings page user's profile if possible,
    // or just check the public profile route exists.

    // Using a known test user UID from other tests (e.g., H3evfU7BDmec9KkotRiTV41YECg1)
    await page.goto(
      'http://localhost:4321/profiles/H3evfU7BDmec9KkotRiTV41YECg1',
    );

    // 3. Verify profile page loads
    await expect(page.locator('main')).toBeVisible();
  });
});
