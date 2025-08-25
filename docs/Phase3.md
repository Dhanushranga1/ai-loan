# 🧩 Agent Prompt — **Phase 3: Loans API & Pages**

*Project: AI Loan Approval System (Next.js · Supabase · Tailwind · shadcn/ui)*

> **Role**: You are an AI build agent. Implement **Phase 3** end-to-end with small, atomic commits and Conventional Commits.
> **Goal of Phase 3**: Build secure **Loans API** and **UI pages** for creating, listing, and viewing loan applications for the signed-in user, honoring **Supabase RLS** and producing auditable actions.

---

## 0) Context & Dependencies

* **Done from previous phases** (assume present):

  * Next.js (App Router, TS), Tailwind, shadcn/ui, Inter font.
  * Supabase project configured; **tables**: `profiles`, `loans`, `decisions`, `audit_logs`.
  * **RLS**:

    * Users can access **only their** rows for `loans` and `decisions`.
    * Admins can see all (`profiles.role = 'admin'`).
* **Non-goals in Phase 3**:

  * No decision/AI scoring execution (that’s Phase 4).
  * No admin bulk ops; admin just gets list visibility.

**Work style**:
Before coding, **print Tasks**, then execute **one task at a time**, committing after each. After completion, create `/docs/Status-Phase3.md` (what’s done, screenshots to `/docs/screenshots/phase-3/`).

---

## 1) Objectives (What to Build)

1. **Loans REST-like endpoints (Next.js route handlers)**:

   * `POST /api/loans` — create a loan for the **current user**.
   * `GET /api/loans` — list **current user’s** loans; admin can list all.
   * `GET /api/loans/:id` — fetch loan details if owner or admin.
2. **UI Pages**:

   * `/loans/new` — guided form with **live EMI** and **DTI** preview.
   * `/loans` — list with pagination, sorting, status badges, empty states.
   * `/loans/[id]` — details view; show latest decision summary if exists (read-only).
3. **Audit logging** for creation and reads (lightweight, server-side).
4. **Validation** using a single source of truth (Zod schemas).
5. **Security**: RLS enforcement via **server-side Supabase client with user JWT** (no service role in route handlers).

---

## 2) Acceptance Criteria (Definition of Done)

* API:

  * Returns **422** for invalid input, **401** if unauthenticated, **403** if forbidden, **404** if not found, **200/201** on success.
  * `GET /api/loans` supports `page`, `page_size`, `status`, `q` (search `purpose`), `sort=created_at|amount` with `order=asc|desc`. Defaults: `page=1`, `page_size=10`, `sort=created_at`, `order=desc`.
* UI:

  * `/loans/new`: Validates all fields, shows **live EMI** and **DTI** as user types; disable submit during processing; shows success toast & redirects to detail page.
  * `/loans`: Renders paginated table with **status badges**, **amount**, **tenure**, **created\_at**; skeleton while loading; empty-state CTA.
  * `/loans/[id]`: Shows all fields and (if exists) last decision with score & reasons summary (read-only).
* **RLS trusted**: No service role used in route handlers; all queries use the user session.
* **Audit logs** inserted for `loan.create` and `loan.read`.
* **Accessibility**: Forms have labels, keyboard navigation, semantic landmarks; color contrast for status badges.
* **Docs** updated in `README.md` (API usage + screenshots).

---

## 3) Exact Files to Create/Modify

```
/app
  /api/loans/route.ts                 # GET (list), POST (create)
  /api/loans/[id]/route.ts            # GET (detail)
  /(loans)/page.tsx                   # /loans list page
  /(loans)/new/page.tsx               # /loans/new form page
  /(loans)/[id]/page.tsx              # /loans/[id] details page
  /components/LoanForm.tsx
  /components/LoanListTable.tsx
  /components/DecisionBadge.tsx
  /components/ScoreChip.tsx           # (read-only chip if decision present)
  /lib/validation/loan.ts             # Zod schemas (input/output)
  /lib/emi.ts                         # EMI/DTI helpers (pure functions)
  /lib/supabaseServer.ts              # server-side client from cookies (no service role)
  /lib/audit.ts                       # insert audit logs (server-side)
/docs
  /screenshots/phase-3/*              # PNGs for demo
  Status-Phase3.md
```

> Keep **all** UI strings concise and human, e.g., “Create Loan”, “Monthly EMI”, “DTI Ratio”.

---

## 4) Data Contract (Canonical Types)

**LoanInput (client → server; POST /api/loans)**

```json
{
  "amount": "number (₹, > 0, max 1e8)",
  "tenure_months": "integer (3..84)",
  "purpose": "string (min 3, max 120)",
  "income": "number (₹/month, > 0, max 1e7)",
  "employment_length_years": "number (0..40, step 0.5 allowed)",
  "credit_score": "integer (300..900)",
  "dti_ratio": "number (0..1)  // computed client-side but validated server-side"
}
```

**Loan (server → client)**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "amount": "number",
  "tenure_months": "number",
  "purpose": "string",
  "income": "number",
  "employment_length_years": "number",
  "credit_score": "number",
  "dti_ratio": "number",
  "status": "submitted | approved | rejected | needs_review",
  "created_at": "ISO8601"
}
```

**List Response (`GET /api/loans`)**

```json
{
  "items": [ "Loan", "..." ],
  "page": 1,
  "page_size": 10,
  "total": 37,
  "has_next": true
}
```

**Error Shape**

```json
{
  "error": {
    "code": "string",
    "message": "human-readable",
    "details": "optional"
  }
}
```

---

## 5) Validation Rules (Single Source of Truth)

* Use **Zod** schemas in `/lib/validation/loan.ts` and reuse in:

  * `/loans/new` client form validations.
  * `/api/loans` server input validation.
* Constraints:

  * `amount` > 0 and ≤ 100,000,000.
  * `tenure_months` ∈ \[3, 84], integer.
  * `purpose` length 3–120, no only-whitespace.
  * `income` > 0 and ≤ 10,000,000.
  * `employment_length_years` ∈ \[0, 40].
  * `credit_score` ∈ \[300, 900], integer.
  * `dti_ratio` ∈ \[0, 1]. If client omits, server recomputes and validates.
* On 422, return field-level messages keyed by path.

---

## 6) Security & Session Handling

* **Never** use Supabase **service role** in route handlers.
* Create a server client that **extracts user JWT from cookies** (e.g., `createServerClient`):

  * If no session, return **401**.
  * RLS enforces **row ownership** automatically.
* To detect admin:

  * Query `profiles.role` for current user once; cache in request scope.
  * Admin can set `?all=true` on list; otherwise ignore.

---

## 7) Audit Logging (Server-Side)

* Log actions into `audit_logs`:

  * `loan.create` with `entity='loan'`, `entity_id=loan.id`, meta: submitted fields minus PII if needed.
  * `loan.read` when fetching detail (skip for list).
* **actor**: `auth.uid()`; **created\_at**: `now()`.

---

## 8) Pagination, Sorting, Filters

* `GET /api/loans` query params:

  * `page` (default 1), `page_size` (default 10, max 50)
  * `status` (optional)
  * `q` (search `purpose` ILIKE `%q%`)
  * `sort` ∈ `created_at` | `amount` (default `created_at`)
  * `order` ∈ `asc` | `desc` (default `desc`)
* Return `total` and `has_next` efficiently (one extra row fetch or count).

---

## 9) EMI & DTI (Helper Functions)

* **EMI (Monthly)**:

  * EMI = `P * r * (1+r)^n / ((1+r)^n - 1)`
  * `P=amount`, `n=tenure_months`, `r=monthly_interest_rate` (use default 1.5%/mo for preview; configurable).
* **DTI**:

  * `DTI = EMI / income` (0..1)
* Implement **pure functions** in `/lib/emi.ts`.
* Client page shows live **EMI** and **DTI** previews; server recomputes and validates `dti_ratio`.

---

## 10) UI Requirements

### 10.1 `/loans/new`

* **Form Fields** (grid layout):

  * Amount (₹, numeric), Tenure (months), Purpose (text), Income (₹/month),
  * Employment length (years), Credit score, DTI (read-only, auto).
* **Live Preview Panel** (sticky on desktop):

  * EMI (₹/mo), DTI %, status hint (e.g., “Good DTI < 0.35”).
* **Validation UX**:

  * Inline error messages near fields.
  * Disable submit when invalid or submitting.
* **Success**:

  * Toast “Loan submitted”, redirect to `/loans/[id]`.

### 10.2 `/loans`

* **Toolbar**:

  * Search input (purpose), Status filter (All, Submitted, Approved, Rejected, Needs Review),
  * Sort dropdown, Page size dropdown, “New Loan” button.
* **Table Columns**:

  * ID (short), Amount (₹), Tenure (mo), Purpose, Status (badge), Created (timeago).
* **States**:

  * Loading skeleton rows.
  * Empty state with CTA “Create your first loan”.
* **Pagination**:

  * Page numbers + next/prev; reflect in URL query.

### 10.3 `/loans/[id]`

* **Header**:

  * Loan ID, status badge, created\_at.
* **Details**:

  * Grid of fields; computed EMI/DTI shown.
* **Decision Section** (read-only for Phase 3):

  * If `decisions` exists, show latest: score, top reason(s).
  * If none, show info banner: “No decision yet.”
* **Actions**:

  * “Back to All Loans” link.
  * (Phase 4 will add “Run Decision”.)

**Styling**:

* Font **Inter**, base spacing 8/16px.
* Colors: neutral Gray + Primary `#3B82F6`, Success `#10B981`, Danger `#EF4444`, Warning `#F59E0B`.
* Badges: Submitted (gray), Approved (green), Rejected (red), Needs Review (amber).

**Accessibility**:

* Labels bound to inputs, aria-live for toasts, focus ring visible, tab order logical.

---

## 11) API Specs (Concrete)

### `POST /api/loans`

* **Auth**: required.
* **Body**: `LoanInput`.
* **Steps**:

  1. Parse & validate with Zod.
  2. Recompute EMI & DTI server-side and **validate** DTI ∈ \[0,1].
  3. Insert into `loans` with `user_id = auth.uid()`; default `status='submitted'`.
  4. Insert `audit_logs` (`loan.create`).
* **Response**: `201` with `{ loan }`.
* **Errors**: `401`, `422`, `500`.

### `GET /api/loans`

* **Auth**: required.
* **Query**: `page`, `page_size`, `status`, `q`, `sort`, `order`, `all`.
* **Steps**:

  1. Detect admin (via `profiles.role`).
  2. Build filtered query:

     * If not admin or `all` ≠ true → filter `user_id = auth.uid()`.
     * Optional filters on `status` and `purpose ILIKE`.
  3. Sort + paginate; compute `total` and `has_next`.
* **Response**: `200` with list envelope.

### `GET /api/loans/:id`

* **Auth**: required.
* **RLS**: rely on row visibility.
* **Steps**:

  1. Select loan by `id` (visible rows only).
  2. If none, `404`.
  3. Insert `audit_logs` (`loan.read`) (best-effort; errors ignored).
* **Response**: `200` with `{ loan }`.

---

## 12) Error Handling & UX Microcopy

* Generic network error: “Something went wrong. Please try again.”
* 401 (not signed in): redirect to `/login` with toast: “Please sign in.”
* 403/404: show in-page state: “You don’t have access” / “Not found”.
* Field messages: short and specific (“Enter tenure between 3 and 84 months”).

---

## 13) Tests (Minimum)

* **Unit**:

  * `/lib/validation/loan.ts`: valid/invalid cases.
  * `/lib/emi.ts`: EMI known values, DTI calc; edge cases (very small income).
* **Integration (light)**:

  * Mock server action for `POST /api/loans` validation error returns `422`.

> Ensure tests run in CI and pass locally before pushing.

---

## 14) Manual QA Checklist

1. Sign up → login as normal user.
2. Create a valid loan; observe toast, redirect to detail.
3. Visit `/loans`; confirm new row present.
4. Search by a word in purpose; confirm filtering.
5. Change sort to amount asc/desc.
6. Pagination moves items correctly.
7. Open `/loans/[id]`; details visible, decision section empty/info.
8. Try invalid form values; inline errors shown; submit disabled until valid.
9. As admin (from seeded admin), hit `/loans?all=true`; confirm global list.

---

## 15) Performance & Security Notes

* Use server components where possible; avoid large client bundles.
* Do not leak service role keys to client; route handlers must use session-bound server client.
* Sanitize `purpose` for length; reject oversized payloads.
* Paginate always; set `page_size` caps.
* Avoid N+1 queries; single select with where/order/limit.

---

## 16) Documentation Updates

* `README.md`:

  * Add **Phase 3** section with:

    * API endpoints, request/response examples.
    * UI screenshots (`/docs/screenshots/phase-3/`).
    * How to test locally (env, run, seed).
* `/docs/Status-Phase3.md`:

  * What was built, screenshots list, known issues/todos.

---

## 17) Task List (Execute One by One)

1. **Scaffold** files & folders listed in Section 3 (placeholders).
2. Implement **Zod schemas** in `/lib/validation/loan.ts`.
3. Implement **EMI/DTI helpers** in `/lib/emi.ts` (pure functions).
4. Implement **server Supabase client** in `/lib/supabaseServer.ts`.
5. Implement **audit helper** in `/lib/audit.ts`.
6. Build `POST /api/loans` (validation → compute → insert → audit).
7. Build `GET /api/loans` (admin detection → filters → sort/paginate).
8. Build `GET /api/loans/[id]` (+ audit read).
9. Create `/loans/new` page with **LoanForm** (live EMI/DTI).
10. Create `/loans` list page with toolbar, table, pagination, empty state.
11. Create `/loans/[id]` detail page with read-only decision section.
12. Add **status badges** and **score chip** components (read-only).
13. Write **unit tests** for validation & EMI helpers.
14. Update **README** and add `/docs/Status-Phase3.md`.
15. Capture & save **screenshots** to `/docs/screenshots/phase-3/`.

---

## 18) Commit Plan (Conventional Commits)

* `chore: scaffold phase-3 files and placeholders`
* `feat(api): add loan validation schemas (zod)`
* `feat(core): add emi/dti helpers (pure functions)`
* `feat(api): supabase server client and audit helper`
* `feat(api): POST /api/loans with validation and audit`
* `feat(api): GET /api/loans with filters, sort, pagination`
* `feat(api): GET /api/loans/:id with audit read`
* `feat(ui): loan form with live EMI/DTI preview`
* `feat(ui): loans list with toolbar, table, pagination`
* `feat(ui): loan detail page with decision section (read-only)`
* `feat(ui): status badges and score chip`
* `test: add unit tests for loan schema and EMI helpers`
* `docs: update README and add Status-Phase3 with screenshots`

---

## 19) Final Verification (Phase 3)

* APIs behave per spec with correct status codes.
* UI flows work for normal user; admin list works with `?all=true`.
* Screenshots present; docs updated; tests passing.

> **Proceed now**: Print Task 1 from Section 17 and start execution with a small commit after completing it.
