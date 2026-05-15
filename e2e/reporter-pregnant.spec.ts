import { test, expect } from '@playwright/test';

const email = () =>
  `e2e-rep-preg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@csra-e2e.local`;

test.describe('Reporter — pregnant maternal case', () => {
  test('signup → role:reporter → register → submit pregnant case', async ({ page }) => {
    const user = email();

    // Signup
    await page.goto('/signup');
    await page.fill('input[name="fullName"]', 'Test Reporter');
    await page.fill('input[name="mobile"]', '9876543210');
    await page.fill('input[name="email"]', user);
    await page.fill('input[name="password"]', 'StrongPass123');
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page).toHaveURL(/\/role-selection/, { timeout: 15000 });

    // Role selection
    await page.getByRole('button', { name: /healthcare reporter/i }).click();
    await expect(page).toHaveURL(/\/reporter-registration/, { timeout: 15000 });

    // Reporter registration
    await page.fill('input[name="fullName"]', 'Test Reporter');
    await page.fill('input[name="age"]', '30');
    await page.fill('input[name="qualification"]', 'MBBS');
    await page.selectOption('select[name="designation"]', 'Medical Officer');
    await page.fill('input[name="facilityName"]', 'Test PHC');
    await page.fill('input[name="district"]', 'Mumbai');
    await page.fill('input[name="contact"]', '9876543210');
    await page.selectOption('select[name="facilityType"]', 'PHC');
    await page.getByRole('button', { name: /submit registration/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    // dashboard sanity
    await expect(page.getByText(/welcome to congenital/i)).toBeVisible();
  });
});
