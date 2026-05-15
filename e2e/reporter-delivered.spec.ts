import { test, expect } from '@playwright/test';

const email = () =>
  `e2e-rep-deliv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@csra-e2e.local`;

test.describe('Reporter — delivered baby (negative serology)', () => {
  test('signup → reporter → report baby basic + serological negative', async ({ page }) => {
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

    // Navigate to Report Baby
    await page.getByRole('link', { name: /report baby/i }).first().click();
    await expect(page).toHaveURL(/\/report-baby-basic/, { timeout: 15000 });

    // Baby basic
    await page.fill('input[name="babyName"]', 'Baby Test');
    await page.fill('input[name="motherName"]', 'Mother Test');
    await page.fill('input[name="contact"]', '9876543210');
    await page.fill('input[name="location"]', 'Mumbai');
    await page.getByRole('button', { name: /continue|next/i }).click();

    await expect(page).toHaveURL(/\/report-baby-serological/, { timeout: 15000 });

    // Serological result — Negative
    await page.getByLabel(/negative/i).check();
    await page.getByRole('button', { name: /submit|continue/i }).click();

    // Expect thank-you or success state
    await expect(page.getByText(/thank you|submitted|success/i)).toBeVisible({ timeout: 15000 });
  });
});
