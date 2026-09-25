-- lume waitlist schema. Run in Supabase → SQL Editor (safe to re-run).

-- ── Waitlist ────────────────────────────────────────────────────────────────
create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null check (char_length(name) between 1 and 40),
  email       text        not null unique check (email = lower(email) and char_length(email) <= 254),
  year        text        not null check (year in ('1st year', '2nd year', '3rd year', 'Postgraduate')),
  is_adult    boolean     not null check (is_adult),
  consent     boolean     not null check (consent),
  created_at  timestamptz not null default now()
);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

-- RLS on, and no policies: anon/authenticated can't select, insert, update or delete.
-- All writes go through /api/join using the service role key (which bypasses RLS).
alter table public.waitlist enable row level security;
revoke all on table public.waitlist from anon, authenticated;

-- ── Public count (only the number, never rows) ─────────────────────────────
create or replace function public.get_waitlist_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from public.waitlist;
$$;

revoke all on function public.get_waitlist_count() from public;
grant execute on function public.get_waitlist_count() to anon, authenticated, service_role;

-- ── Rate limiting (5 signups / hour / IP by default) ──────────────────────
-- Stores only a salted SHA-256 hash of the IP, never the raw address.
create table if not exists public.rate_limits (
  id          bigint generated always as identity primary key,
  key         text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists rate_limits_key_created_idx on public.rate_limits (key, created_at desc);

alter table public.rate_limits enable row level security;
revoke all on table public.rate_limits from anon, authenticated;

create or replace function public.hit_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hits int;
begin
  -- Serialise concurrent requests for the same key.
  perform pg_advisory_xact_lock(hashtext(p_key));

  -- Housekeeping: nothing older than a day is ever needed.
  delete from public.rate_limits where created_at < now() - interval '1 day';

  select count(*) into hits
  from public.rate_limits
  where key = p_key
    and created_at > now() - make_interval(secs => p_window_seconds);

  if hits >= p_limit then
    return false;
  end if;

  insert into public.rate_limits (key) values (p_key);
  return true;
end;
$$;

revoke all on function public.hit_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, int, int) to service_role;
