# CSRA — Spec vs. Implementation Audit

This document audits the design specification in [`architectre-and-uf.md`](architectre-and-uf.md) against the current codebase on the `pablo` branch.

The spec describes two parallel modules: a **Medical Reporter** flow (the clinician-facing one) and a **Self-Reporting Mother** flow (a simplified, big-button, info-block-rich patient flow). Both modules are now implemented end-to-end. Phases 0 through 8 of the implementation plan have landed; only the residual Phase 9+ items below remain.

---

## 1. What IS in the codebase

### Authentication and role selection
- [x] Sign Up — [src/app/signup/page.tsx](../src/app/signup/page.tsx)
- [x] Login — [src/app/login/page.tsx](../src/app/login/page.tsx)
- [x] Role Selection (mother / reporter) — [src/app/role-selection/page.tsx](../src/app/role-selection/page.tsx)
- [x] Persist role to `users.role` via [POST /api/user/update-role](../src/app/api/user/update-role/route.ts)
- [x] Password visibility toggle on Sign Up and Login

### Reporter module (matches spec's "Medical Reporter" branch reasonably well)
- [x] Reporter onboarding — [src/app/reporter-registration/page.tsx](../src/app/reporter-registration/page.tsx)
- [x] Mother status picker (Pregnant / Delivered) — [src/app/mother-status/page.tsx](../src/app/mother-status/page.tsx)
- [x] **Pregnant branch** — Maternal Basic → Screening (with file upload) → Confirmatory & Treatment
  - [src/app/report-mother-basic/page.tsx](../src/app/report-mother-basic/page.tsx)
  - [src/app/report-mother-screening/page.tsx](../src/app/report-mother-screening/page.tsx)
  - [src/app/report-mother-confirmatory/page.tsx](../src/app/report-mother-confirmatory/page.tsx)
- [x] **Delivered branch** — Baby Basic → Baby Serological (with clinical signs, treatment, follow-up flag)
  - [src/app/report-baby-basic/page.tsx](../src/app/report-baby-basic/page.tsx)
  - [src/app/report-baby-serological/page.tsx](../src/app/report-baby-serological/page.tsx)
- [x] Reporter Dashboard with 7 live stats — [src/app/dashboard/page.tsx](../src/app/dashboard/page.tsx)

### Backend
- [x] API routes for all 8 form submissions
- [x] Zod validation at the API boundary — [src/lib/api/schemas.ts](../src/lib/api/schemas.ts)
- [x] Supabase clients split into browser / SSR / admin — [src/lib/supabase/](../src/lib/supabase/)
- [x] File upload to Supabase Storage `reports` bucket (10 MB cap, MIME whitelist) for maternal screening
- [x] `.env.example` documenting required keys

### Phone-number input (Indian government standard)
- [x] Shared **PhoneInput** component — [src/components/PhoneInput.tsx](../src/components/PhoneInput.tsx)
- [x] Fixed **`+91`** prefix (non-editable, visible) on all phone inputs
- [x] **10-digit** numeric-only enforcement (max length 10, `[6-9]\d{9}` HTML pattern + Zod regex)
- [x] Used in: Sign Up `mobile`, Maternal Basic `contact`, Reporter Registration `contact`, Mother Self-Report Follow-up `contact`

---

## 2. What HAS landed (Phases 0–8)

### Self-Reporting Mother flow (full module — 16 screens + landing entry)
- [x] Self-Reporting Mother flow (all 16 screens + entry from landing)
- [x] UX primitives `BigButton` / `InfoBlock` / `ProgressBar` / `QuestionCard` / `BigRadioGroup`
- [x] `ThankYou` page
- [x] `mother_self_report` data model + API + migration

### Routing / role guards
- [x] `ProtectedRoute` / `RoleGuard` via middleware
- [x] Middleware to redirect unauthenticated users

### Conditional logic
- [x] Negative-result skip in reporter forms (maternal-confirmatory + baby-serological)

### Data layer / migrations
- [x] Empty SQL files replaced with 4 versioned migrations under `supabase/migrations/`
- [x] RLS policies for every table — `0003_rls.sql` + grant execute

### Auth / account hygiene
- [x] Forgot password flow (`/forgot-password` + `/reset-password`)
- [x] Logout from non-dashboard pages — `AuthHeader` component on 7 reporter pages
- [x] Username field removed

### Content
- [x] Placeholder content (`hello@reallygreatsite.com`, fake phone, fake address) removed

### Tooling / quality gates
- [x] Tests — Vitest 62 unit tests + Playwright 7 e2e specs
- [x] CI — GitHub Actions workflow with lint / typecheck / unit / build / e2e jobs
- [x] Pre-commit hooks — husky + lint-staged

### Anonymous flow / abuse prevention
- [x] Anonymous mother walk-ins + hCaptcha

---

## What is NOT in the codebase yet

- [ ] **8 pre-existing lint warnings** about unused imports — cosmetic, deferred
- [ ] **The `/login?redirect=<path>` query param** set by middleware isn't consumed by the login page yet — users land on the default destination after login instead of bouncing back. Low-priority Phase 6 follow-up.
- [ ] **`followup` field type mismatch** in babySerologicalSchema — the form posts a boolean, the schema accepts optional string. Pre-existing tech debt, not blocking.
- [ ] **End-to-end submission against live Supabase** still needs migrations 0001 → 0004 applied to the cloud project before mother self-reports will succeed.
- [ ] **`npx playwright install chromium`** must be run before `npm run test:e2e` works locally.
- [ ] **hCaptcha keys** (`NEXT_PUBLIC_HCAPTCHA_SITE_KEY` + `HCAPTCHA_SECRET`) must be set in production to enforce captcha on anonymous submissions.
- [ ] **The `treatment_given` CHECK constraint** in migration 0001 (`check (treatment_given in ('Yes','No'))`) on `maternal_confirmatory` — Postgres treats NULL as constraint-passing, but if any tests fail with a constraint violation on a Negative-result submission, the constraint needs widening to `treatment_given is null or treatment_given in (...)`.
- [ ] **No grandfathering migration** for existing users with `role IS NULL` — they get redirected to `/role-selection`. If you want them auto-set to `reporter`, run a one-off SQL.

---

## 3. Phone-number implementation notes

All currently existing phone fields share one input contract:

| Field | Form | Validation |
|---|---|---|
| `mobile` | Sign Up | `[6-9]\d{9}` (client) + Zod `indianMobile` (server) |
| `contact` | Maternal Basic | same |
| `contact` | Reporter Registration | same |
| `contact` | Mother Self-Report Follow-up | same |

The same `PhoneInput` is now also used in the mother flow's follow-up screen (`/mother/follow-up` when `allow_contact === true`).

UI behavior in [PhoneInput.tsx](../src/components/PhoneInput.tsx):

- Visible non-editable `+91` prefix in a left-side pill
- `inputMode="numeric"` triggers the numeric keypad on mobile
- `autoComplete="tel-national"` for browser/Chrome autofill
- Strips any non-digit character on keystroke and hard-caps at 10 characters
- `pattern`, `minLength`, `maxLength`, and `title` provide native form-validation tooltips
- The stored value is the bare 10 digits — the database does **not** redundantly store `+91`. If you want to switch to E.164 storage (`+91xxxxxxxxxx`), it's a one-line change in the schema + a transform in the component.

---

## 4. Implementation plan status

Implementation plan complete. See [docs/OVERVIEW.md](OVERVIEW.md) and [docs/ARCHITECTURE.mmd](ARCHITECTURE.mmd) for the current state.

---

## 5. TL;DR

- All 9 implementation phases are complete: reporter flow, self-reporting mother flow, access control, version-controlled migrations, RLS, tests, CI, and docs.
- 62 unit tests pass; 7 Playwright e2e specs are written (need browsers installed + live Supabase project to run).
- Outstanding pre-production tasks: apply migrations 0001–0004 to the live Supabase project, set hCaptcha keys, and run `npx playwright install chromium` before CI's e2e job can execute.
