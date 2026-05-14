-- ============================================================
-- VELA — Supabase Database Schema
-- Ejecutar en: Supabase > SQL Editor > New Query
-- ============================================================

-- ---- Extensions ----
create extension if not exists "pgcrypto";

-- ---- Helper: Generate 6-char alphanumeric code ----
create or replace function generate_session_code()
returns text language plpgsql as $$
declare
  code text;
  exists boolean;
begin
  loop
    -- AB12CD format: 2 letters + 2 digits + 2 letters
    code := upper(
      chr(trunc(65 + random()*26)::int) ||
      chr(trunc(65 + random()*26)::int) ||
      trunc(10 + random()*90)::text ||
      chr(trunc(65 + random()*26)::int) ||
      chr(trunc(65 + random()*26)::int)
    );
    select exists(
      select 1 from sessions where sessions.code = code and status = 'lobby'
    ) into exists;
    exit when not exists;
  end loop;
  return code;
end;
$$;

-- ---- Profiles (extends auth.users) ----
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  phone         text,
  avatar_url    text,
  safe_word     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---- Emergency contacts ----
create table if not exists emergency_contacts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  name       text not null,
  relation   text not null default '',
  phone      text not null,
  created_at timestamptz not null default now()
);

-- ---- Sessions (salidas) ----
create table if not exists sessions (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  venue       text,
  host_id     uuid not null references profiles(id),
  status      text not null default 'lobby' check (status in ('lobby','active','ended')),
  started_at  timestamptz,
  ended_at    timestamptz,
  created_at  timestamptz not null default now()
);

-- ---- Session members ----
create table if not exists session_members (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  status      text not null default 'lobby' check (status in ('lobby','ready','active','bathroom','taxi','ended')),
  last_seen_at timestamptz,
  lat         double precision,
  lng         double precision,
  joined_at   timestamptz not null default now(),
  unique(session_id, user_id)
);

-- ---- Panic alerts ----
create table if not exists panic_alerts (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  user_id     uuid not null references profiles(id),
  lat         double precision,
  lng         double precision,
  resolved_at timestamptz,
  created_at  timestamptz not null default now()
);

-- ---- Taxi registrations ----
create table if not exists taxi_registrations (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references sessions(id) on delete cascade,
  user_id      uuid not null references profiles(id),
  plate        text not null,
  app          text not null check (app in ('Uber','InDrive','Cabify','Taxi normal')),
  destination  text not null,
  eta_minutes  int not null default 25,
  created_at   timestamptz not null default now()
);

-- ---- Bathroom timers ----
create table if not exists bathroom_timers (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references sessions(id) on delete cascade,
  user_id          uuid not null references profiles(id),
  duration_minutes int not null,
  expires_at       timestamptz not null,
  returned_at      timestamptz,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table emergency_contacts enable row level security;
alter table sessions enable row level security;
alter table session_members enable row level security;
alter table panic_alerts enable row level security;
alter table taxi_registrations enable row level security;
alter table bathroom_timers enable row level security;

-- Profiles: users can read any profile (needed for member lists), edit own
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Emergency contacts: own only
create policy "contacts_all" on emergency_contacts
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Sessions: anyone authenticated can read; only authenticated can insert
create policy "sessions_select" on sessions for select using (auth.role() = 'authenticated');
create policy "sessions_insert" on sessions for insert with check (auth.uid() = host_id);
create policy "sessions_update" on sessions for update using (auth.uid() = host_id);

-- Session members: session members can read all members of their sessions
create policy "members_select" on session_members for select
  using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from session_members sm2
      where sm2.session_id = session_members.session_id
        and sm2.user_id = auth.uid()
    )
  );
create policy "members_insert" on session_members for insert with check (auth.role() = 'authenticated');
create policy "members_update" on session_members for update using (auth.uid() = user_id);

-- Panic alerts: members can insert; all session members can read
create policy "panic_select" on panic_alerts for select
  using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from session_members sm
      where sm.session_id = panic_alerts.session_id
        and sm.user_id = auth.uid()
    )
  );
create policy "panic_insert" on panic_alerts for insert with check (auth.uid() = user_id);
create policy "panic_update" on panic_alerts for update using (auth.uid() = user_id);

-- Taxi: session members
create policy "taxi_select" on taxi_registrations for select
  using (auth.role() = 'authenticated' and exists (
    select 1 from session_members sm
    where sm.session_id = taxi_registrations.session_id and sm.user_id = auth.uid()
  ));
create policy "taxi_insert" on taxi_registrations for insert with check (auth.uid() = user_id);

-- Bathroom: session members
create policy "bathroom_select" on bathroom_timers for select
  using (auth.role() = 'authenticated' and exists (
    select 1 from session_members sm
    where sm.session_id = bathroom_timers.session_id and sm.user_id = auth.uid()
  ));
create policy "bathroom_insert" on bathroom_timers for insert with check (auth.uid() = user_id);
create policy "bathroom_update" on bathroom_timers for update using (auth.uid() = user_id);

-- ============================================================
-- REALTIME
-- ============================================================
-- Enable realtime for session_members and panic_alerts
alter publication supabase_realtime add table session_members;
alter publication supabase_realtime add table panic_alerts;
