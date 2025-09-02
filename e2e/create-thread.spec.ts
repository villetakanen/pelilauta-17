import { expect, test } from '@playwright/test';
import { authenticate } from './authenticate-e2e';
import { waitForAuthState } from './wait-for-auth';

test.setTimeout(120000); // Increase timeout for authentication and navigation

test('can create a thread successfully', async ({ page }) => {
  // Listen for console errors and API responses
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('Browser console error:', msg.text());
    }
  });

  page.on('response', (response) => {
    const url = response.url();
    const status = response.status();

    if (status >= 400) {
      console.log(`HTTP Error: ${status} - ${url}`);
    }

    if (url.includes('/api/threads/create')) {
      console.log('API Response:', status, url);
    }
  });

  // Monitor all network requests to see what's failing
  page.on('request', (request) => {
    if (request.url().includes('/api/')) {
      console.log(`API Request: ${request.method()} ${request.url()}`);
    }
  });

  await authenticate(page);
  await page.goto('http://localhost:4321/create/thread');

  // Use the robust auth state waiting mechanism
  await waitForAuthState(page, 15000);

  // Expect the save button to exist, and be disabled initially
  await expect(page.getByTestId('send-thread-button')).toBeDisabled();

  // Create a unique thread title using timestamp
  const uniqueThreadTitle = `E2E Test Thread ${Date.now()}`;

  // Fill in the thread title
  await page.fill('input[name="title"]', uniqueThreadTitle);

  // Wait for cn-editor to be visible and CodeMirror to load
  await page.waitForSelector('cn-editor', {
    state: 'attached',
    timeout: 15000,
  });
  await page.waitForSelector('cn-editor .cm-editor', { timeout: 15000 });

  // Set cn-editor content using evaluate with proper event triggering
  await page.evaluate((content) => {
    const editor = document.querySelector('cn-editor') as HTMLElement & {
      value?: string;
      dispatchEvent?: (event: Event) => void;
    };
    if (editor && 'value' in editor) {
      editor.value = content;
      // Trigger all the necessary events for form recognition
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      editor.dispatchEvent(new Event('change', { bubbles: true }));
      editor.dispatchEvent(new Event('blur', { bubbles: true }));
    }
  }, 'This is a test thread created by the E2E test suite. It should be automatically cleaned up after the test runs.');

  // Wait for the send button to be enabled (form validation should kick in)
  await expect(page.getByTestId('send-thread-button')).toBeEnabled();

  // Submit the thread and wait a bit before checking for navigation
  await page.getByTestId('send-thread-button').click();

  // Wait a bit to see if any error messages appear
  await page.waitForTimeout(2000);

  // Check if there's an error message before waiting for navigation
  const errorMessage = page
    .locator('[data-testid="snackbar"]')
    .or(page.locator('.error'))
    .or(page.locator('[role="alert"]'));
  if (await errorMessage.isVisible()) {
    const errorText = await errorMessage.textContent();
    console.log('Error message detected:', errorText);
    throw new Error(`Thread creation failed with error: ${errorText}`);
  }

  // Wait for navigation to the new thread page
  await page.waitForURL(/\/threads\/[^/]+$/, { timeout: 15000 });

  // Verify the thread was created successfully
  await expect(
    page.getByRole('heading', { name: uniqueThreadTitle, level: 1 }),
  ).toBeVisible();

  // Verify the content is displayed in the thread content (not debug output)
  await expect(
    page
      .locator('article p')
      .getByText('This is a test thread created by the E2E test suite'),
  ).toBeVisible();
});
