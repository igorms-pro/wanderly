import { test, expect } from '@playwright/test';
import { authenticateWithMagicLink } from './helpers/auth';

test.describe('Trip itinerary views', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await authenticateWithMagicLink(page);
    } catch {
      test.skip(true, 'E2E auth not configured');
    }
  });

  test('shows Decision tab on trip detail itinerary', async ({ page }) => {
    const tripCard = page.locator('[data-testid^="trip-card"]').first();
    if (!(await tripCard.isVisible({ timeout: 8000 }).catch(() => false))) {
      test.skip(true, 'No trip cards — seed data required');
      return;
    }

    await tripCard.click();
    await page.waitForURL('**/trips/**', { timeout: 15_000 });

    await expect(page.getByRole('tab', { name: /decision/i })).toBeVisible({ timeout: 15_000 });
  });
});
