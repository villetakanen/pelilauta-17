import { expect, test } from '@playwright/test';
import { authenticate } from './authenticate-e2e';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

test.describe('Account Creation Flow', () => {
  test('should allow a new user to accept EULA and create a profile', async ({
    page,
  }) => {
    // The init script has already cleaned up the user data and claims
    // So we start with a clean slate

    // 1. Authenticate the new user (will need separate credentials later)
    await authenticate(page, true); // true = use new user account

    // After authentication, the AuthManager should kick in.
    // As the user has no EULA claim, they should be redirected to /onboarding
    await expect(
      page.getByRole('heading', { name: 'Welcome to Pelilauta' }),
    ).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/onboarding`);

    // 2. Fill in the nickname and accept the EULA (now done in one step)
    await page.getByLabel(/nickname/i).fill('Test Nickname New User');
    await page.getByRole('button', { name: 'Accept & Create Profile' }).click();

    // 3. Should be redirected directly to the home page (no separate profile creation)
    await page.waitForURL(`${BASE_URL}/`);
    await expect(page).toHaveURL(`${BASE_URL}/`);

    // 4. Verify that the user is now fully logged in
    // We can check for an element that is only visible to logged-in users
    await expect(
      page.locator('[data-testid="setting-navigation-button"]'),
    ).toBeVisible();
  });
});
