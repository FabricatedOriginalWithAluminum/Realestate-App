begin;

create extension if not exists "pgcrypto";

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('client', 'developer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.user_roles (user_id, role)
select user_id, 'client'
from public.client_profiles
on conflict (user_id) do nothing;

create table if not exists public.developer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.apartment_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  rooms smallint not null check (rooms >= 1),
  area_sqm numeric(6, 2) not null check (area_sqm > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.apartment_types (code, name, rooms, area_sqm)
values
  ('studio', 'Studio', 1, 40),
  ('two_rooms', 'Apartament cu 2 camere', 2, 45),
  ('three_rooms', 'Apartament cu 3 camere', 3, 65)
on conflict (code) do update
set
  name = excluded.name,
  rooms = excluded.rooms,
  area_sqm = excluded.area_sqm,
  active = true,
  updated_at = now();

create table if not exists public.client_apartment_assignments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.client_profiles(id) on delete cascade,
  apartment_type_id uuid not null references public.apartment_types(id),
  project_name text,
  unit_label text,
  floor smallint,
  assigned_by uuid not null references auth.users(id),
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists client_apartment_unit_unique_idx
  on public.client_apartment_assignments (
    lower(coalesce(project_name, '')),
    lower(unit_label)
  )
  where unit_label is not null;

create index if not exists client_apartment_assignments_type_idx
  on public.client_apartment_assignments(apartment_type_id);

alter table public.user_roles enable row level security;
alter table public.developer_profiles enable row level security;
alter table public.apartment_types enable row level security;
alter table public.client_apartment_assignments enable row level security;

create policy "Users can read their own role"
  on public.user_roles
  for select
  using (auth.uid() = user_id);

create policy "Developers can read their own profile"
  on public.developer_profiles
  for select
  using (auth.uid() = user_id);

create policy "Authenticated users can read apartment types"
  on public.apartment_types
  for select
  to authenticated
  using (active = true);

create policy "Clients can read their apartment assignment"
  on public.client_apartment_assignments
  for select
  using (
    exists (
      select 1
      from public.client_profiles
      where client_profiles.id = client_apartment_assignments.client_id
        and client_profiles.user_id = auth.uid()
    )
  );

create policy "Developers can manage apartment assignments"
  on public.client_apartment_assignments
  for all
  using (
    exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'developer'
    )
  )
  with check (
    exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'developer'
    )
  );

create policy "Developers can read client profiles"
  on public.client_profiles
  for select
  using (
    exists (
      select 1
      from public.user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'developer'
    )
  );

commit;
