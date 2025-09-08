import { email, password } from '../playwright/.auth/credentials.js';

// Use environment variable for base URL or default to localhost
const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

export async function authenticate(page, useNewUserAccount = false) {
  console.log(`Starting authentication process for ${useNewUserAccount ? 'new' : 'existing'} user...`);

  // For now, let's use the primary account for both to get tests working
  // We'll set up proper multiple accounts once the user provides credentials

  // Perform authentication steps. Replace these actions with your own.
  await page.goto(`${BASE_URL}/login`);

  // Wait for the login form to be loaded
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  console.log('Login button clicked, waiting for navigation...');

  // For new users, they might get redirected to onboarding instead of home
  if (useNewUserAccount) {
    // For new users, we expect either home page or onboarding
    await page.waitForURL(new RegExp(`${BASE_URL}/(|onboarding)`), {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    });
    console.log('Authentication completed for new user (may need onboarding)');
  } else {
    // Wait until the page receives the cookies.
    // Sometimes login flow sets cookies in the process of several redirects.
    // Wait for the final URL to ensure that the cookies are actually set.
    await page.waitForURL(`${BASE_URL}/`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    });

    // Additional wait to ensure user profile is loaded - this is the reliable indicator of successful auth
    await page.waitForSelector('[data-testid="setting-navigation-button"]', {
      timeout: 30000,
      state: 'visible',
    });

    console.log('Authentication completed successfully for existing user');
  }
}
