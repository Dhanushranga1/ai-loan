# 🔐 Agent Prompt — **Phase 2: Supabase Auth & Schema**

*Project: AI Loan Approval System (Next.js · Supabase · Tailwind · shadcn/ui)*

> **Role**: You are an AI build agent. Implement **Phase 2** with **small, atomic commits** and **Conventional Commits**.
> **Goal of Phase 2**: Wire **Supabase Auth (email/password)**, create the **database schema** (profiles, loans, decisions, audit\_logs), enforce **RLS** (row-level security), seed minimal data, and expose **session-aware utilities** the app will use in later phases.

---

## 0) Context & Dependencies

* **From Phase 1 (assumed done)**: Next.js (App Router, TS), Tailwind, shadcn/ui, Inter font, basic routes scaffold.
* **From Phase 3 (you completed)**: Loans API & Pages may already exist. Phase 2 **must** still provision **auth + schema + RLS** cleanly so existing Phase 3 features work under real security.

**Protocol**
Before coding, **print Tasks** (Section 17). Execute **one task at a time** → commit → proceed. After completion, write `/docs/Status-Phase2.md` and screenshots to `/docs/screenshots/phase-2/`.

---

## 1) Objectives (What to Build)

1. **Supabase Auth** (email/password): sign up, login, logout; session persistence via cookies.
2. **DB Schema**: `profiles`, `loans`, `decisions`, `audit_logs` (+ indexes & constraints).
3. **RLS Policies**: Users see **only their** data; **admins** see all.
4. **Profile bootstrap**: Auto-create a `profiles` row for every new user.
5. **Server utilities**: Supabase server client from cookies; admin check helper.
6. **Seed**: Minimal data & a way to mark one account as `admin`.
7. **Docs**: Env variables, setup steps, basic auth flow screenshots.

---

## 2) Acceptance Criteria (Definition of Done)

* Users can **register**, **sign in**, **sign out**; session persists across reloads.
* After signup, a `profiles` row exists for the user (`id = auth.uid()`).
* **RLS** is **enabled** on all business tables:

  * Non-admin users can **only** access rows with `user_id = auth.uid()`.
  * Admins (`profiles.role = 'admin'`) can access all rows.
* Minimal seed path to mark an admin user (documented).
* Server code **never** uses the **service role** in route handlers.
* `README.md` updated (env, setup, auth flow), `/docs/Status-Phase2.md` present.
* Screenshots exist in `/docs/screenshots/phase-2/`:

  * Supabase project keys (masked), RLS toggles, policies list, successful login.

---

## 3) Files to Create / Modify

```
/app
  /(auth)/login/page.tsx                # wire to Supabase Auth
  /(auth)/register/page.tsx             # wire to Supabase Auth
  /layout.tsx                           # session-aware navbar (login/logout)
  /api/auth/logout/route.ts             # server logout (optional)

/lib
  /supabaseBrowser.ts                   # client-side browser client (anon)
  /supabaseServer.ts                    # server-side client (cookies-based)
  /auth.ts                              # getSession(), requireUser(), signOut()
  /admin.ts                             # isAdmin(userId): Promise<boolean>

/supabase
  migrations.sql                        # tables, constraints, indexes
  policies.sql                          # RLS policies
  triggers.sql                          # profile bootstrap trigger on new user
  seed.sql                              # mark admin; optional sample data

/docs
  Status-Phase2.md
  /screenshots/phase-2/*
.env.example
README.md
```

> If Phase 3 already added some of these files, **augment** rather than duplicate.

---

## 4) Environment & Secrets

Add **`.env.example`**:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Server-only: DO NOT expose to client; not used in route handlers.
SUPABASE_SERVICE_ROLE_KEY=
NODE_ENV=development
```

**Rules**

* **Client** code imports only `NEXT_PUBLIC_*`.
* **Server** utilities may read `SUPABASE_SERVICE_ROLE_KEY` only for **seeding or maintenance scripts**, never for request-time operations.

---

## 5) Auth Flows

**Register**

* User fills email/password → Supabase Auth → on success, ensure `profiles` row exists via **DB trigger** (preferred) or **server upsert** fallback.
* Redirect to `/dashboard` (or `/loans`) after login.

**Login**

* Email/password → session saved in cookies.
* Session read via `/lib/supabaseServer.ts` for server components/handlers.

**Logout**

* Route `POST /api/auth/logout` (or client call) → Supabase signOut → redirect to `/login`.

**Admin detection**

* Server helper `isAdmin(userId)` queries `profiles.role`. Cache result per request.

---

## 6) Database Schema (Canonical)

### 6.1 Tables

**`public.profiles`**

* `id uuid primary key` (equals `auth.uid()`)
* `full_name text`
* `email text unique`
* `role text default 'user' check (role in ('user','admin'))`
* `created_at timestamptz default now()`

**`public.loans`**

* `id uuid primary key default gen_random_uuid()`
* `user_id uuid not null references public.profiles(id) on delete cascade`
* `amount numeric not null check (amount > 0 and amount <= 100000000)`
* `tenure_months int not null check (tenure_months between 3 and 84)`
* `purpose text not null check (char_length(trim(purpose)) between 3 and 120)`
* `income numeric not null check (income > 0 and income <= 10000000)`
* `employment_length_years numeric not null check (employment_length_years between 0 and 40)`
* `credit_score int not null check (credit_score between 300 and 900)`
* `dti_ratio numeric not null check (dti_ratio >= 0 and dti_ratio <= 1)`
* `status text not null default 'submitted' check (status in ('submitted','approved','rejected','needs_review'))`
* `created_at timestamptz default now()`

**`public.decisions`**

* `id uuid primary key default gen_random_uuid()`
* `loan_id uuid not null references public.loans(id) on delete cascade`
* `decision text not null check (decision in ('approve','reject','review'))`
* `score numeric not null`
* `reasons jsonb not null default '[]'::jsonb`
* `created_at timestamptz default now()`

**`public.audit_logs`**

* `id uuid primary key default gen_random_uuid()`
* `actor uuid not null`                         -- auth.uid()
* `action text not null`                        -- e.g., 'loan.create', 'loan.read'
* `entity text not null`                        -- e.g., 'loan'
* `entity_id uuid not null`
* `meta jsonb default '{}'::jsonb`
* `created_at timestamptz default now()`

### 6.2 Indexes

* `loans_user_created_idx` on `(user_id, created_at desc)`
* `loans_status_created_idx` on `(status, created_at desc)`
* `decisions_loan_created_idx` on `(loan_id, created_at desc)`
* `audit_created_idx` on `(created_at desc)`

---

## 7) Profile Bootstrap (Trigger)

**Goal**: Automatically create a `profiles` row when a new user is inserted into `auth.users`.

* Create `function public.handle_new_user()` that inserts into `public.profiles`
  using `new.id` and `new.email` from `auth.users`.
* Create trigger `on auth.users after insert` to call this function.

> Provide a **fallback** `ensureProfile()` server utility that upserts the row at first authenticated request (used if trigger is not permitted in some environments).

---

## 8) RLS (Row-Level Security) Policies

**Enable RLS** on `public.profiles`, `public.loans`, `public.decisions`, `public.audit_logs`.

**Helpers**

* Admin predicate: current user has `exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')`.

**Profiles**

* `SELECT`: user can select their own row **OR** admin can select all.
* `UPDATE`: user can update only their own row; limit fields (`full_name`) as needed.
* `INSERT`: via trigger only; normal users shouldn’t insert directly.

**Loans**

* `SELECT`: `user_id = auth.uid()` OR **admin** predicate true.
* `INSERT`: allowed if `user_id = auth.uid()`.
* `UPDATE`: allowed if `user_id = auth.uid()` (for fields that make sense pre-decision); admin can update all.
* `DELETE`: owner or admin (optional; can restrict to admin only).

**Decisions**

* `SELECT`: join via loan → visible if owner of that loan OR admin.
* `INSERT`: server-side only (later phases), but keep policy as **admin OR owner** if needed. For now, allow insert when the loan is owned by `auth.uid()`; admin allowed.

**Audit Logs**

* `SELECT`: **admin only**.
* `INSERT`: allowed to any authenticated user (server inserts acting as user).
* `DELETE/UPDATE`: **admin only**.

> Keep policies **minimal and explicit**. Document them in `policies.sql`.

---

## 9) Session-Aware Utilities

**`/lib/supabaseBrowser.ts`**

* Create Supabase browser client with `NEXT_PUBLIC_` keys.

**`/lib/supabaseServer.ts`**

* Create server client from cookies (App Router pattern).
* Expose `getSession()` and `getUser()` helpers.

**`/lib/auth.ts`**

* `requireUser()` → throws/redirects if unauthenticated.
* `signOut()` → clears session; used by logout route.

**`/lib/admin.ts`**

* `isAdmin(userId)` → checks `profiles.role`.

**Rules**

* Route handlers & server components **must** use server client (cookie-bound).
* **Do not** use service role at request time.

---

## 10) Seed & Admin Setup

**Goal**: Have a simple way to assign **admin** to one account.

* After registering your own account in the UI, run `seed.sql` to:

  * `update public.profiles set role='admin' where email = '<your_email>';`
* Optionally insert **sample loans** tied to your user for testing.
* Document this process in `README.md` with a clear caution about PII & roles.

---

## 11) UI Wiring (Auth Screens)

* **Register page**: email, password; success → login or auto-redirect.
* **Login page**: email, password; success → `/dashboard` (or `/loans`).
* **Navbar**: shows user email + “Sign out” button when authenticated; shows “Login” when unauthenticated.
* **Guards**: pages under `/loans/*` should verify session (server-side) and redirect unauthenticated users to `/login`.

> If Phase 3 routes already exist, just wire auth checks using `requireUser()`.

---

## 12) Security Notes

* RLS is the **primary** security line. Do not bypass it.
* Validate payloads on the server (Phase 3 does Zod; Phase 2 ensures RLS underneath).
* Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code or to Next.js **public runtime**.
* Prefer **server components** where practical to reduce client bundle size & secret leakage.
* Enforce **reasonable size limits** for request bodies.

---

## 13) Minimal Tests (Phase 2)

* **Auth utilities**: mock Supabase client; ensure `requireUser()` rejects when no session.
* **Admin helper**: returns true after role is updated in `profiles`.
* (Optional) **SQL sanity**: confirm tables and key constraints exist via a migration smoke test (scripted or manual).

---

## 14) Manual QA Checklist

1. Start dev server. Visit `/register` → create user → redirected/logged in.
2. Confirm a row appears in `profiles` for your `auth.uid()`.
3. Sign out → try accessing `/loans` → you should be redirected to `/login`.
4. Mark your user as admin via `seed.sql`. Refresh app; `isAdmin()` should be true.
5. Create another user and verify they **cannot** see admin or other users’ rows (Phase 3 pages will prove it).
6. Inspect Supabase → verify **RLS enabled** on all relevant tables and policies listed.

---

## 15) Documentation Updates

* `README.md`

  * **Setup Supabase**: project creation, keys, where to paste env vars.
  * **RLS**: which tables are protected; link to `policies.sql`.
  * **Seed**: how to mark admin and add example data.
  * **Auth flow**: brief explanation + screenshots.
* `/docs/Status-Phase2.md`

  * What changed, policy summary, known gaps (e.g., password rules).

---

## 16) Performance & Future-Proofing

* Add indexes for frequent filters (by `user_id`, `status`, `created_at`).
* Keep `purpose` short; avoid full-text for now.
* Future: consider a small materialized view for loan counts per user (optional).

---

## 17) Task List (Execute One by One)

1. **Scaffold** files & placeholders listed in Section 3.
2. Add **env variables** to `.env.example`; update `README.md` (Supabase setup).
3. Write `migrations.sql` with table DDL + indexes (Section 6).
4. Write `triggers.sql` for **profile bootstrap** on `auth.users` insert.
5. Enable RLS and write `policies.sql` for all tables (Section 8).
6. Implement **supabase clients**: `/lib/supabaseBrowser.ts`, `/lib/supabaseServer.ts`.
7. Implement **auth helpers**: `/lib/auth.ts` and `/lib/admin.ts`.
8. Wire **/login** and **/register** pages to Supabase Auth; add **/api/auth/logout**.
9. Add **session-aware navbar**; guard `/loans/*` with `requireUser()`.
10. Create `seed.sql` (admin role + optional sample data); document usage.
11. Run manual QA (Section 14) and capture **screenshots**.
12. Write `/docs/Status-Phase2.md`; update `README.md`.

---

## 18) Commit Plan (Conventional Commits)

* `chore: scaffold phase-2 files and placeholders`
* `chore(env): add supabase env variables and update README`
* `feat(db): add schema for profiles, loans, decisions, audit_logs (migrations)`
* `feat(db): add profile bootstrap trigger on auth.users`
* `feat(db): enable rls and add policies for all tables`
* `feat(auth): add supabase browser/server clients and auth helpers`
* `feat(auth): implement register/login/logout and session-aware navbar`
* `feat(auth): protect loans routes with server-side guard`
* `chore(seed): add seed.sql for admin role and sample data`
* `docs: add Status-Phase2 and screenshots; expand README`

---

## 19) Final Verification

* New user can register → profile row auto-created.
* Authenticated session persists; logout works.
* RLS blocks cross-user access; admin can see all (verified at DB level).
* Docs & screenshots complete.

> **Proceed now**: Print Task 1 from Section 17 and start execution with a small commit after completing it.
