import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4321/');
  // Expect the page to be loaded
  await expect(page).toHaveTitle('Pelilauta 16 Testbed');
});
