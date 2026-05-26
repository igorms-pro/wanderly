# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Voyagely is a React 18 + TypeScript SPA for collaborative group travel planning. It uses Vite 6 as build tool, pnpm as package manager, and Supabase (cloud-hosted) as the backend (Auth, Postgres, Realtime). See `README.md` for the full tech stack and available scripts.

### Running the dev environment

- **Dev server**: `pnpm dev` starts Vite on port 5173.
- **Lint**: `pnpm lint`
- **Type check**: `pnpm typecheck` or `pnpm type-check`
- **Unit tests**: `pnpm test:run` (96 tests across 21 files)
- **E2E tests**: `pnpm e2e` (requires Playwright chromium; install with `npx playwright install --with-deps chromium`)
- **Combined check**: `pnpm check` runs lint + type-check + test:run

### Gotchas

- **pnpm 10 build scripts**: pnpm 10 does not run postinstall scripts by default. The `package.json` includes `pnpm.onlyBuiltDependencies` to allowlist `esbuild`, `msw`, `core-js`, and `protobufjs`. Without this, esbuild won't install its platform binary and Vite will fail.
- **Supabase credentials**: The app requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`. Without real credentials, the app renders (landing, auth pages) but API calls fail with placeholder fallbacks. Copy `.env.example` to `.env.local` and fill in real values if available.
- **Husky hooks**: Pre-commit runs `lint-staged` (ESLint + Prettier + related Vitest tests). Pre-push runs `pnpm typecheck && pnpm test:run`. When committing from a cloud agent, you may want to skip hooks with `--no-verify` if they cause issues, but prefer running checks manually before pushing.
- **E2E tests** require `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` env vars plus a real Supabase instance to pass authentication flows.
- **Optional API keys**: OpenWeather, Google Maps, OpenAI, Sentry, and PostHog features degrade gracefully without their respective API keys.
