import { test, expect } from '@playwright/test';

test.describe('Case Creation Flow', () => {
  test('should require authentication to access cases', async ({ page }) => {
    await page.goto('/cases');
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/redirectTo=%2Fcases/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should require authentication to create a case', async ({ page }) => {
    await page.goto('/cases/new');
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/redirectTo=%2Fcases%2Fnew/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});
