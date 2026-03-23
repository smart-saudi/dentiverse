import { test, expect } from '@playwright/test';

test.describe('Designer Flow', () => {
  test('should display designers browse page', async ({ page }) => {
    // Designers page may require auth depending on middleware config
    await page.goto('/designers');
    // Either shows designers page or redirects to login
    const url = page.url();
    if (url.includes('/designers')) {
      await expect(page.getByRole('heading', { name: /designer/i })).toBeVisible();
    } else {
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('should require authentication for proposals', async ({ page }) => {
    await page.goto('/proposals');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should require authentication for payments', async ({ page }) => {
    await page.goto('/payments');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should require authentication for notifications', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page).toHaveURL(/\/login/);
  });
});
