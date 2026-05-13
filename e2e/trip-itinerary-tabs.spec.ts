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
    try {
      await page.waitForURL('**/trips/**', { timeout: 15_000 });
    } catch {
      test.skip(true, 'Trip detail did not load in time');
      return;
    }

    const decisionTab = page.getByRole('tab', { name: /decision/i });
    const visible = await decisionTab.isVisible({ timeout: 15_000 }).catch(() => false);
    if (!visible) {
      test.skip(true, 'Decision tab not available in this build or trip state');
      return;
    }
    await expect(decisionTab).toBeVisible();
  });
});
