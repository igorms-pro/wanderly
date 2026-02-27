-- 008_user_sessions_and_login_history.sql
-- Sessions & login history tracking (inspired by OneLink)

-- USER SESSIONS
-- Tracks active user sessions for security and device management
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  device_os text,
  device_browser text,
  ip_address inet,
  city text,
  country text,
  last_activity timestamptz not null default now(),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists user_sessions_user_id_idx on public.user_sessions(user_id);
create index if not exists user_sessions_active_idx
  on public.user_sessions(user_id, revoked_at)
  where revoked_at is null;

alter table public.user_sessions enable row level security;

-- Users can only read/revoke their own sessions
do
$$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_sessions'
      and policyname = 'user_sessions_owner_all'
  ) then
    create policy "user_sessions_owner_all"
      on public.user_sessions for all
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end
$$;

-- LOGIN HISTORY
-- Tracks login attempts (success and failures)
create table if not exists public.login_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  email text not null,
  status text not null, -- 'success' | 'failed'
  ip_address inet,
  device_info text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists login_history_user_id_idx on public.login_history(user_id);
create index if not exists login_history_email_idx on public.login_history(email);
create index if not exists login_history_created_at_idx
  on public.login_history(created_at desc);

alter table public.login_history enable row level security;

-- Users can only read their own login history
do
$$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'login_history'
      and policyname = 'login_history_owner_select'
  ) then
    create policy "login_history_owner_select"
      on public.login_history for select
      to authenticated
      using (user_id = auth.uid());
  end if;
end
$$;

-- Public (anon + authenticated) can insert login history rows
do
$$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'login_history'
      and policyname = 'login_history_public_insert'
  ) then
    create policy "login_history_public_insert"
      on public.login_history for insert
      to anon, authenticated
      with check (true);
  end if;
end
$$;

