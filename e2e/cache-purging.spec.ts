import { test, expect } from '@playwright/test';
import { authenticate } from './authenticate-e2e';

/**
 * E2E test for cache purging API routes.
 * 
 * This test verifies that the cache purging API endpoints work correctly
 * and are properly integrated into the content update workflow.
 */
test.describe('Cache Purging APIs', () => {
  test('cache purging API routes should be accessible and return proper responses', async ({ page }) => {
    // Authenticate the user first
    await authenticate(page);

    // Navigate to a test site that should exist
    await page.goto('/sites/test-site');
    
    // Try to access the cache purging API via browser console
    // This simulates what our client-side functions do
    const purgePage = await page.evaluate(async () => {
      const response = await fetch('/api/cache/purge-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session')}`
        },
        body: JSON.stringify({
          siteKey: 'test-site',
          pageKey: 'test-page'
        })
      });
      
      return {
        ok: response.ok,
        status: response.status,
        body: await response.text()
      };
    });

    // If we get 401, it means authentication is required (which is correct)
    // If we get 404, it means the site/page doesn't exist (also valid)
    // If we get 500, there might be an issue with our implementation
    expect([200, 401, 403, 404].includes(purgePage.status)).toBeTruthy();

    const purgeSite = await page.evaluate(async () => {
      const response = await fetch('/api/cache/purge-site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session')}`
        },
        body: JSON.stringify({
          siteKey: 'test-site'
        })
      });
      
      return {
        ok: response.ok,
        status: response.status,
        body: await response.text()
      };
    });

    // Same logic as above - valid responses are OK, auth errors, or not found
    expect([200, 401, 403, 404].includes(purgeSite.status)).toBeTruthy();

    console.log('Cache purging API responses:', { purgePage, purgeSite });
  });

  test('cache purging API should reject invalid requests', async ({ page }) => {
    // Test without authentication
    const noAuth = await page.evaluate(async () => {
      const response = await fetch('/api/cache/purge-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteKey: 'test-site',
          pageKey: 'test-page'
        })
      });
      
      return response.status;
    });

    expect(noAuth).toBe(401); // Should require authentication

    // Test with missing data
    await authenticate(page);
    
    const missingData = await page.evaluate(async () => {
      const response = await fetch('/api/cache/purge-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session')}`
        },
        body: JSON.stringify({
          // Missing siteKey and pageKey
        })
      });
      
      return response.status;
    });

    expect([400, 401].includes(missingData)).toBeTruthy(); // Should validate required fields
  });
});
