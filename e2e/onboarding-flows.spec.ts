import { expect, test } from '@playwright/test';
import { authenticate } from './authenticate-e2e';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

test.describe.serial('Onboarding Flows (Cancel & Accept)', () => {
  test.beforeAll(async () => {
    // Initialize clean test user state
    console.log('Initializing test database and cleaning up test user...');
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync('cd /Users/ville.takanen/dev/pelilauta-17 && node e2e/init-test-db.js');
      console.log('Test database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize test database:', error);
      throw error;
    }
  });

  test('should allow user to cancel onboarding and logout', async ({ page }) => {
    // Clean up any existing auth state
    await page.context().clearCookies();
    await page.goto(`${BASE_URL}/logout`);
    
    // Authenticate with new user credentials (this should redirect to onboarding)
    await authenticate(page, true); // true = use new user account
    
    // Wait for AuthManager to redirect to onboarding page
    await page.waitForURL(`${BASE_URL}/onboarding`, { timeout: 10000 });
    
    // Verify we're on the onboarding page
    await expect(
      page.getByRole('heading', { name: /Tervetuloa!|Welcome!/ }),
    ).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/onboarding`);
    
    // Wait for the form to be fully loaded
    await page.waitForTimeout(2000);
    
    // Look for the cancel button (should be visible)
    const cancelButton = page.getByRole('button', { 
      name: /Keskeytä, ja kirjaudu ulos|Cancel and sign out/ 
    });
    await expect(cancelButton).toBeVisible();
    
    // Click the cancel button
    console.log('Clicking cancel button...');
    await cancelButton.click();
    
    // Wait for logout to complete and redirection
    await page.waitForTimeout(3000);
    
    // Should be redirected to home page
    await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
    await expect(page).toHaveURL(`${BASE_URL}/`);
    
    // Verify user is logged out - settings button should not be visible
    await expect(
      page.locator('[data-testid="setting-navigation-button"]')
    ).not.toBeVisible();
    
    console.log('Verified user is logged out after cancelling onboarding');
  });

  test('should allow user to accept EULA and complete onboarding', async ({ page }) => {
    // Clean up any existing auth state and reset user for acceptance test
    await page.context().clearCookies();
    await page.goto(`${BASE_URL}/logout`);
    
    // Re-initialize the test user since they were logged out in the previous test
    console.log('Re-initializing test user for acceptance test...');
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync('cd /Users/ville.takanen/dev/pelilauta-17 && node e2e/init-test-db.js');
    } catch (error) {
      console.error('Failed to re-initialize test database:', error);
    }
    
    // Authenticate the new user again
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

    // Fill in the nickname and accept the EULA
    await page.getByLabel('Nick').fill('Test Nickname New User');
    await page.getByRole('button', { name: 'Hyväksy ja jatka' }).click();

    // Should be redirected directly to the home page
    await page.waitForURL(`${BASE_URL}/`);
    await expect(page).toHaveURL(`${BASE_URL}/`);

    // Verify that the user is now fully logged in
    await expect(
      page.locator('[data-testid="setting-navigation-button"]'),
    ).toBeVisible();
    
    console.log('Verified user completed onboarding successfully');
  });
});
