# CSRA — Congenital Syphilis Registry & Analysis

Clinical surveillance app for tracking congenital syphilis cases across maternal and infant clinical workflows, plus a low-literacy self-reporting flow for mothers. Built with Next.js 16 (App Router), React 19, Tailwind 4, TypeScript, and Supabase.

## Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
# fill in Supabase URL + anon + service-role keys
# optionally: hCaptcha site key + secret (omit to bypass in dev)

# 3. Apply database migrations
# Option A — Supabase CLI (recommended)
supabase db reset

# Option B — Supabase dashboard SQL editor
# Run files in order: supabase/migrations/0001 → 0002 → 0003 → 0004

# 4. Run dev server
npm run dev
```

The app is now at <http://localhost:3000>.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest unit tests (62 tests) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Unit tests with coverage report |
| `npm run test:e2e` | Playwright end-to-end tests (requires browsers installed) |

Before running e2e tests locally:

```bash
npx playwright install chromium
```

## Project structure

```
src/
  app/                # Next.js App Router pages + API routes
    api/              # Server-side endpoints (Node runtime)
    mother/           # Self-Reporting Mother flow (16 screens)
    report-*/         # Reporter wizard pages
    dashboard/        # Reporter dashboard
    login/ signup/    # Auth
    forgot-password/  # Password reset request
    reset-password/   # Password reset form
  components/         # Shared UI primitives (PhoneInput, AuthHeader, mother/*)
  lib/                # Pure-TS modules (validation, state machine, supabase clients)
  middleware.ts       # Route guards (auth + role)
supabase/migrations/  # Version-controlled SQL (0001 → 0004)
e2e/                  # Playwright specs
docs/                 # Project documentation
```

## Documentation

- [docs/OVERVIEW.md](docs/OVERVIEW.md) — what the app does, every form, the API surface
- [docs/USER_FLOW.mmd](docs/USER_FLOW.mmd) — Mermaid flowchart of the full user journey
- [docs/ARCHITECTURE.mmd](docs/ARCHITECTURE.mmd) — runtime architecture diagram
- [docs/AUDIT.md](docs/AUDIT.md) — implementation status against the original spec
- [supabase/README.md](supabase/README.md) — database migration workflow + RLS model

## Roles

- **Healthcare Reporter** — registers cases, sees the dashboard.
- **Self-Reporting Mother** — completes the simplified 5–11 screen flow. Can submit anonymously from the landing page (no signup required).

Reporters are routed to `/dashboard`. Mothers complete the flow and land on `/mother/thank-you` — they cannot access the dashboard.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, lucide-react
- **Backend:** Next.js API routes (Node runtime)
- **Database & Auth:** Supabase (Postgres + Auth + Storage)
- **Validation:** Zod
- **Captcha:** hCaptcha (anonymous mother submissions)
- **Testing:** Vitest + @testing-library/react (unit); Playwright (e2e)
- **CI:** GitHub Actions
- **Quality gates:** husky + lint-staged pre-commit

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon (browser) key |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Service-role key (server-only) |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | production | Public site key for hCaptcha widget |
| `HCAPTCHA_SECRET` | production | Server-side hCaptcha verification secret |

When `HCAPTCHA_SECRET` is unset, anonymous submissions bypass captcha verification (development mode).

## Contributing

Pre-commit runs ESLint and TypeScript via lint-staged. CI runs lint, typecheck, unit tests, and a production build on every push. The e2e job is gated behind a repo variable `RUN_E2E=true` plus a separate set of `*_E2E` secrets for the test Supabase project — left off by default.

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

All four should pass before opening a PR.
