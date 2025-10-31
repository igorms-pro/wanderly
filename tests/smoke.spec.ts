import { test, expect } from '@playwright/test';

test('landing page renders brand and CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Wanderly')).toBeVisible();
  await expect(page.getByText('Start Planning for Free')).toBeVisible();
});


