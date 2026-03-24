import { test, expect } from '@playwright/test';

test.describe('Designer Flow', () => {
  test('should display designers browse page', async ({ page }) => {
    await page.goto('/designers');
    await expect(page).toHaveURL(/\/designers/);
    await expect(page.getByRole('heading', { name: /find designers/i })).toBeVisible();
  });

  test('should require authentication for proposals', async ({ page }) => {
    await page.goto('/proposals');
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/redirectTo=%2Fproposals/);
  });

  test('should require authentication for payments', async ({ page }) => {
    await page.goto('/payments');
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/redirectTo=%2Fpayments/);
  });

  test('should require authentication for notifications', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/redirectTo=%2Fnotifications/);
  });
});
