import { expect, test } from '@playwright/test';
import { authenticate } from './authenticate-e2e';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

test.describe.serial('02 - Account Creation Flow', () => {
  test.beforeEach(async () => {
    // Ensure test user is clean before each test
    console.log('Cleaning up test user before account creation test...');
    // The init script should have already done this, but let's be sure
  });

  test('should allow a new user to accept EULA and create a profile', async ({
    page,
  }) => {
    // The init script has already cleaned up the user data and claims
    // So we start with a clean slate

    // 1. Authenticate the new user (will need separate credentials later)
    await authenticate(page, true); // true = use new user account

    // Wait for AuthManager to redirect to onboarding page
    await page.waitForURL(`${BASE_URL}/onboarding`, { timeout: 10000 });
    
    await expect(
      page.getByRole('heading', { name: 'Tervetuloa!' }),
    ).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/onboarding`);

    // Wait for Firebase Auth to be fully loaded and nickname to be auto-filled
    await page.waitForTimeout(3000);
    await page.waitForFunction(
      () => {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        return input && input.value.length > 0;
      },
      { timeout: 10000 },
    );

    // 2. Fill in the nickname and accept the EULA (now done in one step)
    await page.getByLabel('Nick').fill('Test Nickname New User');
    await page.getByRole('button', { name: 'Hyväksy ja jatka' }).click();

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
