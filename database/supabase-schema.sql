create extension if not exists "pgcrypto";

create table if not exists public.client_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  name text not null,
  email text not null unique,
  phone text,
  apartment_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.client_profiles enable row level security;

create policy "Clients can read their own profile"
  on public.client_profiles
  for select
  using (auth.uid() = user_id);

create policy "Service role can manage client profiles"
  on public.client_profiles
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create index if not exists client_profiles_user_id_idx on public.client_profiles(user_id);
create index if not exists client_profiles_email_idx on public.client_profiles(email);
