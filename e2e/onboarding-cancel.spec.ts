import { expect, test } from '@playwright/test';
import { authenticate } from './authenticate-e2e';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

test.describe('Onboarding Cancel Flow', () => {
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
    
    // Should see login-related content or elements that indicate logged out state
    // This might be a login button or some public-only content
    console.log('Verified user is logged out after cancelling onboarding');
  });

  test('should redirect to onboarding if user tries to access protected pages after cancel', async ({ 
    page 
  }) => {
    // Clean up any existing auth state
    await page.context().clearCookies();
    await page.goto(`${BASE_URL}/logout`);
    
    // Authenticate with new user credentials
    await authenticate(page, true);
    
    // Wait for onboarding page
    await page.waitForURL(`${BASE_URL}/onboarding`, { timeout: 10000 });
    
    // Cancel the onboarding
    const cancelButton = page.getByRole('button', { 
      name: /Keskeytä, ja kirjaudu ulos|Cancel and sign out/ 
    });
    await cancelButton.click();
    
    // Wait for logout
    await page.waitForTimeout(3000);
    
    // Try to navigate to a protected page (like dashboard or profile)
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Should either redirect to login or show some access denied message
    // Since we're logged out, we should end up at login or home
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    // Should not be able to access dashboard
    expect(currentUrl).not.toContain('/dashboard');
    console.log('Confirmed user cannot access protected pages after cancelling onboarding');
  });
});
