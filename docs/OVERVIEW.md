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

## Roles

- **Self-Reporting Mother** — registers her own pregnancy/delivery and test data.
- **Healthcare Reporter** — clinician/ANM/ASHA/medical officer who registers cases on behalf of patients. Captures their professional details (facility, designation, district) on first login.

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

## Forms

The app collects data through 8 forms, grouped into 3 flows.

### 1. Authentication

| # | Page | Route | Fields | Submits to |
|---|---|---|---|---|
| 1 | **Sign Up** | `/signup` | Full Name, Mobile, Email, Username, Password (with show/hide toggle) | `POST /api/auth/signup` → creates Supabase Auth user + row in `users` |
| 2 | **Login** | `/login` | Email/Username, Password (with show/hide toggle) | Supabase `signInWithPassword` (client-side) |
| 3 | **Role Selection** | `/role-selection` | Pick `mother` or `reporter` | `POST /api/user/update-role` |

### 2. Reporter onboarding (one-time, for `reporter` role)

| # | Page | Route | Fields | Submits to |
|---|---|---|---|---|
| 4 | **Reporter Registration** | `/reporter-registration` | Full Name, Age, Qualification, Designation (ANM/ASHA/Medical Officer/Staff Nurse/Counsellor/Paediatrician/DEO/Venereologist/Other), Facility Name, District/State, Contact, Facility Type (Sub Centre → District Hospital → SNCU/NICU/DSRC/Private) | `POST /api/reports/reporter-registration` |

### 3. Maternal reporting flow (3-step wizard)

Triggered from the dashboard → "Report Mother" → **Mother Status** picker (`/mother-status`). Choosing **Pregnant** starts the maternal flow; **Delivered** jumps straight to the baby flow. The maternal case is keyed by `maternalBasicId` carried in `sessionStorage` between steps.

| # | Page | Route | Fields | Submits to |
|---|---|---|---|---|
| 5 | **Maternal Basic Details** | `/report-mother-basic` | Full Name, Age, Location, MCTS ID, Contact | `POST /api/reports/maternal-basic` — returns `maternalBasicId` |
| 6 | **Maternal Screening** | `/report-mother-screening` | Test Type (RPR/VDRL/TPPA/FTA), Test Date, Titres, Result (Positive/Negative/Inconclusive), **File upload** (PDF/JPG/PNG, max 10 MB) | `POST /api/reports/maternal-screening` (multipart) — file goes to Supabase Storage bucket `reports` |
| 7 | **Maternal Confirmatory & Treatment** | `/report-mother-confirmatory` | Confirmatory Test (TPPA/FTA/TP-PA), Test Date, Titres, Result; Treatment Given (Yes/No) → Drug Name (Benzathine Penicillin G / Ceftriaxone / Azithromycin), Dose, Treatment Date | `POST /api/reports/maternal-confirmatory` |

### 4. Baby reporting flow (2-step wizard)

Triggered from the dashboard → "Report Baby", or from the **Delivered** branch of mother status. Keyed by `babyBasicId` in `sessionStorage`.

| # | Page | Route | Fields | Submits to |
|---|---|---|---|---|
| 8 | **Baby Basic Details** | `/report-baby-basic` | Name, Delivery Date, Age, MCTS ID, Birth Weight (kg), Location, Gender | `POST /api/reports/baby-basic` — returns `babyBasicId` |
| 9 | **Baby Serological Results** | `/report-baby-serological` | Test Type, Test Date, Titres, Maternal Titres, Result; clinical signs (Manifestations, Prematurity, Low Birth Weight, Complications — each Yes/No); Treatment (Given Yes/No/Ongoing, Drug, Dose, Treatment Date); Follow-up Required (checkbox) | `POST /api/reports/baby-serological` |

## Dashboard

Route: `/dashboard`. Shows 7 live stats computed from Supabase queries:

| Stat | Source |
|---|---|
| Total Mothers Reported | `count(maternal_basic)` |
| Total Babies Reported | `count(baby_basic)` |
| Syphilis-Affected Mothers | distinct `maternal_basic_id` where `result='Positive'` in `maternal_screening` ∪ `maternal_confirmatory` |
| Syphilis-Affected Babies | distinct `baby_basic_id` where `result='Positive'` in `baby_serological` |
| Treated Mothers | distinct `maternal_basic_id` in `maternal_confirmatory` where `treatment_given='Yes'` |
| Treated Babies | distinct `baby_basic_id` in `baby_serological` where `treatment_given='Yes'` |
| Pending Follow-ups | `count(baby_serological)` where `followup_required=true` |

All 8 queries are issued in parallel; the card shows skeleton loaders during fetch and a Retry banner on failure.

## API surface

All POST endpoints, all validated with Zod (see [src/lib/api/schemas.ts](../src/lib/api/schemas.ts)).

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/signup` | Create auth user + insert into `users`. Uses admin (service-role) client. |
| `POST /api/user/update-role` | Set `users.role`. Admin client. |
| `POST /api/reports/reporter-registration` | Insert into `reporter_details`. |
| `POST /api/reports/maternal-basic` | Insert into `maternal_basic`, return id. |
| `POST /api/reports/maternal-screening` | Multipart: validates fields, uploads file to Storage (10 MB cap, MIME whitelist of jpeg/png/webp/pdf), inserts into `maternal_screening`. |
| `POST /api/reports/maternal-confirmatory` | Insert into `maternal_confirmatory`. |
| `POST /api/reports/baby-basic` | Insert into `baby_basic`, return id. |
| `POST /api/reports/baby-serological` | Insert into `baby_serological`. |

## Supabase clients

Three factories in [src/lib/supabase/](../src/lib/supabase/):

- `client.ts` — browser client, uses anon key. For client components.
- `server.ts` — server client wired to Next cookies; respects the signed-in user's session. For server components and most API routes.
- `admin.ts` — service-role client. Only for `signup` and `update-role` where elevated writes against `auth.admin` and the `users` table are needed.

## Environment

See [`.env.example`](../.env.example):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## See also

- [USER_FLOW.mmd](USER_FLOW.mmd) — end-to-end user journey
- [ARCHITECTURE.mmd](ARCHITECTURE.mmd) — runtime architecture and data tables
