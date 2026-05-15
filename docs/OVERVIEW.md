# Congenital Syphilis Registry & Analysis (CSRA)

CSRA is a clinical surveillance and reporting platform for congenital syphilis cases. It lets healthcare workers (and self-reporting mothers) register maternal and infant cases, capture screening / confirmatory test results, record treatment, and track follow-ups — and gives administrators an at-a-glance view of caseload and treatment coverage on a dashboard.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Backend | Next.js API routes (Node runtime) |
| Auth & DB | Supabase (Postgres + Supabase Auth + Storage) |
| Validation | Zod schemas at the API boundary |
| Icons | lucide-react |
| Unit tests | Vitest + @testing-library/react |
| E2E tests | Playwright |
| Pre-commit | husky + lint-staged |
| CI | GitHub Actions |

## Roles

- **Self-Reporting Mother** — registers her own pregnancy/delivery and test data.
- **Healthcare Reporter** — clinician/ANM/ASHA/medical officer who registers cases on behalf of patients. Captures their professional details (facility, designation, district) on first login.
- Mothers can also self-report **without signup** via the landing page entry point — these submissions land with `user_id IS NULL`.

## Domain entities

| Table | Purpose |
|---|---|
| `users` | Account row linked 1-1 with `auth.users`. Stores name, mobile, email, role. |
| `reporter_details` | Profile for users with the `reporter` role. |
| `maternal_basic` | Identifying details of the mother (one row per case). |
| `maternal_screening` | First-line screening test result + uploaded report file. |
| `maternal_confirmatory` | Confirmatory test result and treatment record. |
| `baby_basic` | Identifying details of the baby. |
| `baby_serological` | Baby's serological test, clinical signs, treatment, and follow-up flag. |
| `mother_self_report` | One row per self-report submitted through the public mother flow (signed-in or anonymous). |
| `mother_self_report_baby_health` | 1:1 child of `mother_self_report` for the delivered + syphilis-positive baby-health branch. |

## Flows

The app collects data through several flows.

### 1. Authentication

| # | Page | Route | Fields | Submits to |
|---|---|---|---|---|
| 1 | **Sign Up** | `/signup` | Full Name, Mobile, Email, Username, Password (with show/hide toggle) | `POST /api/auth/signup` → creates Supabase Auth user + row in `users` |
| 2 | **Login** | `/login` | Email/Username, Password (with show/hide toggle) | Supabase `signInWithPassword` (client-side) |
| 3 | **Role Selection** | `/role-selection` | Pick `mother` or `reporter` | `POST /api/user/update-role` |
| 4 | **Forgot Password** | `/forgot-password` | Email | Supabase `resetPasswordForEmail` |
| 5 | **Reset Password** | `/reset-password` | New Password, Confirm Password | Supabase `updateUser` (recovery session) |

### 2. Reporter onboarding (one-time, for `reporter` role)

| # | Page | Route | Fields | Submits to |
|---|---|---|---|---|
| 1 | **Reporter Registration** | `/reporter-registration` | Full Name, Age, Qualification, Designation (ANM/ASHA/Medical Officer/Staff Nurse/Counsellor/Paediatrician/DEO/Venereologist/Other), Facility Name, District/State, Contact, Facility Type (Sub Centre → District Hospital → SNCU/NICU/DSRC/Private) | `POST /api/reports/reporter-registration` |

### 3. Maternal reporting flow (3-step wizard, reporter)

Triggered from the dashboard → "Report Mother" → **Mother Status** picker (`/mother-status`). Choosing **Pregnant** starts the maternal flow; **Delivered** jumps straight to the baby flow. The maternal case is keyed by `maternalBasicId` carried in `sessionStorage` between steps.

| # | Page | Route | Fields | Submits to |
|---|---|---|---|---|
| 1 | **Maternal Basic Details** | `/report-mother-basic` | Full Name, Age, Location, MCTS ID, Contact | `POST /api/reports/maternal-basic` — returns `maternalBasicId` |
| 2 | **Maternal Screening** | `/report-mother-screening` | Test Type (RPR/VDRL/TPPA/FTA), Test Date, Titres, Result (Positive/Negative/Inconclusive), **File upload** (PDF/JPG/PNG, max 10 MB) | `POST /api/reports/maternal-screening` (multipart) — file goes to Supabase Storage bucket `reports` |
| 3 | **Maternal Confirmatory & Treatment** | `/report-mother-confirmatory` | Confirmatory Test (TPPA/FTA/TP-PA), Test Date, Titres, Result; Treatment Given (Yes/No) → Drug Name, Dose, Treatment Date — **treatment subsection only shown when Result = Positive** | `POST /api/reports/maternal-confirmatory` |

### 4. Baby reporting flow (2-step wizard, reporter)

Triggered from the dashboard → "Report Baby", or from the **Delivered** branch of mother status. Keyed by `babyBasicId` in `sessionStorage`.

| # | Page | Route | Fields | Submits to |
|---|---|---|---|---|
| 1 | **Baby Basic Details** | `/report-baby-basic` | Name, Delivery Date, Age, MCTS ID, Birth Weight (kg), Location, Gender | `POST /api/reports/baby-basic` — returns `babyBasicId` |
| 2 | **Baby Serological Results** | `/report-baby-serological` | Test Type, Test Date, Titres, Maternal Titres, Result; clinical signs (Manifestations, Prematurity, Low Birth Weight, Complications — each Yes/No); Treatment (Given Yes/No/Ongoing, Drug, Dose, Treatment Date) — **treatment subsection only shown when Result = Positive**; Follow-up Required (checkbox) | `POST /api/reports/baby-serological` |

Both reporter-side confirmatory forms (maternal confirmatory and baby serological) now hide the treatment subsection when the result is not Positive; the corresponding Zod schemas enforce this rule via `superRefine`.

### 5. Self-Reporting Mother flow (~11 screens)

A public, conditional wizard reachable from the landing page. Anonymous walk-ins are allowed; if a mother is signed in her `user_id` is captured automatically. State is held client-side and the entire payload is submitted as a single atomic request at the final review step (`POST /api/reports/mother-self-report`), which calls the `submit_mother_self_report` Postgres function. The number of screens shown varies (8–14) because the **Delivered + Positive** branch unlocks three extra baby-health screens.

| # | Page | Route | Fields | Submits to |
|---|---|---|---|---|
| 1 | **Start** | `/mother/start` | Name, Age, Location (GPS auto-capture or manual text) | (held in state) |
| 2 | **Status** | `/mother/status` | Pregnant or Delivered (BigRadioGroup) | (held in state) |
| 3a | **About (Pregnant)** | `/mother/pregnant/about` | Months pregnant, ANC received, Doctor name | (held in state) |
| 4a | **Info 1 (Pregnant)** | `/mother/pregnant/info-1` | Informational block — no fields | — |
| 5a | **Testing (Pregnant)** | `/mother/pregnant/testing` | Tested for syphilis (Yes/No), Result (Positive/Negative/Unknown) | (held in state) |
| 6a | **Treatment (Pregnant)** | `/mother/pregnant/treatment` | Took treatment, Doses count — **shown only when Result = Positive** | (held in state) |
| 3b | **Baby (Delivered)** | `/mother/delivered/baby` | Baby name, Delivery year, Delivery place | (held in state) |
| 4b | **ANC (Delivered)** | `/mother/delivered/anc` | ANC received, Doctor name | (held in state) |
| 5b | **Info 1 (Delivered)** | `/mother/delivered/info-1` | Informational block — no fields | — |
| 6b | **Testing (Delivered)** | `/mother/delivered/testing` | Tested during pregnancy, Tested for syphilis, Result | (held in state) |
| 7b | **Treatment (Delivered)** | `/mother/delivered/treatment` | Took treatment, Doses count, Treatment when — **shown only when Result = Positive** | (held in state) |
| 8b | **Info 2 (Delivered)** | `/mother/delivered/info-2` | Informational block — **shown only when Result = Positive** | — |
| 9b | **Baby Health 1** | `/mother/delivered/baby-health-1` | Baby health questions (part 1) — **positive-only** | (held in state) |
| 10b | **Baby Health 2** | `/mother/delivered/baby-health-2` | Baby health questions (part 2) — **positive-only** | (held in state) |
| 11b | **Baby Health 3** | `/mother/delivered/baby-health-3` | Baby health questions (part 3) — **positive-only** | (held in state) |
| F1 | **Follow-up** | `/mother/follow-up` | Visiting doctor, Allow contact, Contact phone | (held in state) |
| F2 | **Review** | `/mother/review` | Read-only summary, hCaptcha widget (anonymous only) | `POST /api/reports/mother-self-report` |
| F3 | **Thank You** | `/mother/thank-you` | Confirmation screen — no fields | — |

Branch summary:
- **Pregnant + Negative/Unknown** skips `pregnant/treatment`.
- **Delivered + Negative/Unknown** skips `delivered/treatment`, `delivered/info-2`, and all three `baby-health-*` screens.

## Dashboard

Route: `/dashboard`. Shows 7 live stats served by `GET /api/dashboard/stats` (moved server-side; replaces the previous browser-direct Supabase reads).

| Stat | Source |
|---|---|
| Total Mothers Reported | `count(maternal_basic)` |
| Total Babies Reported | `count(baby_basic)` |
| Syphilis-Affected Mothers | distinct `maternal_basic_id` where `result='Positive'` in `maternal_screening` ∪ `maternal_confirmatory` |
| Syphilis-Affected Babies | distinct `baby_basic_id` where `result='Positive'` in `baby_serological` |
| Treated Mothers | distinct `maternal_basic_id` in `maternal_confirmatory` where `treatment_given='Yes'` |
| Treated Babies | distinct `baby_basic_id` in `baby_serological` where `treatment_given='Yes'` |
| Pending Follow-ups | `count(baby_serological)` where `followup_required=true` |

The card shows skeleton loaders during fetch and a Retry banner on failure.

## API surface

All endpoints validated with Zod (see [src/lib/api/schemas.ts](../src/lib/api/schemas.ts)).

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/signup` | Create auth user + insert into `users`. Uses admin (service-role) client. |
| `POST /api/user/update-role` | Set `users.role`. Admin client. |
| `POST /api/reports/reporter-registration` | Insert into `reporter_details`. |
| `POST /api/reports/maternal-basic` | Insert into `maternal_basic`, return id. |
| `POST /api/reports/maternal-screening` | Multipart: validates fields, uploads file to Storage (10 MB cap, MIME whitelist of jpeg/png/webp/pdf), inserts into `maternal_screening`. |
| `POST /api/reports/maternal-confirmatory` | Insert into `maternal_confirmatory`. Zod `superRefine` requires treatment fields only when result is Positive. |
| `POST /api/reports/baby-basic` | Insert into `baby_basic`, return id. |
| `POST /api/reports/baby-serological` | Insert into `baby_serological`. Zod `superRefine` requires treatment fields only when result is Positive. |
| `POST /api/reports/mother-self-report` | Atomic insert via the `submit_mother_self_report` Postgres function (parent row + optional baby-health child row). Verifies hCaptcha when the caller is anonymous. |
| `GET /api/dashboard/stats` | Returns the 7 dashboard stats; replaces the previous browser-direct Supabase reads. |

## Access control

`src/middleware.ts` runs on every non-static request and classifies the path as **reporter-only**, **mother-flow**, or **public**. Reporter-only paths require a Supabase session whose `users.role` is `reporter`; mothers hitting these paths are redirected to `/mother/thank-you`, users with no role go to `/role-selection`. Mother-flow paths are open to anonymous traffic, but a signed-in reporter is bounced back to `/dashboard`. Public paths pass through unchanged. RLS policies (migration `0003_rls.sql`) act as the second line of defence so that even a leaked session cannot read or write rows belonging to another user.

| Class | Examples | Auth required | Role gate |
|---|---|---|---|
| Reporter-only pages | `/dashboard`, `/reporter-registration`, `/mother-status`, `/report-mother-*`, `/report-baby-*` | Yes | `reporter` |
| Reporter-only APIs | `/api/dashboard/*`, `/api/user/*`, all `/api/reports/*` except `mother-self-report` | Yes | `reporter` |
| Mother flow | `/mother`, `/mother/**`, `POST /api/reports/mother-self-report` | No | Reporters redirected to `/dashboard` |
| Public | `/`, `/login`, `/signup`, `/role-selection`, `/forgot-password`, `/reset-password`, static assets | No | — |

## Supabase clients

Three factories in [src/lib/supabase/](../src/lib/supabase/):

- `client.ts` — browser client, uses anon key. For client components.
- `server.ts` — server client wired to Next cookies; respects the signed-in user's session. For server components and most API routes. The `mother_self_report` insert uses this client so that the signed-in user's `user_id` is captured automatically when present; anonymous submissions cleanly land with `user_id IS NULL`.
- `admin.ts` — service-role client. Only for `signup` and `update-role` where elevated writes against `auth.admin` and the `users` table are needed.

## Testing

- **Unit**: 62 Vitest specs covering schemas, components, and helpers. Run with `npm run test`.
- **E2E**: 7 Playwright specs covering the reporter and mother flows. Run with `npm run test:e2e`. Requires `npx playwright install chromium` and a Supabase test project (URL + anon key in `.env.local`).

## Local development

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the Supabase keys.
3. Apply database migrations: `supabase db reset` (Supabase CLI) or paste the four files into the Supabase dashboard SQL editor in order — `0001_initial.sql` → `0002_mother_self_report.sql` → `0003_rls.sql` → `0004_submit_rpc.sql`.
4. (Optional) Set `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` and `HCAPTCHA_SECRET` to enable hCaptcha verification on anonymous mother self-reports. With `HCAPTCHA_SECRET` unset, the API bypasses captcha verification (development mode).
5. `npm run dev`
6. Quality gates: `npm run test`, `npm run test:e2e`, `npm run typecheck`, `npm run lint`.

## Environment

See [`.env.example`](../.env.example):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
HCAPTCHA_SECRET=
```

The three Supabase keys are required; the two hCaptcha keys are optional (omitting `HCAPTCHA_SECRET` bypasses captcha verification, which is convenient for local development).

## See also

- [USER_FLOW.mmd](USER_FLOW.mmd) — end-to-end user journey
- [ARCHITECTURE.mmd](ARCHITECTURE.mmd) — runtime architecture and data tables
- [AUDIT.md](AUDIT.md) — audit log
