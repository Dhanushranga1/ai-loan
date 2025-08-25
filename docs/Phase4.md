# 🧠 Agent Prompt — **Phase 4: AI Scoring & Decisions**

*Project: AI Loan Approval System (Next.js · Supabase · Tailwind · shadcn/ui · Jenkins · Docker)*

> **Role**: You are an AI build agent. Implement **Phase 4** with **small, atomic commits** and **Conventional Commits**.
> **Goal of Phase 4**: Implement a **transparent, explainable AI scoring service** and a **decision endpoint** that writes decisions, updates loan status, and records audit logs—securely under Supabase **RLS**. Add minimal UI hooks to **run decision** and **display result**. Keep it simple and production-lean.

---

## 0) Context & Dependencies

* **Phase 2** done: Supabase Auth, schema (`profiles`, `loans`, `decisions`, `audit_logs`), RLS, profile bootstrap trigger, seed/admin flow.
* **Phase 3** done: Loans API (`/api/loans`, `/api/loans/[id]`), UI (`/loans/new`, `/loans`, `/loans/[id]`), client validation + EMI/DTI helpers, pagination, audit on create/read.

**Important**

* Use **session-bound** Supabase server client; **never** service role in route handlers.
* Store **decision snapshot** (score, decision, reasons) and **update loan status** atomically.

---

## 1) Objectives (What to Build)

1. **Scoring Engine** (pure TS module):

   * **Rule-based** baseline model (default).
   * Optional **logistic** model (env switch).
   * Deterministic **explanations** (`reasons[]`).
2. **Decision Endpoint**:

   * `POST /api/loans/[id]/decide`
     Validates input → recomputes EMI/DTI → computes score/decision → writes `decisions` row → updates `loans.status` → audit log.
3. **UI hooks**:

   * **Run Decision** button in `/loans/[id]` (server action or fetch).
   * Display **decision, score, reasons** on the same page.
4. **Safety & Consistency**:

   * Idempotency (do not duplicate identical immediate decisions).
   * Concurrency guard (transaction / optimistic check).
   * State rules: can decide **only** when `loans.status` is `submitted` or when **inputs changed** since last decision.
5. **Tests**:

   * Unit tests for scoring (happy paths + edges).
   * Integration tests (decision endpoint: owner vs non-owner, admin).

---

## 2) Acceptance Criteria (Definition of Done)

* **Endpoint** `POST /api/loans/[id]/decide` returns:

  ```json
  { "decision":"approve|reject|review", "score":0.00-1.00, "reasons":["..."], "loan":{"id":"...","status":"..."} }
  ```

  with proper status codes: **200/201**, **401**, **403**, **404**, **409** (state conflict), **422** (invalid), **500**.
* **Scoring**:

  * Deterministic, side-effect free, covered by unit tests.
  * **Rule-based weights** sum to 100; thresholds as specified (see §5).
  * Returns **3–6 concrete reasons** that align with decision.
* **Data**:

  * A new `decisions` row is persisted; `loans.status` updated to `approved|rejected|needs_review`.
  * **Audit logs** record `decision.create` with decision snapshot (no sensitive secrets).
* **Security/RLS**:

  * Owner decides **only** on own loan; admin can decide for any loan.
* **UI**:

  * Button to **Run Decision**.
  * After success, decision card shows **score** and **reasons** (read-only).
  * Button is disabled / replaced by **“Re-run decision”** if inputs changed (simple check; see §7).
* **Docs + Screenshots**:

  * `/docs/Status-Phase4.md` and `/docs/screenshots/phase-4/*`.

---

## 3) Files to Create / Modify

```
/app
  /api/loans/[id]/decide/route.ts          # POST decide
  /(loans)/[id]/page.tsx                   # add Run Decision button + decision card
  /components/DecisionCard.tsx             # score + reasons + status badge
  /components/RunDecisionButton.tsx        # server action client (or fetch)
  /components/ReasonChips.tsx              # simple chips for reasons

/ai
  scoring.ts                               # rule-based model
  logistic.ts                              # optional logistic model
  explain.ts                               # reason generation helpers
  thresholds.ts                            # decision thresholds & config
  __tests__/scoring.spec.ts                # unit tests (rule-based)
  __tests__/logistic.spec.ts               # optional unit tests

/lib
  emi.ts                                   # (reused) computeEMI(), computeDTI()
  features.ts                              # canonical feature extraction for scoring
  supabaseServer.ts                        # (reused) session-bound client
  audit.ts                                 # audit helper (add decision.create)
  decision.ts                              # small orchestration helpers (idempotency checks)

/supabase
  policies.sql                             # verify any needed permissions for decisions insert (owner/admin)
  migrations.sql                           # (if minor additions like index)

/docs
  Status-Phase4.md
  /screenshots/phase-4/*
```

---

## 4) API Contract (Concrete)

### `POST /api/loans/[id]/decide`

**Auth**: required (owner or admin).
**Body**: *(empty)* — all data read server-side from `loans` row.
**Steps**:

1. **Auth**: get user; **403** if not owner and not admin.
2. **Load loan** (visible via RLS). **404** if missing.
3. **State checks**:

   * If status not in `submitted|needs_review` → **409** (already final).
   * Detect **input hash** (see §7) and compare with last decision; if unchanged within last minute → return the last decision (idempotent).
4. **Feature extraction** (`/lib/features.ts`):

   * `credit_score` (300–900), `dti_ratio` recomputed with current EMI & income, `income`, `employment_length_years`, `amount`, `tenure_months`, `purpose` (for reason wording only).
5. **Score**:

   * Choose model per `process.env.AI_MODEL` (`rules` default, `logistic` optional).
   * Compute normalized feature vector, score ∈ \[0,1].
   * Map to **decision** and **reasons\[]** (see §5).
6. **Persist (transaction)**:

   * Insert into `decisions` (`loan_id`, `decision`, `score`, `reasons`).
   * Update `loans.status` accordingly.
   * Insert `audit_logs` action=`decision.create`.
7. **Return**:

   * 201 with `{ decision, score, reasons, loan:{id,status} }`.

**Errors**:

* **401** unauthenticated, **403** forbidden, **404** not found,
* **409** invalid state (already final approval/rejection),
* **422** if required loan fields missing/invalid, **500** unexpected.

*(Optional)* `GET /api/decisions?loan_id=:id` remains read-only (Phase 3 page can show latest).

---

## 5) Scoring Design (Explainable & Minimal)

### 5.1 Features

* `credit_score` (300–900) → normalize: `(cs - 300) / 600`.
* `dti_ratio` (0–1) → invert preference: `max(0, 1 - (dti / 0.35))` clipped to \[0,1].
* `income` and `emi` → `emi_to_income = 1 - min(1, emi / max(income, 1))`; prefer ≤ 0.35.
* `employment_length_years` (0–40) → normalize: `min(years,10)/10`.
* `amount_vs_income` → `1 - min(1, amount / (12 * income))` (smaller is better).

### 5.2 Rule-Based Weights (sum = 100)

* `credit_score` → **35%**
* `dti_ratio` (inverted) → **25%**
* `emi_to_income` → **25%**
* `employment_length_years` → **10%**
* `amount_vs_income` → **5%**

Score = weighted average in \[0,1].

### 5.3 Thresholds (configurable)

* **approve**: `score ≥ 0.70`
* **needs\_review**: `0.55 ≤ score < 0.70`
* **reject**: `score < 0.55`

*(Expose in `/ai/thresholds.ts` and allow env override via `DECISION_THRESHOLDS_JSON`.)*

### 5.4 Guardrails (policy checks)

* If `credit_score < 500` → **reject** regardless of score; reason added.
* If `dti_ratio > 0.60` → **reject**; reason added.
* If `emi_to_income < 0.60` (i.e., EMI > 40% of income) → lower cap on final score to 0.65 (push to **review**).
* If missing critical fields → **422**.

### 5.5 Explanations (deterministic)

Generate **3–6 reasons**, ranked:

* Positive signals:

  * `"Strong credit score (X)"`
  * `"Healthy EMI-to-income ratio (Y%)"`
  * `"Low DTI (Z%)"`
  * `"Stable employment (N years)"`
* Negative signals:

  * `"High DTI (Z%) exceeds 35% ideal"`
  * `"EMI Y% of income exceeds 40% comfort band"`
  * `"Low credit score (X) below 500 floor"`
  * `"Large requested amount relative to income"`

Reasons should **match** the guardrails and weight contributions.

### 5.6 Optional Logistic Model

* Hard-coded coefficients (documented in `logistic.ts`), no training in Phase 4.
* Use same feature extraction; output `p = sigmoid(w·x + b)`, interpret `p` as score.
* Enable with `AI_MODEL=logistic`.

---

## 6) Configuration

Add to `.env.example`:

```
AI_MODEL=rules                      # or 'logistic'
DECISION_THRESHOLDS_JSON={"approve":0.7,"review":0.55}
DECISION_MIN_DECISION_INTERVAL_SEC=60
```

* `DECISION_MIN_DECISION_INTERVAL_SEC`: prevents decision spam; return last decision if called too soon and inputs unchanged.

---

## 7) Idempotency, Input Drift & State

* Compute an **input hash** (e.g., stable JSON of fields: `amount, tenure_months, income, employment_length_years, credit_score, dti_ratio (recomputed)`) → `sha256`.
* Store last decision’s `input_hash` in `decisions.meta` (extend schema logically with meta or encode in `reasons` tail—prefer meta).
* On decide:

  * If `loans.status in ('approved','rejected')` → **409**.
  * If last `input_hash` equals new hash **and** last decision is within `DECISION_MIN_DECISION_INTERVAL_SEC` → return last decision (idempotent).
  * If user edited inputs since last decision → allow **re-run**; insert new decision & update status.

*(If you don’t want to add a new DB column now, include `input_hash` inside `decisions.reasons` meta as a final hidden reason string—but prefer a clean `meta` jsonb.)*

---

## 8) Transactions & Concurrency

* Wrap `decisions` insert + `loans` status update + `audit_logs` insert in a **single transaction**.
* If the `loans` row changes between read and write (rare), retry once; otherwise return **409**.

---

## 9) UI Additions (Minimal)

### `/loans/[id]`

* Add **Run Decision** button:

  * Disabled while pending.
  * On success, show toast “Decision recorded”.
* Add **DecisionCard**:

  * Status badge (`Approved/Rejected/Needs review`).
  * Score (0–100% or 0.00–1.00).
  * Reason chips (wrap and readable).
  * Timestamp of latest decision.
* Show **Re-run decision** CTA only if inputs changed since last decision (compare client-side snapshot against last decision’s snapshot if exposed; otherwise always allow and rely on server idempotency).

---

## 10) Observability & Audit

* **Audit**: `decision.create` with `entity='loan'`, `entity_id=loan.id`, `meta` including `decision`, `score`, **top 2 reasons**, `input_hash` (if stored here).
* **Logs**: Keep **structured console logs** in the API route (info level only in dev).
* **Metrics (optional)**: Count of decisions by outcome (log once after success).

---

## 11) Testing

### 11.1 Unit

* `scoring.spec.ts`:

  * High credit, low DTI → approve.
  * Low credit floor → reject.
  * High DTI floor → reject.
  * Borderline → needs\_review.
  * Reasons include expected phrases.
* `logistic.spec.ts` (optional if enabled).

### 11.2 Integration

* `decide` endpoint:

  * 401 unauthenticated.
  * 403 non-owner non-admin access.
  * 404 loan not found (or not visible via RLS).
  * 409 when loan already approved/rejected.
  * 201 success path creates `decisions` row and updates status.
  * Idempotency: same inputs within interval returns last decision.

*(Produce minimal JUnit/Vitest reports so Jenkins can surface them—Phase 5 picks this up in CI.)*

---

## 12) Manual QA Checklist

1. As **normal user**, create a loan (Phase 3). Open detail → click **Run Decision**.
2. Observe status + score + reasons. Refresh page → persisted.
3. Edit loan inputs (e.g., increase amount) → Re-run decision → status can change.
4. As **another user**, try deciding someone else’s loan → **403**.
5. As **admin**, decide any loan → allowed.
6. Run decision twice without changing inputs → second call returns recent decision (idempotent).
7. Verify DB:

   * `decisions` row present; `loans.status` updated.
   * `audit_logs` has `decision.create`.

---

## 13) Documentation Updates

* `README.md`

  * Add **Phase 4**: scoring model, thresholds, env, how to run decision.
  * API example for `POST /api/loans/[id]/decide`.
* `/docs/Status-Phase4.md`

  * Summary of what was added, edge cases handled, screenshots list.
* `/docs/screenshots/phase-4/`

  * Decision flow UI, Supabase `decisions` entries, audit log sample.

---

## 14) Task List (Execute One by One)

1. **Scaffold** `/ai` modules: `scoring.ts`, `logistic.ts`, `explain.ts`, `thresholds.ts`; test files.
2. Add `/lib/features.ts` for **canonical feature extraction** (uses `/lib/emi.ts`).
3. Implement **rule-based scoring** with weights & thresholds.
4. Implement **explanations**: consistent phrasing for positive/negative signals.
5. Implement optional **logistic** scorer (env switch).
6. Add `/app/api/loans/[id]/decide/route.ts` with **transaction** & **audit**.
7. Add **idempotency** via `input_hash` (and interval env).
8. Update `/supabase/policies.sql` if needed (owner/admin insert into `decisions`).
9. Add **UI**: `RunDecisionButton`, `DecisionCard`, wire in `/loans/[id]`.
10. Write **unit tests** for scoring + **integration** tests for endpoint.
11. Update **README**; create `/docs/Status-Phase4.md`; capture screenshots.
12. Final pass: manual QA checklist; fix any blocking issues.

---

## 15) Commit Plan (Conventional Commits)

* `chore: scaffold ai scoring modules and tests`
* `feat(ai): implement rule-based scoring with thresholds and reasons`
* `feat(ai): add logistic scorer behind AI_MODEL flag`
* `feat(api): decision endpoint with transaction and audit`
* `feat(api): idempotency via input hash and interval`
* `feat(ui): add Run Decision button and DecisionCard on loan detail`
* `test: unit tests for scoring and integration tests for decide`
* `docs: add Status-Phase4, screenshots, and README updates`

---

## 16) Final Verification

* Endpoint secure & deterministic; RLS enforced.
* Decisions persisted; loan status updated; audit captured.
* UI shows decision outcome clearly; idempotency works.
* Docs & screenshots complete.

> **Proceed now**: Print Task 1 from Section 14 and start execution with a small commit after completing it.

---

## 🔁 (Optional) Minimal SQL Addendum (only if you choose to store `input_hash` cleanly)

If you want a clean place for `input_hash` and other metadata:

* Add `meta jsonb default '{}'::jsonb` to `public.decisions`.
* Index: `create index decisions_loan_created_idx on public.decisions(loan_id, created_at desc);` *(likely already added in Phase 2)*.

---

# ⏩ Copy-Paste Agent Prompt (Short Execution Version)

**You are an AI build agent. Implement Phase 4 now.** Work **one task at a time**, small commits (Conventional Commits), and follow this compact plan:

**Goal**: Add a transparent AI scoring engine and a decision endpoint that writes a `decisions` row, updates `loans.status`, and records an audit log—securely under RLS. Wire a “Run Decision” button on `/loans/[id]` to show score and reasons.

**Tasks**

1. Scaffold modules: `/ai/{scoring.ts, logistic.ts, explain.ts, thresholds.ts}`, tests; `/lib/features.ts`; `/components/{RunDecisionButton.tsx, DecisionCard.tsx, ReasonChips.tsx}`.
2. Implement **rule-based** scoring: weights (35 cs, 25 dtiInv, 25 emiToIncome, 10 employment, 5 amountVsIncome), thresholds approve≥0.70, review≥0.55, otherwise reject; guardrails (cs<500 reject; dti>0.60 reject; emi>40% cap score 0.65).
3. Implement **explanations** (3–6 reasons, positive/negative consistent phrasing).
4. Optional **logistic** scorer; toggle with `AI_MODEL=logistic`.
5. Build `POST /api/loans/[id]/decide`: auth owner/admin; load loan (RLS); feature extract; compute score/decision; **transaction**: insert `decisions`, update `loans.status`, `audit_logs decision.create`; return `{decision,score,reasons,loan}`.
6. **Idempotency**: compute `input_hash` over inputs; if unchanged and last decision is recent (`DECISION_MIN_DECISION_INTERVAL_SEC`), return last decision; else proceed.
7. UI: On `/loans/[id]`, add **Run Decision** button; after success, render **DecisionCard** (status badge, score, reasons, timestamp).
8. Tests: unit for scoring; integration for endpoint (401/403/404/409/201 + idempotency).
9. Docs: update `README` (env `AI_MODEL`, `DECISION_THRESHOLDS_JSON`, interval); add `/docs/Status-Phase4.md` + screenshots.
10. Commit and verify with manual QA: normal user & admin paths, RLS, idempotency.

**Env defaults**:

```
AI_MODEL=rules
DECISION_THRESHOLDS_JSON={"approve":0.7,"review":0.55}
DECISION_MIN_DECISION_INTERVAL_SEC=60
```

**Start now**: Print Task 1, execute it, commit, and continue sequentially until done.
