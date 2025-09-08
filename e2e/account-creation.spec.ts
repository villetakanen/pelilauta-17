import { test, expect } from '@playwright/test';
import { authenticate } from './authenticate-e2e';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

test.describe('Account Creation Flow', () => {
  test('should allow a new user to accept EULA and create a profile', async ({ page }) => {
    // The init script has already cleaned up the user data and claims
    // So we start with a clean slate

    // 1. Authenticate the user
    await authenticate(page);

    // After authentication, the AuthManager should kick in.
    // As the user has no EULA claim, they should be redirected to /eula
    await expect(page.getByRole('heading', { name: 'End-User License Agreement' })).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/eula`);

    // 2. Accept the EULA
    await page.getByRole('button', { name: 'Accept' }).click();

    // 3. Should be redirected to create-profile
    await page.waitForURL(`${BASE_URL}/create-profile`);
    await expect(page).toHaveURL(`${BASE_URL}/create-profile`);

    // 4. Fill in the profile
    await page.getByLabel('Nickname').fill('Test Nickname');
    await page.getByLabel('Bio').fill('This is a test bio.');
    await page.getByRole('button', { name: 'Save Profile' }).click();

    // 5. Should be redirected to the home page
    await page.waitForURL(`${BASE_URL}/`);
    await expect(page).toHaveURL(`${BASE_URL}/`);

    // 6. Verify that the user is now fully logged in
    // We can check for an element that is only visible to logged-in users
    await expect(page.locator('[data-testid="setting-navigation-button"]')).toBeVisible();
  });
});
