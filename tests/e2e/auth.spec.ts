import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { level: 1, name: /dental design marketplace/i }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /sign in/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByText(/enter your email and password to access your account/i),
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /get started/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByText(/join the dental design marketplace/i)).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
  });

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel(/email/i)).toBeFocused();
  });

  test('should show validation errors on empty registration', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByLabel(/full name/i)).toBeFocused();
  });
});
