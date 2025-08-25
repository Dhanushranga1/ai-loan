Below are **two deliverables** you asked for:

1. A **Phase-6 Markdown spec** (drop into `/docs/Phase-6.md`).
2. A **separate, copy-pasteable agent prompt** that tells your AI builder exactly how to execute Phase-6, with a **live TODO list** per task.

---

# 📄 `/docs/Phase-6.md` — **Review-1 Packaging: Docs, Slides, Evidence**

*Project: AI Loan Approval System (Next.js · Supabase · Tailwind · shadcn/ui · Jenkins · Docker)*

> **Goal of Phase-6:** Produce and package all **Review-1 deliverables**—a polished **one-page abstract (PDF)**, **presentation slides (PPTX)**, and **screenshots/evidence**—strictly for this project. Align content with the Review-1 rubric and ensure everything in the repo is ready for evaluation and viva.

---

## 0) Context & Scope (project-specific)

* **What exists** (Phases 2–5 complete):

  * Supabase **Auth + RLS**; schema: `profiles`, `loans`, `decisions`, `audit_logs`.
  * End-to-end **Loans** flow (create/list/detail).
  * **AI Decisioning** (`/api/loans/[id]/decide`) with rule-based scoring + explanations; audit.
  * **CI/CD** via Jenkins; **Docker** container; single **VM** deploy; health checks; rollback.

* **This phase delivers** polished artifacts and repo hygiene for **DevOps Review-1** only (no new features).

---

## 1) Outputs & File Layout

Create the following (commit to repo):

```
/docs
  Phase-6.md                           # this file
  AI-Loan-Approval-Abstract.pdf        # one-page abstract
  Review1-Slides.pptx                  # 10–12 slides
  Status-Phase6.md                     # what was done + links
  /screenshots/phase-6/
    01-jenkins-green.png
    02-dockerhub-tags.png
    03-vm-docker-ps.png
    04-app-home.png
    05-loans-list.png
    06-loan-detail-decision.png
    07-health-endpoint.png
    08-rls-policies.png
    09-supabase-tables.png
    10-commit-and-tag.png
  /artifacts/
    architecture-diagram.png
    ci-cd-pipeline.png
    db-erd.png
    scoring-logic.png
README.md                               # updated 'Review-1' section
```

> If a screenshot cannot be captured right now, create a **placeholder PNG** with the exact file name and “TO BE REPLACED” watermark. Replace before submission.

---

## 2) One-Page Abstract (PDF) — **Project-specific Copy**

**Title:** AI Loan Approval System — DevOps-Ready MVP (Next.js · Supabase · Jenkins · Docker)

**Problem & Motivation (3–4 lines):**
Loan desks are overloaded with repetitive applications. Manual triage delays approvals and increases operational costs. We need a minimal, auditable system that **authenticates users**, **collects loan inputs**, and **automatically scores** applications to **approve / reject / mark for review**—with a modern DevOps pipeline for quick, reliable releases.

**Objectives (bullets):**

* Build a **full-stack** app (Next.js) with **Supabase Auth + RLS** for per-user data isolation.
* Implement a **transparent AI scoring** (rule-based + explanations) with guarded thresholds.
* Provide **loan lifecycle**: create → list → view → decide.
* Set up **CI/CD** with **Jenkins + Docker** and **single-VM deploy** (health checks + rollback).

**Scope (in/out):**

* **In:** Auth, loan CRUD, decision endpoint, explanations, audit logs, CI/CD to VM.
* **Out (for now):** Heavy ML training, Kubernetes, multi-env blue/green.

**Architecture (1–2 lines):**
Next.js server routes + Supabase (Postgres+Auth) under RLS; AI scorer as a pure TS module; Jenkins builds & tests → Docker image → VM deploy via SSH script.

**Key Tools:** Next.js, Supabase, Tailwind + shadcn/ui, Vitest, Jenkins, Docker.

**Expected Outcome:**
A working MVP that **securely processes loans**, **explains decisions**, and **ships via automated pipeline**; ready for extension to richer ML and scaling post-Review-1.

*(The PDF should be clean, one page, with a small architecture diagram and logos if desired.)*

---

## 3) Slides (10–12) — **Slide-by-Slide Content**

> File: `/docs/Review1-Slides.pptx`. Keep visuals consistent with project palette (Inter font; blue-500 accents).

1. **Title**

   * Project name, team, stack badges (Next.js, Supabase, Jenkins, Docker).
2. **Problem & Objectives**

   * Problem in one sentence; objectives bullets (Auth, RLS, AI scoring, CI/CD).
3. **Scope & Assumptions**

   * In/Out; assumptions: single VM, rule-based scorer.
4. **System Architecture** *(insert `architecture-diagram.png`)*

   * Blocks: Next.js API routes, AI scorer, Supabase (Auth/DB/RLS), Jenkins, Docker, VM.
5. **Database & Security (RLS)** *(insert `db-erd.png` and RLS summary)*

   * Tables with one-line purpose; RLS policy summary (owner-only rows; admin override).
6. **AI Scoring & Guardrails** *(insert `scoring-logic.png`)*

   * Weights (35/25/25/10/5), thresholds (≥0.70 approve, ≥0.55 review, else reject), guardrails (credit<500 reject, DTI>0.60 reject).
7. **CI/CD Pipeline** *(insert `ci-cd-pipeline.png`)*

   * Stages: checkout → install → test → build → docker → push → deploy(SSH); health + rollback.
8. **Demo Flow (Live)**

   * Register → New Loan → Run Decision → See decision → Trigger pipeline → Deploy → Health OK.
9. **Evidence (Screenshots)**

   * Jenkins green; Docker tags; VM `docker ps`; app UI; health endpoint.
10. **Risks & Mitigations**

    * Crash loops → health+rollback; secrets → env file; scope creep → phased plan.
11. **Roadmap (Post-Review-1)**

    * Logistic model toggle; admin dashboards; observability; K8s (future).
12. **Q\&A**

    * One slide with 5 likely viva questions and short answers.

**Speaker Notes (key points per slide)**: Include concise notes for each slide in the PPTX speaker notes pane.

---

## 4) Diagrams (project-specific)

Produce PNGs under `/docs/artifacts/`:

* `architecture-diagram.png` — boxes & arrows:

  * User → Next.js (UI + API) → Supabase (Auth/DB/RLS).
  * Next.js → AI Scorer (TS module).
  * Jenkins → Docker → VM (Deploy scripts) → Container (Next app) → `/api/health`.
* `db-erd.png` — entities & keys:

  * `profiles (id=auth.uid, role)`, `loans (user_id FK)`, `decisions (loan_id FK)`, `audit_logs`.
* `ci-cd-pipeline.png` — pipeline stages & artifacts.
* `scoring-logic.png` — weights, thresholds, guardrails (visual).

Use simple, high-contrast visuals; export 1600px width.

---

## 5) Screenshot Checklist (exactly what to capture)

Save to `/docs/screenshots/phase-6/` with these names:

1. `01-jenkins-green.png` — Pipeline success on `main`.
2. `02-dockerhub-tags.png` — Registry showing `:latest` + commit tag.
3. `03-vm-docker-ps.png` — VM container running (`ai-loan-approval`).
4. `04-app-home.png` — Home/dashboard after login.
5. `05-loans-list.png` — `/loans` table with status badges.
6. `06-loan-detail-decision.png` — Decision card with score + reasons.
7. `07-health-endpoint.png` — `/api/health` returning `{ ok: true }`.
8. `08-rls-policies.png` — Supabase RLS policy list view.
9. `09-supabase-tables.png` — Tables panel (profiles, loans, decisions, audit\_logs).
10. `10-commit-and-tag.png` — Git tag `v0.1-review1` and release page.

> Replace placeholders before submission.

---

## 6) README Additions (Review-1 section)

Add a **“Review-1”** section to `README.md`:

* **Abstract**: link to PDF.
* **Slides**: link to PPTX.
* **Live Demo**: URL or VM IP\:port (mask if private).
* **Repo & Tag**: link to tag `v0.1-review1`.
* **How to Run Locally**: `.env`, `pnpm dev`.
* **CI/CD Summary**: one paragraph + link to `Jenkinsfile`.
* **Security**: RLS statement + audit logs mention.
* **Credits**: tools and versions.

---

## 7) Demo Script (time-boxed, project-specific)

**Total 6–8 minutes**

1. **Intro (30s):** Problem + objective (1 slide).
2. **Arch (60s):** Point to diagram; note RLS + scorer plug-in.
3. **Flow (2–3 min):**

   * Register/Login → `/loans/new` → fill → submit → detail → **Run Decision**.
   * Show score + reasons (approve/reject/review).
4. **CI/CD (1–2 min):** Open Jenkins, show last build → Docker tags → VM `docker ps` → `/api/health`.
5. **Wrap (30s):** What works, what’s next.
6. **Q\&A (1–2 min)**

---

## 8) Viva Q\&A (cheat sheet, short answers)

* **Why rule-based vs ML now?**
  Transparent, auditable, zero training infra; ready to toggle logistic model later.
* **How is data isolated?**
  Supabase **RLS**: owners see rows where `user_id = auth.uid()`; admin via `profiles.role='admin'`.
* **Rollback strategy?**
  Keep previous image tag; `rollback.sh` stops current container and starts last successful.
* **What ensures reliability?**
  Unit tests (Vitest), health checks, transactionally writing decisions & status, CI gating.
* **Security of secrets?**
  Runtime env file on VM; no service role in request paths; public keys only on client.

---

## 9) Acceptance Criteria (for Phase-6)

* Abstract PDF and Slides PPTX exist and are **project-specific** (no generic filler).
* Required screenshots present (no missing files); placeholders replaced where feasible.
* README has a **Review-1** section with links.
* Git **tag `v0.1-review1`** created; **Status-Phase6.md** summarizes outputs.
* All content matches **this project** (Next.js, Supabase, RLS, Jenkins, Docker).

---

## 10) Task List & Commit Plan

**Tasks (also mirror to `/docs/Phase-6-TODO.md`):**

1. Generate **architecture**, **DB ERD**, **CI/CD**, **scoring** diagrams (PNGs).
2. Draft **Abstract** (project copy) → export to PDF.
3. Build **Slides** (12) with speaker notes; embed diagrams.
4. Capture/prepare **screenshots**; add placeholders if needed.
5. Update **README** (Review-1 section).
6. Create `Status-Phase6.md` (links, notes).
7. Create **Git tag** `v0.1-review1` and push.
8. Final pass: broken links, filenames, spellcheck.

**Conventional Commits (examples):**

* `docs: add Phase-6 spec and TODO`
* `docs: add abstract PDF and review slides`
* `docs(artifacts): add architecture/db/ci-cd/scoring diagrams`
* `docs(evidence): add review-1 screenshots`
* `docs: update README with Review-1 section`
* `chore(release): tag v0.1-review1`
* `docs: add Status-Phase6 with links`

---

# 🤖 Copy-Paste Agent Prompt — **Phase-6 (Docs, Slides, Evidence)**

You are an AI build agent. Execute **Phase-6** for the **AI Loan Approval System** repository. Work in **small, atomic commits** with **Conventional Commits**. Maintain a **live TODO list** for every task.

## Ground Rules

* Only produce content **specific to this project** (Next.js, Supabase RLS, rule-based scorer, Jenkins, Docker, single VM).
* Do not change app behavior or infra in this phase; produce **documentation, slides, diagrams, and evidence**.
* Before each task, **append a checkbox** to `/docs/Phase-6-TODO.md`. After completion, **tick it**, add a one-line note, and **commit**.

## Tasks (run sequentially)

1. **Scaffold TODO & Status files**

* Create `/docs/Phase-6-TODO.md` with the checklist from Phase-6 spec.
* Create `/docs/Status-Phase6.md` (empty skeleton with sections: Outputs, Links, Notes).
* **Commit:** `docs: add Phase-6 TODO and Status skeleton`

2. **Generate Diagrams (PNGs)**

* `/docs/artifacts/architecture-diagram.png` — boxes/arrows per Phase-6 spec.
* `/docs/artifacts/db-erd.png` — profiles, loans, decisions, audit\_logs with keys.
* `/docs/artifacts/ci-cd-pipeline.png` — Jenkins stages & artifacts.
* `/docs/artifacts/scoring-logic.png` — weights, thresholds, guardrails.
* **Commit:** `docs(artifacts): add architecture, db, ci-cd, scoring diagrams`

3. **Abstract PDF**

* Create `/docs/AI-Loan-Approval-Abstract.pdf` using the exact project copy from Phase-6 spec (Section 2). Keep it **one page** with a small architecture visual.
* **Commit:** `docs: add AI-Loan-Approval-Abstract (PDF)`

4. **Slides (PPTX)**

* Build `/docs/Review1-Slides.pptx` with **12 slides** as specified (Section 3), embedding the PNG diagrams and adding concise speaker notes.
* Title, Problem/Objectives, Scope, Architecture, DB+RLS, Scoring, CI/CD, Demo Flow, Evidence, Risks, Roadmap, Q\&A.
* **Commit:** `docs: add Review1-Slides with notes and embedded diagrams`

5. **Screenshots/Evidence**

* Under `/docs/screenshots/phase-6/`, add the 10 files named exactly as in Section 5.
* If a real capture isn’t possible now, create a placeholder PNG with **“TO BE REPLACED”** watermark and a short caption of what to capture.
* **Commit:** `docs(evidence): add review-1 screenshots (placeholders where needed)`

6. **README Update (Review-1 section)**

* Add a “**Review-1**” section that links to the Abstract PDF, Slides PPTX, screenshots folder, and tag (to be created). Briefly summarize CI/CD and security (RLS).
* **Commit:** `docs: update README with Review-1 section and links`

7. **Release Tag**

* Create git tag `v0.1-review1` and push it.
* Capture `10-commit-and-tag.png` (or update the placeholder) showing the tag present.
* **Commit:** `chore(release): tag v0.1-review1`

8. **Status Report**

* Fill `/docs/Status-Phase6.md`:

  * **Outputs**: list of produced files
  * **Links**: repo, tag, Jenkins job URL, Docker image tag (text)
  * **Notes**: any placeholders to replace; any known doc gaps
* **Commit:** `docs: finalize Status-Phase6 with links and notes`

9. **Final Sanity**

* Ensure all internal links/images work when browsing the repo.
* Spellcheck titles, slide headings, and abstract.
* **Commit (if needed):** `docs: fix broken links and typos`

## Live TODO Protocol

* Every time you start a task, append `- [ ] <task>` to `/docs/Phase-6-TODO.md`.
* On completion, change it to `- [x] <task> — <one-line result>`.
* Reference file names explicitly in the note (e.g., “added Review1-Slides.pptx with 12 slides”).

## Acceptance Criteria

* Abstract PDF and Slides PPTX exist and are **project-specific**.
* All 10 screenshots exist (real or marked placeholders).
* README has **Review-1** section with working links.
* Git tag **`v0.1-review1`** exists and is pushed.
* `/docs/Status-Phase6.md` summarizes outputs with links.

**Start now**:

1. Create `/docs/Phase-6-TODO.md` and `/docs/Status-Phase6.md`.
2. Execute Task 2 and continue sequentially, ticking the TODO after each commit.
