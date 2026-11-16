-- CoachConnect initial database schema
-- Run this in Supabase Dashboard > SQL Editor.
-- This creates the core tables and baseline Row Level Security policies.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.coaches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  bio text not null,
  experience_years integer not null default 0 check (experience_years >= 0),
  hourly_rate numeric(10,2) not null check (hourly_rate >= 0),
  qualifications text[] not null default '{}',
  coaching_specialties text[] not null default '{}',
  profile_image text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.coach_sports (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  sport text not null,
  unique (coach_id, sport)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete set null,
  reviewer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  is_published boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.favourites (
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  coach_id uuid not null references public.coaches(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (athlete_id, coach_id)
);

create table if not exists public.session_requests (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  coach_id uuid not null references public.coaches(id) on delete restrict,
  requested_date date not null,
  requested_time time not null,
  session_type text not null,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security on every table.
alter table public.profiles enable row level security;
alter table public.coaches enable row level security;
alter table public.coach_sports enable row level security;
alter table public.reviews enable row level security;
alter table public.favourites enable row level security;
alter table public.session_requests enable row level security;

-- Profiles: users can read and update only their own profile.
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Coach directory: visitors can read active coaches and their sports.
create policy "Anyone can read active coaches"
on public.coaches for select
to anon, authenticated
using (is_active = true);

create policy "Anyone can read sports for active coaches"
on public.coach_sports for select
to anon, authenticated
using (
  exists (
    select 1 from public.coaches
    where coaches.id = coach_sports.coach_id
      and coaches.is_active = true
  )
);

-- Reviews: only published reviews for active coaches are public.
create policy "Anyone can read published reviews"
on public.reviews for select
to anon, authenticated
using (
  is_published = true
  and exists (
    select 1 from public.coaches
    where coaches.id = reviews.coach_id
      and coaches.is_active = true
  )
);

-- Favourites: each signed-in user manages only their own saved coaches.
create policy "Users can read own favourites"
on public.favourites for select
to authenticated
using (auth.uid() = athlete_id);

create policy "Users can add own favourites"
on public.favourites for insert
to authenticated
with check (auth.uid() = athlete_id);

create policy "Users can remove own favourites"
on public.favourites for delete
to authenticated
using (auth.uid() = athlete_id);

-- Session requests: athletes can submit and view only their own requests.
create policy "Users can read own session requests"
on public.session_requests for select
to authenticated
using (auth.uid() = athlete_id);

create policy "Users can submit own session requests"
on public.session_requests for insert
to authenticated
with check (auth.uid() = athlete_id);

-- No public insert/update/delete policies are created for coach data.
-- Manage sample coach records through the Supabase dashboard / SQL editor.