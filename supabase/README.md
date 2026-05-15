# CSRA — Supabase

This directory holds the version-controlled database schema for CSRA. The Supabase cloud project is the runtime; the SQL in [`migrations/`](migrations/) is the source of truth.

## Migrations

| File | Purpose |
|---|---|
| [`migrations/0001_initial.sql`](migrations/0001_initial.sql) | Reporter-side tables: `users`, `reporter_details`, `maternal_basic`, `maternal_screening`, `maternal_confirmatory`, `baby_basic`, `baby_serological`. |
| [`migrations/0002_mother_self_report.sql`](migrations/0002_mother_self_report.sql) | Self-Reporting Mother tables: `mother_self_report` (parent) + `mother_self_report_baby_health` (1:1 child, populated only for delivered + positive path). |
| [`migrations/0003_rls.sql`](migrations/0003_rls.sql) | Row Level Security policies for every table. Defines a `current_user_role()` security-definer helper. |

Future migrations land here as `0004_*.sql`, `0005_*.sql`, etc. — monotonically increasing, dated comment at the top of each file, and idempotent (`create table if not exists`, `drop policy if exists` before `create policy`).

## Storage buckets

The maternal screening flow uploads files to a Supabase Storage bucket named `reports`. Create it via the Supabase dashboard or CLI:

```
supabase storage create reports
```

The API at [`src/app/api/reports/maternal-screening/route.ts`](../src/app/api/reports/maternal-screening/route.ts) enforces a 10 MB cap and an `image/jpeg|png|webp` / `application/pdf` MIME whitelist before upload.

## Running migrations against a Supabase project

### Cloud (production / staging)

Open the Supabase dashboard → SQL editor → paste each file in order (`0001` → `0002` → `0003`) and run. Idempotent, so safe to re-run a migration if you tweak it. For new migrations going forward, paste only the new file.

If you have the Supabase CLI linked to a project (`supabase link --project-ref <ref>`):

```
supabase db push
```

### Local Supabase (development)

```
supabase init        # once, in repo root if not already done
supabase start       # boots local Postgres + Studio at http://localhost:54323
supabase db reset    # applies all files in migrations/ from scratch
```

After `db reset`, the local DB has every table, every constraint, and every RLS policy applied — matching production exactly. Set your `.env.local` to point at the local URL/keys printed by `supabase start` to develop offline.

## Row Level Security model

- **Service role** (used by [`src/lib/supabase/admin.ts`](../src/lib/supabase/admin.ts)) bypasses RLS — used only for signup and role update.
- **Anon key** (browser, [`src/lib/supabase/client.ts`](../src/lib/supabase/client.ts)) and **authenticated cookie session** (SSR, [`src/lib/supabase/server.ts`](../src/lib/supabase/server.ts)) are gated by the policies in `0003_rls.sql`.
- Reporter-side tables: select/insert/update gated by `current_user_role() = 'reporter'`.
- `mother_self_report` insert is open (anyone, including anonymous walk-ins, can submit). Reads are restricted to the submitter or any reporter.
- `users` is readable/updatable only by the row owner.

When you add a new table, add it to `0003_rls.sql` (or a follow-up migration) — never leave a table without RLS enabled.

## Schema conventions

- Every table has `id uuid primary key default gen_random_uuid()`.
- Every table has `created_at timestamptz not null default now()` (or `submitted_at` for the mother report).
- Foreign keys cascade on delete by default; nullable FKs use `on delete set null`.
- Enum-like fields are `text` + a `check (… in (…))` constraint — easier to migrate than Postgres enums.
- All tables live in the `public` schema. Always reference them as `public.<table>` in migrations for clarity.
