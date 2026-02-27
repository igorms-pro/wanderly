import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function stripQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * Playwright workers run in separate Node processes and don't automatically
 * load Vite's `.env.local`. Load it manually for local runs.
 */
export function loadDotEnvLocalIntoProcessEnv(): void {
  if (process.env.CI) return;

  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, 'utf8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eqIdx = line.indexOf('=');
    if (eqIdx <= 0) continue;

    const key = line.slice(0, eqIdx).trim();
    const value = stripQuotes(line.slice(eqIdx + 1));

    if (!key) continue;
    process.env[key] = value;
  }
}
