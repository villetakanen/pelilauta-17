import { expect, test } from '@playwright/test';
import { authenticate } from './authenticate-e2e';
import { waitForAuthState } from './wait-for-auth';

let characterPageUrl = '';

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await page.context().clearCookies();
  await page.goto('http://localhost:4321');
  await page.evaluate(() => window.localStorage.clear());
  await authenticate(page);
  await page.goto('http://localhost:4321/create/character');
  await waitForAuthState(page, 15000);

  // Use a unique name for the character
  const uniqueCharacterName = `E2E Edit Test Character ${Date.now()}`;

  // Go to step 2
  await page.getByTestId('character-wizard-next-button').click();

  // Select the sheet
  await page.waitForTimeout(2000);
  await page.getByText('E2E Test Sheet').click();

  // Go to final step
  await page.getByTestId('character-wizard-next-button').click();
  await page.getByTestId('character-wizard-next-button').click();

  // Fill in character name
  await page.getByTestId('character-name-input').fill(uniqueCharacterName);
  await page.getByTestId('character-wizard-create-button').click();

  // Wait for navigation to the character library
  await page.waitForURL(/\/library\/characters$/);

  // Find the character in the library and navigate to its page
  await page.reload();
  await page.getByText(uniqueCharacterName).click();
  await page.waitForURL(/\/characters\//);
  characterPageUrl = page.url();
  await page.close();
});

test.afterAll(async () => {
  const { initializeTestFirebase } = await import('../test/api/setup');
  const { serverDB } = initializeTestFirebase();
  const query = serverDB
    .collection('characters')
    .where('name', '>=', 'E2E Edit Test Character');
  const snapshot = await query.get();
  const batch = serverDB.batch();
  snapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
});

test('can edit character stats', async ({ page }) => {
  await authenticate(page);
  await page.goto(characterPageUrl);
  await waitForAuthState(page);

  // Click edit button
  await page.getByRole('button', { name: 'Edit' }).click();

  // Wait for edit mode to activate - the button text should change to "Done"
  await expect(page.getByRole('button', { name: 'Done' })).toBeVisible({
    timeout: 10000,
  });

  // Wait for the edit mode to activate and input fields to appear
  await page.waitForSelector('input[type="text"]', { timeout: 5000 });
  await page.waitForSelector('input[type="number"]', { timeout: 5000 });
  await page.waitForSelector('input[type="checkbox"]', { timeout: 5000 });

  // Edit text stat
  const textInput = page.locator('input[type="text"]').first();
  const originalText = await textInput.inputValue();
  await textInput.fill(`${originalText} edited`);

  // Edit number stat
  const numberInput = page.locator('input[type="number"]').first();
  const originalNumber = await numberInput.inputValue();
  await numberInput.fill(String(Number(originalNumber) + 1));

  // Edit toggled stat
  const toggledInput = page.locator('input[type="checkbox"]').first();
  const originalToggled = await toggledInput.isChecked();
  await toggledInput.setChecked(!originalToggled);

  // Wait for auto-save
  await page.waitForTimeout(1000);

  // Click done button
  await page.getByRole('button', { name: 'Done' }).click();

  // Verify new values are displayed
  await expect(page.getByText(`${originalText} edited`)).toBeVisible();
  await expect(
    page.getByText(String(Number(originalNumber) + 1)),
  ).toBeVisible();
  await expect(page.getByText(originalToggled ? '❌' : '✔️')).toBeVisible();
});
