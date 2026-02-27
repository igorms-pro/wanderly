import { createClient } from '@supabase/supabase-js';
import type { Page } from '@playwright/test';
import { loadDotEnvLocalIntoProcessEnv } from './env';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function isPlaceholderSupabase(url: string, key: string) {
  return url.includes('placeholder') || key === 'placeholder-key';
}

/**
 * Passwordless E2E auth (OneLink-style):
 * - Use Supabase service role to generate a magic link
 * - Navigate to the action link to establish a session in the browser
 */
export async function authenticateWithMagicLink(page: Page): Promise<void> {
  loadDotEnvLocalIntoProcessEnv();

  const supabaseUrl = getRequiredEnv('VITE_SUPABASE_URL');
  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (isPlaceholderSupabase(supabaseUrl, serviceRoleKey)) {
    throw new Error(
      'Cannot authenticate with placeholder Supabase credentials. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  const testEmail = process.env.E2E_TEST_EMAIL || 'test@example.com';
  const appBaseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data, error } = await (supabaseAdmin as any).auth.admin.generateLink({
    type: 'magiclink',
    email: testEmail,
    options: {
      redirectTo: `${appBaseUrl}/dashboard`,
    },
  });

  if (error) {
    throw new Error(`Failed to generate magic link: ${error.message || String(error)}`);
  }

  const actionLink: string | undefined =
    data?.properties?.action_link || data?.action_link || data?.actionLink;

  if (!actionLink) {
    throw new Error('Failed to generate magic link: missing action_link in response');
  }

  await page.goto(actionLink, { waitUntil: 'domcontentloaded' });
  await page.waitForURL('**/dashboard', { timeout: 30_000 });
  await page.waitForLoadState('networkidle');
}
