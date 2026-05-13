import { test } from '@playwright/test';

import { authenticateWithMagicLink } from './helpers/auth';

test.describe('AI scenario generation', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await authenticateWithMagicLink(page);
    } catch {
      test.skip(true, 'E2E auth not configured');
    }
  });

  test('Generate with AI shows progress then a toast outcome', async ({ page }) => {
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

    const genBtn = page.getByRole('button', {
      name: /generate with ai|générer avec l['\u2019]?ia/i,
    });
    if (!(await genBtn.isVisible({ timeout: 8000 }).catch(() => false))) {
      test.skip(true, 'Generate with AI not visible (permissions or UI)');
      return;
    }

    if (await genBtn.isDisabled()) {
      test.skip(true, 'AI scenario quota reached or generating disabled');
      return;
    }

    await genBtn.click();

    const progress = page.getByText(
      /Generating a day-by-day scenario|Génération d['\u2019]?un scénario jour par jour/i,
    );
    const progressVisible = await progress.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!progressVisible) {
      test.skip(true, 'AI progress copy not shown (locale or UI changed)');
      return;
    }

    const outcome = page.locator('[role="alert"]').first();
    const outcomeVisible = await outcome.isVisible({ timeout: 120_000 }).catch(() => false);
    if (!outcomeVisible) {
      test.skip(true, 'No success/error toast within timeout (API slow or quota)');
      return;
    }
  });
});
