import { expect, test } from '@playwright/test';

// Use environment variable for base URL or default to localhost
const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

test('front page loads with correct title', async ({ page }) => {
  // User is already authenticated via global setup
  await page.goto(BASE_URL);

  // Expect the page to be loaded with the correct title from environment
  // Use the dev environment title for tests
  const expectedTitle = 'Pelilauta';
  await expect(page).toHaveTitle(expectedTitle);
});

test('authenticated user can see settings button', async ({ page }) => {
  // User is already authenticated via global setup
  await page.goto(BASE_URL);

  // Wait for the page to load
  await page.waitForLoadState('domcontentloaded');

  // Verify user is authenticated by checking for settings button
  await expect(page.getByTestId('setting-navigation-button')).toBeVisible({
    timeout: 10000,
  });
});
