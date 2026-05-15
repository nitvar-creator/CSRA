import { test, expect } from '@playwright/test';

test.describe('Mother self-report — pregnant positive (anonymous)', () => {
  test('completes flow choosing Positive + treatment taken', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /mother self-report/i }).click();
    await expect(page).toHaveURL(/\/mother\/start/, { timeout: 10000 });

    // Start screen
    await page.getByPlaceholder(/full name/i).fill('Anon Mother Pos');
    await page.getByPlaceholder(/enter your age/i).fill('27');
    await page.getByPlaceholder(/area, city/i).fill('Mumbai');
    await page.getByRole('button', { name: /continue/i }).click();

    // Status
    await page.getByLabel(/^pregnant$/i).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // pregnant_about
    await page.getByPlaceholder(/months/i).fill('5');
    await page.getByLabel(/yes/i).first().check();
    await page.getByPlaceholder(/doctor/i).fill('Dr A');
    await page.getByRole('button', { name: /continue/i }).click();

    // info-1
    await page.getByRole('button', { name: /continue/i }).click();

    // testing
    const yesLabels = page.getByLabel(/yes/i);
    await yesLabels.nth(0).check(); // tested_during_pregnancy
    await yesLabels.nth(1).check(); // tested_for_syphilis
    await page.getByLabel(/^positive$/i).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // treatment screen
    await page.getByLabel(/yes/i).first().check(); // took_treatment
    await page.getByPlaceholder(/doses|number/i).fill('2');
    await page.getByRole('button', { name: /continue/i }).click();

    // follow-up
    await page.getByLabel(/yes/i).first().check();
    await page.getByLabel(/no/i).nth(1).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // review
    await expect(page).toHaveURL(/\/mother\/review/);
    await page.getByRole('button', { name: /submit/i }).click();

    // thank-you
    await expect(page).toHaveURL(/\/mother\/thank-you/, { timeout: 15000 });
    await expect(page.getByText(/thank you/i)).toBeVisible();
  });
});
