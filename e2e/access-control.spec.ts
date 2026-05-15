import { test, expect } from '@playwright/test';

test('unauthenticated user is redirected from /dashboard to /login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});

test('mother flow is accessible without authentication', async ({ page }) => {
  await page.goto('/mother/start');
  await expect(page).toHaveURL(/\/mother\/start/);
  await expect(page.getByText(/what is your name/i)).toBeVisible();
});

test('reporter-only API routes return 401 when unauthenticated', async ({ request }) => {
  const res = await request.post('/api/reports/maternal-basic', {
    data: { fullName: 'X', age: 25, location: 'Y', mctsId: 'Z', contact: '9876543210' },
  });
  expect([401, 403]).toContain(res.status());
});
