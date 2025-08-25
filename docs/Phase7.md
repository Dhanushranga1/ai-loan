Awesome question — yes! After Phase 6, it’s smart to do a **tight Phase 7** to harden the product for day-to-day use: add a tiny **Admin view**, **end-to-end (E2E) smoke tests**, **observability runbook**, and a few **security/performance** touch-ups. Below are the two things you asked for:

1. A **Phase-7 Markdown spec** you can drop into `/docs/Phase-7.md`.
2. A **separate, copy-pasteable agent prompt** that tells your AI builder exactly how to execute Phase 7 and maintain a live TODO list.

---

# 📄 `/docs/Phase-7.md` — **Post-Review Hardening: Admin, E2E, Observability**

*Project: AI Loan Approval System (Next.js · Supabase · Tailwind · shadcn/ui · Jenkins · Docker)*

> **Goal of Phase-7:** Minimal, high-impact polish for day-to-day use. Add a read-focused **Admin Loans** view, **Playwright E2E smoke tests**, **observability & runbook**, and **security/performance** touch-ups — without changing core scope or over-engineering.

---

## 0) Context (what’s already done)

* Auth + RLS; schema: `profiles`, `loans`, `decisions`, `audit_logs`.
* User flows: create/list/detail loan, run decision.
* CI/CD: Jenkins → Docker → single VM; health & rollback.
* Docs for Review-1 packaged.

**Non-goals:** New features outside admin read view; no Kubernetes; no heavy ML training.

---

## 1) Objectives (project-specific)

1. **Admin Loans (read-focused)**

   * `/admin/loans` to view **all** loans with filters/sorting; requires `profiles.role='admin'`.
   * `/admin/loans/[id]` with loan details and decision history (read-only).
   * Optional admin action: **“Mark note”** (logs to `audit_logs`) — no data mutation to loans/decisions.
2. **E2E Smoke Tests (Playwright)**

   * Flows: login → create loan → run decision → verify status and reasons.
   * CI: run headless in Jenkins (optional but recommended).
3. **Observability & Runbook**

   * `/docs/Runbook.md`: logs, health, rollback, env updates, common failures.
   * Minimal **structured logging** in API routes (info/warn/error).
   * Footer shows **deployed commit short SHA** (from env) to align with deployments.
4. **Security & Performance touch-ups**

   * Next.js middleware for security headers (CSP-lite, no unsafe inline; strict-transport-security opt-in if behind TLS).
   * Rate limit on decision endpoint (simple in-memory per IP/user, modest defaults).
   * Env validation on boot (Zod schema for `process.env`).
   * Accessibility pass for forms (labels, aria-live, color contrast).

---

## 2) Acceptance Criteria

* **Admin routes** render only for admins; non-admins get 403/redirect.
* Admin list filters: `status`, `q` (purpose), sort by `created_at`/`amount`, pagination.
* Admin detail shows latest decision + history (if >1).
* **Playwright suite** green locally and in CI (if enabled).
* `/docs/Runbook.md` includes: deploy, rollback, logs, health, quick triage checklist.
* API routes emit **structured logs** (no secrets).
* **Security headers** applied; decision endpoint rate-limited; env validated on boot.
* Footer shows **commit short SHA** of the running build.

---

## 3) Files to Add/Modify

```
/app
  /(admin)/loans/page.tsx                     # /admin/loans
  /(admin)/loans/[id]/page.tsx                # /admin/loans/[id]
  /components/AdminLoanTable.tsx
  /components/DecisionTimeline.tsx            # read-only list of decisions
  /components/AppFooterBuildInfo.tsx          # shows short SHA from env
  /middleware.ts                              # security headers, admin guard helper

/lib
  /admin.ts                                   # isAdmin(userId)
  /env.ts                                     # zod-based env validation
  /logger.ts                                  # tiny structured logger (console)
  /ratelimit.ts                               # simple in-memory limiter
  /security-headers.ts                        # CSP-lite + standard headers

/e2e
  /playwright.config.ts
  /specs/smoke.spec.ts                        # login→create→decide→assert

/docs
  Phase-7.md
  Runbook.md
  Status-Phase7.md
  /screenshots/phase-7/*
```

---

## 4) Admin UX (minimal, clean)

* **/admin/loans**: table with columns: ID(short), User(email masked), Amount(₹), Tenure, Purpose, Status, Created.

  * Toolbar: Status filter, Search (purpose), Sort, Page size, Pagination.
* **/admin/loans/\[id]**: same detail view as user + **DecisionTimeline** (created\_at, decision, score).
* **Access control**: server-side — if `!admin` → 403 + redirect to `/dashboard`.

---

## 5) E2E Tests (Playwright)

**Test: `smoke.spec.ts`**

1. Register or login test user.
2. Create loan with valid values; expect toast; land on detail.
3. Click **Run Decision**; expect status badge + reasons rendered.
4. Visit `/loans`; verify new row present.
5. (Optional) Admin login → `/admin/loans` shows the loan; open detail → timeline visible.

**Data isolation**: Use a dedicated test user + cleanup via UI or leave data (RLS keeps it isolated).

---

## 6) Observability & Runbook

* **Runbook.md** sections:

  * **Health check** commands and expected outputs.
  * **Logs**: `docker logs -f ai-loan-approval` + grep patterns.
  * **Common incidents**: failing health → rollback; 401/403 → check RLS/admin; env mismatch → env validation errors.
  * **Release verification**: check footer SHA vs Jenkins tag.
* **Build info**: Inject `BUILD_SHA_SHORT` at build time (from Jenkins env) and render in footer.

---

## 7) Security & Performance

* **Headers** (`/middleware.ts`):

  * `Content-Security-Policy` (CSP-lite, allow self + fonts).
  * `Referrer-Policy: no-referrer`
  * `X-Content-Type-Options: nosniff`
  * `X-Frame-Options: DENY`
  * `Strict-Transport-Security` if behind TLS (doc in Runbook).
* **Rate limit**: Decision endpoint max **3/min per user**; respond 429 with short message.
* **Env validation**: Zod schema in `/lib/env.ts`, fails fast with actionable error.
* **Accessibility**: labels on inputs, `aria-live="polite"` on toasts, visible focus rings.

---

## 8) Documentation & Screenshots

**Runbook.md** — concrete commands for:

* health, logs, rollback, updating env file, restarting.
* How to check admin role in Supabase quickly.
* How to verify CSP headers (`curl -I`).

**Screenshots to add (phase-7 folder):**

* `admin-loans-list.png`, `admin-loan-detail.png`,
* `playwright-green.png` (local or CI),
* `footer-sha.png` (deployed commit shown),
* `headers-curl.png` (CSP header visible),
* `429-rate-limit.png` (sample response).

---

## 9) Acceptance Test (manual)

* Non-admin visiting `/admin/loans` → redirected/403.
* Admin sees loans with filters; detail shows timeline.
* Playwright test passes locally; optional CI step green.
* Requesting `/api/loans/{id}/decide` repeatedly hits 429 as configured.
* `curl -I` shows security headers; `/` footer shows commit SHA.

---

## 10) Task List & Commit Plan

**Mirror these tasks into `/docs/Phase-7-TODO.md` with checkboxes.**

Tasks:

1. Scaffold admin pages/components; server guards using `isAdmin`.
2. Implement `DecisionTimeline` (descending `created_at`).
3. Add `AppFooterBuildInfo` with `BUILD_SHA_SHORT`.
4. Add `middleware.ts` with security headers.
5. Add `ratelimit.ts`; wrap decision route.
6. Add `env.ts` with Zod validation; call on boot.
7. Add Playwright config + `smoke.spec.ts`.
8. Write `/docs/Runbook.md`.
9. Capture screenshots to `/docs/screenshots/phase-7/`.
10. Update `/docs/Status-Phase7.md` with links/notes.

Conventional commits:

* `feat(admin): add admin loans list and detail routes`
* `feat(ui): add decision timeline and build info footer`
* `feat(sec): add security headers middleware (CSP, HSTS, etc.)`
* `feat(api): rate limit decision endpoint (429)`
* `chore(env): add zod-based env validation`
* `test(e2e): add Playwright smoke flow`
* `docs: add Runbook and Phase-7 status with screenshots`

---

# 🤖 Copy-Paste Agent Prompt — **Phase 7 (Admin, E2E, Observability, Hardening)**

You are an AI build agent. Execute **Phase 7** for the **AI Loan Approval System**. Work in **small, atomic commits** with **Conventional Commits**. Maintain a **live TODO** checklist.

## Ground Rules

* No scope creep: **read-only** admin views, **smoke E2E**, **observability docs**, **security/perf** touch-ups.
* Before each sub-task: **append a checkbox** to `/docs/Phase-7-TODO.md`. After completion: **tick it** with a one-line result and **commit**.

## Tasks (run sequentially)

1. **Scaffold & TODO**

* Create `/docs/Phase-7-TODO.md` (copy tasks from Phase-7 spec) and `/docs/Status-Phase7.md` (skeleton).
* **Commit:** `docs: add Phase-7 TODO and Status skeleton`

2. **Admin List**

* Add `/app/(admin)/loans/page.tsx` with table (filters: status, q; sort: created\_at/amount; pagination). Guard on server: `isAdmin`.
* **Commit:** `feat(admin): add admin loans list route`

3. **Admin Detail**

* Add `/app/(admin)/loans/[id]/page.tsx` and `/components/DecisionTimeline.tsx` showing decision history (desc). Guard via `isAdmin`.
* **Commit:** `feat(admin): add admin loan detail with decision timeline`

4. **Build Info Footer**

* Add `/components/AppFooterBuildInfo.tsx` and render in root layout. Read `process.env.BUILD_SHA_SHORT`.
* **Commit:** `feat(ui): add build info footer (short sha)`

5. **Security Headers**

* Add `/lib/security-headers.ts` and `/middleware.ts` to set CSP-lite, no-sniff, frame-deny, (HSTS if TLS).
* **Commit:** `feat(sec): add security headers middleware`

6. **Rate Limiting (Decision Endpoint)**

* Add `/lib/ratelimit.ts` (in-memory map per key). Limit: 3/min per user for `POST /api/loans/[id]/decide`, return 429 with JSON `{error:"rate_limited"}`.
* **Commit:** `feat(api): rate-limit decision endpoint (429 on burst)`

7. **Env Validation**

* Add `/lib/env.ts` with Zod schema; parse/validate at server start (throw helpful error if missing).
* **Commit:** `chore(env): add zod-based env validation on boot`

8. **E2E Tests**

* Add Playwright: `/e2e/playwright.config.ts`, `/e2e/specs/smoke.spec.ts` covering login→create→decide→assert.
* Optional: add Jenkins stage to run Playwright headless (if simple to integrate).
* **Commit:** `test(e2e): add Playwright smoke flow`

9. **Runbook & Screenshots**

* Create `/docs/Runbook.md` with: health, logs, rollback, env changes, CSP verify, rate-limit verify, role check.
* Capture screenshots in `/docs/screenshots/phase-7/`:
  `admin-loans-list.png`, `admin-loan-detail.png`, `playwright-green.png`, `footer-sha.png`, `headers-curl.png`, `429-rate-limit.png`.
* **Commit:** `docs: add Runbook and phase-7 screenshots`

10. **Status Update**

* Fill `/docs/Status-Phase7.md` with outputs, links, and notes.
* **Commit:** `docs: finalize Status-Phase7 with links and notes`

## Live TODO Protocol

* Start a task → append `- [ ] <task>` to `/docs/Phase-7-TODO.md`.
* Finish → change to `- [x] <task> — <one-line result with file names>` and commit.

## Acceptance Criteria

* Admin list/detail pages are admin-only; render with filters and decision timeline.
* E2E smoke passes locally (and in CI if enabled).
* Middleware adds security headers (visible via `curl -I`).
* Decision endpoint enforces rate limit (429 on bursts).
* Footer shows `BUILD_SHA_SHORT`.
* Runbook and screenshots present; Status-Phase7 updated.

**Start now**:

1. Create `/docs/Phase-7-TODO.md` and `/docs/Status-Phase7.md`.
2. Implement Admin list/detail, then proceed step-by-step, ticking TODOs after each commit.
