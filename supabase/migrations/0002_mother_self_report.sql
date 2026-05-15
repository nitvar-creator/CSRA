-- 0002_mother_self_report.sql — Self-Reporting Mother flow tables (parent + 1:1 baby-health child).

create table if not exists public.mother_self_report (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    name text not null,
    age int not null check (age between 10 and 80),
    gps_lat double precision,
    gps_lng double precision,
    location_text text,
    check ((gps_lat is not null and gps_lng is not null) or (location_text is not null and length(trim(location_text)) > 0)),
    status text not null check (status in ('pregnant','delivered')),
    months_pregnant int check (months_pregnant between 1 and 10),
    anc_received boolean,
    doctor_name text,
    tested_during_pregnancy boolean,
    tested_for_syphilis boolean,
    syphilis_result text check (syphilis_result in ('positive','negative','dont_know')),
    took_treatment boolean,
    doses_count int check (doses_count between 1 and 3),
    baby_name text,
    delivery_year int check (delivery_year between 1950 and 2100),
    delivery_place text,
    treatment_when date,
    visiting_doctor boolean,
    allow_contact boolean,
    contact_phone text check (contact_phone is null or contact_phone ~ '^[6-9][0-9]{9}$'),
    submitted_at timestamptz not null default now()
);

create index if not exists mother_self_report_user_id_idx on public.mother_self_report (user_id);
create index if not exists mother_self_report_status_idx on public.mother_self_report (status);
create index if not exists mother_self_report_submitted_at_idx on public.mother_self_report (submitted_at desc);

create table if not exists public.mother_self_report_baby_health (
    id uuid primary key default gen_random_uuid(),
    report_id uuid not null unique references public.mother_self_report(id) on delete cascade,
    doctor_said_infection boolean,
    baby_tested_syphilis boolean,
    baby_tested_hiv boolean,
    baby_unwell boolean,
    baby_fever boolean,
    baby_skin_rashes boolean,
    baby_feeding_difficulty boolean,
    created_at timestamptz not null default now()
);
