# CSRA E2E tests

Playwright specs for the CSRA app. They run against a real dev server (`npm run dev`) and a real Supabase project — these are smoke/integration tests, not unit tests.

## Prerequisites

1. A test Supabase project with migrations `0001` → `0004` applied.
2. `.env.local` populated with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. `HCAPTCHA_SECRET` left **unset** so anonymous mother submissions bypass captcha (the API treats this as dev mode).
4. Browsers installed: `npx playwright install chromium`.

## Running

```
npm run test:e2e             # headless
npm run test:e2e -- --ui     # interactive
```

## Test data

The tests create users on the fly with `*@csra-e2e.local` emails so they don't collide with real accounts. To clean up after a run:

```sql
delete from auth.users where email like '%@csra-e2e.local';
```
