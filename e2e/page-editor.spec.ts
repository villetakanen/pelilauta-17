import { expect, test } from '@playwright/test';
import { authenticate } from './authenticate-e2e';

test('Page name can be changed', async ({ page }) => {
  await authenticate(page);
  await page.goto('http://localhost:4321/sites/e2e-test-site/front-page/edit');

  // Expect the user to be authenticated
  await expect(page.getByTestId('setting-navigation-button')).toBeVisible();

  // Expect the submit button to be disabled, as there are no changes
  await expect(page.getByTestId('save-button')).toBeDisabled();

  // Change the name of the page
  await page.getByTestId('page-name').fill('New Front Page');

  // Expect the submit button to be enabled, as there are changes
  await expect(page.getByTestId('save-button')).toBeEnabled();

  // Expect the page to have a category selector
  await expect(page.getByTestId('page-category')).toBeVisible();

  // Change the category of the page to 'Omega'
  await page.getByTestId('page-category').selectOption({ label: 'Omega' });

  // Expect the submit button to be enabled, as there are changes
  await expect(page.getByTestId('save-button')).toBeEnabled();
});
