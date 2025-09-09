import { existingUser, newUser } from '../playwright/.auth/credentials.ts';

// Use environment variable for base URL or default to localhost
const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

export async function authenticate(page, useNewUserAccount = false) {
  console.log(
    `Starting authentication process for ${useNewUserAccount ? 'new' : 'existing'} user...`,
  );

  // Use the correct account based on the test type
  const credentials = useNewUserAccount ? newUser : existingUser;

  console.log(`Using account: ${credentials.email}`);

  // Perform authentication steps. Replace these actions with your own.
  await page.goto(`${BASE_URL}/login`);

  // Wait for the login form to be loaded and Svelte components to be hydrated
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  // Additional wait for client-side hydration to complete
  await page.waitForTimeout(1000);

  console.log('Filling email field with:', credentials.email);
  await page.getByLabel('Email').fill(credentials.email);

  console.log('Filling password field');
  await page.getByLabel('Password').fill(credentials.password);

  // Wait for the form to be ready for submission
  await page.waitForTimeout(500);

  console.log('Clicking login button');
  await page.getByRole('button', { name: 'Login' }).click();

  console.log('Login button clicked, waiting for navigation...');

  // Wait a bit and check for console errors
  await page.waitForTimeout(2000);

  // Check for JavaScript errors in console
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('Browser console error:', msg.text());
    }
  });

  // Check for any error messages
  const errorElements = await page
    .locator('cn-snackbar, .error, [role="alert"]')
    .all();
  if (errorElements.length > 0) {
    for (const errorElement of errorElements) {
      const errorText = await errorElement.textContent();
      if (errorText?.trim()) {
        console.log('Error message found:', errorText);
      }
    }
  }

  // Check if the login form is still visible (which would indicate failed login)
  const isEmailFieldStillVisible = await page
    .getByLabel('Email')
    .isVisible()
    .catch(() => false);
  if (isEmailFieldStillVisible) {
    console.log('Login form is still visible - login likely failed');
    // Try to see if there's a loading state
    const isButtonLoading = await page
      .getByRole('button', { name: 'Login' })
      .getAttribute('disabled');
    console.log('Login button disabled (loading):', isButtonLoading);
  }

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
