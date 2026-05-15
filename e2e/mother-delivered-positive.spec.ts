import { test, expect } from '@playwright/test';

test.describe('Mother self-report — delivered positive (anonymous)', () => {
  test('completes delivered + positive branch with all baby_health screens', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /mother self-report/i }).click();
    await expect(page).toHaveURL(/\/mother\/start/, { timeout: 10000 });

    // Start screen
    await page.getByPlaceholder(/full name/i).fill('Anon Mother Delivered');
    await page.getByPlaceholder(/enter your age/i).fill('29');
    await page.getByPlaceholder(/area, city/i).fill('Mumbai');
    await page.getByRole('button', { name: /continue/i }).click();

    // Status
    await page.getByLabel(/delivered/i).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // delivered_about
    await page.getByPlaceholder(/months|weeks/i).first().fill('2');
    await page.getByLabel(/yes/i).first().check(); // anc_received
    await page.getByPlaceholder(/doctor|hospital/i).first().fill('Dr Deliv');
    await page.getByRole('button', { name: /continue/i }).click();

    // info-1
    await page.getByRole('button', { name: /continue/i }).click();

    // testing — positive
    const yesLabels = page.getByLabel(/yes/i);
    await yesLabels.nth(0).check();
    await yesLabels.nth(1).check();
    await page.getByLabel(/^positive$/i).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // treatment
    await page.getByLabel(/yes/i).first().check();
    await page.getByPlaceholder(/doses|number/i).fill('3');
    await page.getByRole('button', { name: /continue/i }).click();

    // baby_health screen 1
    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // baby_health screen 2
    await page.getByLabel(/yes/i).first().check();
    await page.getByRole('button', { name: /continue/i }).click();

    // baby_health screen 3
    await page.getByLabel(/yes/i).first().check();
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
