create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  location text,
  status text not null default 'active' check (status in ('planning', 'active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.apartment_units (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  apartment_type_id uuid not null references public.apartment_types(id) on delete restrict,
  unit_label text not null,
  floor integer not null check (floor >= 0),
  area_sqm numeric(7, 2) not null check (area_sqm > 0),
  price_eur numeric(12, 2) check (price_eur is null or price_eur >= 0),
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, unit_label)
);

create index if not exists apartment_units_project_id_idx on public.apartment_units(project_id);
create index if not exists apartment_units_type_id_idx on public.apartment_units(apartment_type_id);
create index if not exists apartment_units_status_idx on public.apartment_units(status);

alter table public.client_apartment_assignments
  add column if not exists apartment_unit_id uuid references public.apartment_units(id) on delete set null;

create unique index if not exists client_assignment_unit_unique_idx
  on public.client_apartment_assignments(apartment_unit_id)
  where apartment_unit_id is not null;

create or replace function public.newgen_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'projects_set_updated_at'
      and tgrelid = 'public.projects'::regclass
  ) then
    create trigger projects_set_updated_at
    before update on public.projects
    for each row execute function public.newgen_set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'apartment_units_set_updated_at'
      and tgrelid = 'public.apartment_units'::regclass
  ) then
    create trigger apartment_units_set_updated_at
    before update on public.apartment_units
    for each row execute function public.newgen_set_updated_at();
  end if;
end;
$$;

alter table public.projects enable row level security;
alter table public.apartment_units enable row level security;

insert into public.projects (name, slug, location, status)
values
  ('Residence Nord', 'residence-nord', 'Zona de nord, aproape de centru', 'active'),
  ('Urban Garden', 'urban-garden', 'Acces rapid la scoli si birouri', 'active'),
  ('Skyline Homes', 'skyline-homes', 'Zona panoramica', 'active')
on conflict (slug) do update set
  name = excluded.name,
  location = excluded.location,
  status = excluded.status;

with inventory(project_slug, rooms, unit_label, floor, area_sqm, price_eur, status) as (
  values
    ('residence-nord', 1, 'RN-101', 1, 40.00,  89000.00, 'available'),
    ('residence-nord', 2, 'RN-102', 1, 45.00, 104000.00, 'reserved'),
    ('residence-nord', 3, 'RN-201', 2, 65.00, 135000.00, 'sold'),
    ('residence-nord', 1, 'RN-202', 2, 40.00,  93000.00, 'available'),
    ('residence-nord', 2, 'RN-301', 3, 45.00, 112000.00, 'available'),
    ('residence-nord', 3, 'RN-302', 3, 65.00, 142000.00, 'available'),
    ('urban-garden',   1, 'UG-101', 1, 40.00,  94000.00, 'available'),
    ('urban-garden',   2, 'UG-102', 1, 45.00, 108000.00, 'sold'),
    ('urban-garden',   3, 'UG-201', 2, 65.00, 139000.00, 'available'),
    ('urban-garden',   1, 'UG-202', 2, 40.00,  98000.00, 'reserved'),
    ('urban-garden',   2, 'UG-301', 3, 45.00, 116000.00, 'available'),
    ('urban-garden',   3, 'UG-302', 3, 65.00, 148000.00, 'available'),
    ('skyline-homes',  1, 'SH-101', 1, 40.00, 105000.00, 'available'),
    ('skyline-homes',  2, 'SH-102', 1, 45.00, 128000.00, 'available'),
    ('skyline-homes',  3, 'SH-201', 2, 65.00, 159000.00, 'sold'),
    ('skyline-homes',  1, 'SH-202', 2, 40.00, 109000.00, 'available'),
    ('skyline-homes',  2, 'SH-301', 3, 45.00, 134000.00, 'reserved'),
    ('skyline-homes',  3, 'SH-302', 3, 65.00, 168000.00, 'available')
)
insert into public.apartment_units (
  project_id,
  apartment_type_id,
  unit_label,
  floor,
  area_sqm,
  price_eur,
  status
)
select
  projects.id,
  apartment_types.id,
  inventory.unit_label,
  inventory.floor,
  inventory.area_sqm,
  inventory.price_eur,
  inventory.status
from inventory
join public.projects on projects.slug = inventory.project_slug
join public.apartment_types on apartment_types.rooms = inventory.rooms
on conflict (project_id, unit_label) do update set
  apartment_type_id = excluded.apartment_type_id,
  floor = excluded.floor,
  area_sqm = excluded.area_sqm,
  price_eur = excluded.price_eur,
  status = excluded.status;
