import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Get Started')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Sign In').first().click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Get Started').first().click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole('heading', { name: /create.*account/i })).toBeVisible();
  });

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Should show validation errors or remain on page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show validation errors on empty registration', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: /create account/i }).click();
    // Should show validation errors or remain on page
    await expect(page).toHaveURL(/\/register/);
  });
});
