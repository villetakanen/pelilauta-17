import { expect, test } from '@playwright/test';
import { authenticate } from './authenticate-e2e';

test('test', async ({ page }) => {
  await authenticate(page);
  await page.goto('http://localhost:4321/create/thread');

  // Expect the save button to exist, and be disabled
  await expect(page.getByTestId('send-thread-button')).toBeDisabled();
});
