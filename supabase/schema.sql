create table if not exists professionals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  crfa text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references professionals(id) on delete cascade,
  name text not null,
  birth_date date not null,
  guardians text not null,
  phone text not null,
  diagnosis text not null,
  exercises text[] not null default '{}',
  session_day text not null,
  session_time text not null,
  created_at timestamptz not null default now()
);

create table if not exists session_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  exercise_id text not null,
  exercise_name text not null,
  score integer not null,
  total integer not null,
  notes text not null,
  badge_id text not null,
  badge_name text not null,
  badge_image text not null,
  attempts jsonb not null default '[]'::jsonb,
  audio_clips jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table professionals enable row level security;
alter table patients enable row level security;
alter table session_records enable row level security;

-- Em producao, conecte essas tabelas ao Supabase Auth e crie policies por usuario autenticado.
