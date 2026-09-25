# lume

A minimalist, mobile-first waitlist landing page for **lume**, an upcoming verified, private dating space for students of IITM Janakpuri, Delhi.

> **Independent student project.** Not affiliated with, endorsed by, or operated by IITM Janakpuri or GGSIPU. 18+ only.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · `<canvas>` · Supabase (Postgres + Auth) · Cloudflare Turnstile · Vercel

## What's inside

| Route | What it does |
| --- | --- |
| `/` | Landing page: hero, feature cards, Rose/Azure profile-card preview, waitlist form, live counter, heart-bubble canvas background |
| `/privacy`, `/terms` | Plain-English policies written with India's DPDP Act 2023 in mind |
| `/api/join` | `POST`. Honeypot → zod validation → Turnstile check → rate limit (5/hour/IP) → insert |
| `/api/count` | `GET`. Public waitlist count via `get_waitlist_count()`, cached 60s |
| `/admin` | Magic-link login (allowlisted emails only): totals, today, per-day chart, by-year breakdown, searchable table, CSV export, delete |
| `/auth/callback` | Magic-link landing that exchanges the code for a session |

```
app/            routes, API handlers, admin server actions
components/     UI (Hero, Features, ThemePreview, ProfileCard, WaitlistForm, HeartsCanvas…)
components/admin/  login form + dashboard
lib/            validation (shared client/server), Supabase clients, Turnstile, IP hashing
supabase/schema.sql   database schema, RLS, functions
```

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the SQL below (also in [`supabase/schema.sql`](supabase/schema.sql)) and run it.
3. From **Project Settings → API**, copy the URL, the `anon` key and the `service_role` key into `.env.local`.
4. Under **Authentication → URL Configuration**:
   - **Site URL:** `https://YOUR-DOMAIN` (e.g. `https://lume.vercel.app`)
   - **Redirect URLs:** `https://YOUR-DOMAIN/auth/callback` and `http://localhost:3000/auth/callback`
5. Optional but recommended: under **Authentication → Providers → Email**, keep "Confirm email" on, and set up
   custom SMTP (the built-in sender is heavily rate-limited).

<details>
<summary><strong>Supabase SQL</strong></summary>

```sql
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
```

</details>

**How access works:** RLS is enabled on `waitlist` and `rate_limits` with **no policies**, so the anon and
authenticated roles can't read or write rows at all. The server uses the service-role key (which bypasses RLS)
only inside `/api/join`, `/api/count` and the admin page/actions, after checking the admin allowlist.
`get_waitlist_count()` is `SECURITY DEFINER` and returns only a number.

### 3. Cloudflare Turnstile

Create a free widget at **Cloudflare dashboard → Turnstile**, add your domain(s), and put the site key and
secret in `.env.local`. `.env.example` ships with Cloudflare's official always-pass
[test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) for local development.

If `TURNSTILE_SECRET_KEY` is unset, verification is skipped in development and **always fails in production**.

### 4. Environment variables

| Variable | Exposed to browser? | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical URL, fallback for magic-link redirects |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Used only for the admin auth session |
| `SUPABASE_SERVICE_ROLE_KEY` | **no** | Server-only DB access. Never prefix with `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | yes | Turnstile widget |
| `TURNSTILE_SECRET_KEY` | **no** | Turnstile verification |
| `ADMIN_EMAILS` | **no** | Comma-separated allowlist for `/admin` |
| `RATE_LIMIT_PER_HOUR` | **no** | Signups per IP per hour (default 5) |
| `RATE_LIMIT_SALT` | **no** | Salt for hashing IPs. Use a long random string |
| `NEXT_PUBLIC_CONTACT_EMAIL` | yes | Shown in the footer and legal pages |

Server-only modules import `server-only`, so the build fails if one is ever pulled into client code.

### 5. Run

```bash
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

## Deploy to Vercel

1. Push to GitHub and import the repo in Vercel (framework preset: Next.js).
2. Add every variable from the table above under **Settings → Environment Variables**. Set
   `NEXT_PUBLIC_SITE_URL` to the production URL.
3. Deploy, then add `https://YOUR-DOMAIN/auth/callback` to Supabase's redirect URLs and your domain to the
   Turnstile widget.

`NEXT_PUBLIC_*` values are inlined at build time, so redeploy after changing them.

## Admin dashboard

Admins come **only** from the `ADMIN_EMAILS` environment variable (comma-separated, case-insensitive,
trimmed). Never put admin emails in source. Set it in `.env.local` for local dev and in Vercel's
environment variables for production.

Flow: `/admin` → enter email → magic link → `/auth/callback` (sets the session cookie) → `/admin`.
Non-allowlisted emails get the same "link is on its way" message but no email, so admin addresses can't be
discovered. The page and every admin action re-check the allowlist on the server, and require a
confirmed email. Keep **Authentication → Providers → Email → Confirm email** turned on.

By default the link must be opened in the same browser that requested it (PKCE). To make links work when
opened on another device or in the Gmail app, change the **Magic Link** and **Confirm signup** email
templates' link to:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Sign in to lume admin</a>
```

- **Delete** handles DPDP deletion requests: it removes the row permanently (a confirmation step prevents misclicks).
- **Export CSV** exports the currently filtered rows. Cells are escaped against spreadsheet formula injection.
- Dates and "today" use India Standard Time.

## Security

- Headers on every route (`next.config.mjs`): CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `frame-ancestors 'none'`, HSTS, Referrer-Policy, Permissions-Policy. `/admin` also gets `noindex`.
- The CSP allows `'unsafe-inline'` scripts because Next.js injects inline bootstrap scripts. Moving to
  nonce-based CSP in middleware would tighten this, but it makes every page dynamically rendered.
- `/api/join` checks the Origin header, has a honeypot that returns a fake success, validates with zod,
  verifies Turnstile server-side, and rate-limits by salted IP hash in Postgres (works across serverless instances).
- Raw IPs are never stored. Rate-limit rows are purged after 24 hours.

## Design notes

- Palette lives in CSS variables (`app/globals.css`) and switches with `prefers-color-scheme`.
- Fonts: Instrument Serif + DM Sans via `next/font`, self-hosted at build time.
- `HeartsCanvas`: 16 hearts on phones, 28 on desktop, DPR capped at 2, paused in background tabs, and not
  mounted at all under `prefers-reduced-motion`. A soft halo behind the hero keeps text crisp.
- Safe areas: `viewport-fit=cover` plus `env(safe-area-inset-*)` on the header, body and footer.
- Sample profiles are fictional and deliberately omit relationship intent, sexuality, religion, caste, politics,
  drinking/smoking and income.

## License

MIT, see [LICENSE](LICENSE).
