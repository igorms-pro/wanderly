import { test, expect } from '@playwright/test';

test('landing page renders Wanderly brand and CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Wanderly')).toBeVisible();
  await expect(page.getByRole('link', { name: /Get Started|Start Planning/i })).toBeVisible();
});
