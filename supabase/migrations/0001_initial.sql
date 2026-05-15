-- 0001_initial.sql — Reporter-side schema for CSRA. Captures the live schema as of 2026-05-15.

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  mobile text,
  email text not null unique,
  role text check (role in ('mother','reporter')),
  created_at timestamptz not null default now()
);

create table if not exists public.reporter_details (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  full_name text not null,
  age int not null check (age between 0 and 150),
  qualification text not null,
  designation text not null,
  facility_name text not null,
  district text not null,
  contact text not null,
  facility_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists reporter_details_user_id_idx on public.reporter_details(user_id);

create table if not exists public.maternal_basic (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  age int not null check (age between 0 and 150),
  location text not null,
  mcts_id text not null,
  contact text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.maternal_screening (
  id uuid primary key default gen_random_uuid(),
  maternal_basic_id uuid not null references public.maternal_basic(id) on delete cascade,
  test_type text not null,
  test_date date not null,
  titres text not null,
  result text not null check (result in ('Positive','Negative','Inconclusive')),
  file_name text,
  file_url text,
  created_at timestamptz not null default now()
);

create index if not exists maternal_screening_maternal_basic_id_idx on public.maternal_screening(maternal_basic_id);

create table if not exists public.maternal_confirmatory (
  id uuid primary key default gen_random_uuid(),
  maternal_basic_id uuid not null references public.maternal_basic(id) on delete cascade,
  test_type text not null,
  test_date date not null,
  titres text not null,
  result text not null check (result in ('Positive','Negative','Inconclusive')),
  treatment_given text not null check (treatment_given in ('Yes','No')),
  drug_name text,
  dose text,
  treatment_date date,
  created_at timestamptz not null default now()
);

create index if not exists maternal_confirmatory_maternal_basic_id_idx on public.maternal_confirmatory(maternal_basic_id);

create table if not exists public.baby_basic (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  delivery_date date,
  age int not null check (age between 0 and 150),
  mcts_id text not null,
  weight numeric(5,2) not null check (weight between 0 and 20),
  location text not null,
  gender text not null check (gender in ('male','female','other')),
  created_at timestamptz not null default now()
);

create table if not exists public.baby_serological (
  id uuid primary key default gen_random_uuid(),
  baby_basic_id uuid references public.baby_basic(id) on delete cascade,
  test_type text not null,
  test_date date,
  titres text not null,
  result text not null check (result in ('Positive','Negative','Inconclusive')),
  maternal_titres text,
  manifestations text,
  prematurity text,
  low_birth_weight text,
  complications text,
  treatment_given text,
  drug_name text,
  dose text,
  treatment_date date,
  followup_required text,
  created_at timestamptz not null default now()
);

create index if not exists baby_serological_baby_basic_id_idx on public.baby_serological(baby_basic_id);
