import { expect, test } from '@playwright/test';
import { authenticate } from './authenticate-e2e';

test.describe('Profile Public Links', () => {
  test('User can manage public links', async ({ page }) => {
    // 1. Authenticate
    await authenticate(page);

    // 2. Navigate to Settings
    const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';
    await page.goto(`${BASE_URL}/settings`);

    // 3. Add a Link
    const labelInput = page.getByPlaceholder('Esim. Kotisivu');
    const urlInput = page.getByPlaceholder('https://example.com');
    const addButton = page.getByRole('button', { name: 'Lisää linkki' });

    await labelInput.fill('My Test Blog');
    await urlInput.fill('https://test-blog.com');

    await expect(addButton).toBeEnabled();
    await addButton.click();

    // 4. Verify link appears in the list
    await expect(page.getByText('My Test Blog')).toBeVisible();
    await expect(page.getByText('https://test-blog.com')).toBeVisible();

    // 5. Save Profile
    // Note: Use a more specific selector if multiple Save buttons exist (e.g. within the form)
    // The form is "Profiili" section.
    // We can rely on "Tallenna" button being enabled.
    const saveButton = page.getByRole('button', { name: 'Tallenna' });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Wait for save (button becomes disabled when store updates matches local state)
    await expect(saveButton).toBeDisabled({ timeout: 10000 });

    // For now, reload and check persistence
    await page.reload();

    // Verify persistence
    await expect(page.getByText('My Test Blog')).toBeVisible();

    // 6. Remove Link
    await page.getByRole('button', { name: 'Poista linkki' }).click();
    await expect(page.getByText('My Test Blog')).not.toBeVisible();

    // Save removal
    await saveButton.click();
  });
});
