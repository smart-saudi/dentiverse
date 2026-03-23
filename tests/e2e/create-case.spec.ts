import { test, expect } from '@playwright/test';

test.describe('Case Creation Flow', () => {
  test('should require authentication to access cases', async ({ page }) => {
    await page.goto('/cases');
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/\/login/);
  });

  test('should require authentication to create a case', async ({ page }) => {
    await page.goto('/cases/new');
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/\/login/);
  });
});
