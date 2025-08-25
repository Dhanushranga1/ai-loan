Below are **two deliverables** you asked for:

1. A **Phase-5 Markdown spec** (drop into `/docs/Phase-5.md`).
2. A **separate, copy-pasteable agent prompt** that instructs your AI builder to execute Phase-5 while **maintaining a live TODO list**.

---

# 🚀 Phase 5 — CI/CD, Containerization & Deployment

*Project: AI Loan Approval System (Next.js · Supabase · Tailwind · shadcn/ui · Jenkins · Docker)*

> **Goal of Phase 5:** Ship a **minimal, reliable CI/CD pipeline** using **Jenkins** and **Docker**, deploy the app to a single **Linux VM** with a **one-command rollback**, and document screenshots to satisfy **DevOps Review-1** (initial pipeline + deployment env ready).

---

## 0) Context & Dependencies

* **Phases 2–4 are done**: Supabase Auth & RLS, Loans API & Pages, AI Decisioning, unit tests in Vitest.
* **Repo**: GitHub (branch: `main`, PRs from `feat/*`).
* **Runtime**: Next.js App Router, Node 20.
* **Target**: Single **VM** (Ubuntu/Debian) using **Docker** (no Kubernetes now).

**Non-Goals (for Phase-5)**

* No Helm/K8s, no multi-env blue-green. Keep it **simple**.

---

## 1) Objectives (What to Deliver)

1. **Containerized app** (multi-stage Dockerfile, small image, `next start`).
2. **Jenkins Declarative Pipeline** (`Jenkinsfile`) with stages:

   * *Checkout → Setup Node → Install deps (cache) → Lint/Test → Build → Docker build → Push → Deploy (SSH)*.
3. **VM Deploy Scripts** under `/infra`:

   * `deploy.sh` (pull latest image, stop old, run new, health-check).
   * `rollback.sh` (switch back to previous image tag).
   * `healthcheck.sh` (simple HTTP check).
   * `systemd` unit (optional) *or* rely on `--restart unless-stopped`.
4. **Secrets & Env**: single **env-file** on VM (`/etc/ai-loan-approval.env`).
5. **Observability (basic)**: `/api/health` endpoint + Docker logs runbook.
6. **Docs & Screenshots** for Review-1 in `/docs/`.

---

## 2) High-Level CI/CD Flow

* **Trigger**: PRs and `main` pushes via GitHub webhook to Jenkins.
* **CI**: run `vitest` unit tests, compile Next.js (production build).
* **CD**: On `main` success, build and push `ai-loan-approval:<commit>` and `:latest` to Docker Hub (or GHCR), then **SSH** to VM → `deploy.sh`.
* **Deploy contract**: container name = `ai-loan-approval`, exposed on `:3000`.

---

## 3) Environments & Branching

* **Local**: `pnpm dev`.
* **CI**: Jenkins agent with Node 20 & Docker.
* **Prod**: Single VM with Docker Engine.

**Branching**

* `main` protected (only PR merges).
* `feat/*` branches (small PRs, Conventional Commits).

---

## 4) Credentials & Secrets (Jenkins)

Create Jenkins credentials:

| ID                | Type              | Purpose                            |
| ----------------- | ----------------- | ---------------------------------- |
| `dockerhub-creds` | Username/Password | Push images to Docker Hub/Registry |
| `vm-ssh-key`      | SSH Private Key   | SSH to VM for deploy/rollback      |
| `github-creds`    | (optional)        | If needed for private repo fetch   |

**On the VM**, create `/etc/ai-loan-approval.env` with **only runtime secrets**:

```
# frontend
NEXT_PUBLIC_SUPABASE_URL=<...>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<...>

# server-only (do NOT put service key here unless you truly need it)
AI_MODEL=rules
DECISION_THRESHOLDS_JSON={"approve":0.7,"review":0.55}
DECISION_MIN_DECISION_INTERVAL_SEC=60
NODE_ENV=production
PORT=3000
```

> *Supabase service role is not required in request paths. Keep it off the VM unless you run admin jobs.*

---

## 5) Files to Add/Modify

```
Jenkinsfile
Dockerfile

/infra
  deploy.sh
  rollback.sh
  healthcheck.sh
  README.md

/app/api/health/route.ts      # simple 200 OK endpoint

/docs
  Phase-5.md                  # this file
  Status-Phase5.md
  /screenshots/phase-5/*
```

---

## 6) Docker Image (Multi-Stage, Next.js Standalone)

**Goals**: small runtime layer, no dev deps, predictable `node:20-alpine` or `node:20-slim`.

**Key points**

* Use **corepack** to enable `pnpm` if you use pnpm.
* `next build` with `NEXT_TELEMETRY_DISABLED=1`.
* Run with `node .next/standalone/server.js` (Next.js standalone output) or `next start` if not using standalone.
* Expose `3000`; use `--restart unless-stopped` in run.

---

## 7) Jenkins Pipeline (Declarative)

**Stages** (minimal):

1. **Checkout**
2. **Setup Node** (Node 20, enable corepack if pnpm)
3. **Install** (cache `~/.pnpm-store` or `node_modules` if npm)
4. **Lint & Test** (`pnpm test` or `npm test`)
5. **Build** (`pnpm build`)
6. **Docker Build & Push** (`ai-loan-approval:$GIT_COMMIT` and `:latest`)
7. **Deploy** (SSH to VM → `/infra/deploy.sh <imageTag>`)

**Post**: Archive JUnit, notify on failure (console is fine for now).

---

## 8) Deploy Strategy (VM)

* **Container name**: `ai-loan-approval`
* **Image**: `docker.io/<youruser>/ai-loan-approval:<tag>`
* **Network**: host or bridge; map `-p 3000:3000`
* **Env**: `--env-file /etc/ai-loan-approval.env`
* **Restart policy**: `--restart unless-stopped`
* **Health**: `healthcheck.sh` hits `http://localhost:3000/api/health`

**Rollback**

* Keep last successful tag in `/var/lib/ai-loan-approval/last_successful`.
* `rollback.sh` stops current container and runs previous tag.

---

## 9) Observability & Logs

* **Health endpoint**: `/api/health` returns `{ ok: true }`.
* **Logs**: `docker logs -f ai-loan-approval`
* **Runbook** in `/infra/README.md` includes:

  * restart, logs, disk cleanup (`docker system prune -f`), how to change env.

---

## 10) Acceptance Criteria

* Jenkins job triggers on PR/`main`, runs CI stages, and on `main` deploys to VM.
* `deploy.sh` replaces old container with new image and passes health check.
* App reachable at `http://<VM_IP>:3000/`.
* Rollback works (switch to previous tag).
* Screenshots in `/docs/screenshots/phase-5/`:

  * Jenkins green pipeline
  * Docker Hub image tags
  * VM `docker ps` output
  * App home page
  * Health endpoint

---

## 11) Security & Hardening (Minimal)

* Jenkins creds scoped to this job only.
* Never echo secrets into logs.
* VM firewall allows only `:22` (SSH) and `:3000` (or behind Nginx if you add it later).
* Keep `SUPABASE_*` public keys only; **no service role** on VM.

---

## 12) Manual QA Checklist

1. Push a trivial commit to `main` → Jenkins runs → Docker image built/pushed.
2. Jenkins deploys → VM shows new container running with new `IMAGE ID`.
3. Visit `/` and `/api/health` → returns 200, correct version (show commit short sha in footer if you render it).
4. Trigger rollback → app returns to previous version.

---

## 13) Risks & Mitigations

* **Long install times**: enable **dependency cache**.
* **Container crash loop**: deploy script runs **health check**; rollback on fail.
* **Port conflict**: ensure `3000` is free; otherwise edit `deploy.sh`.
* **Registry throttling**: keep images minimal; add `:latest` + commit tag.

---

## 14) Detailed Task List (Track in `/docs/Phase-5-TODO.md`)

> Create a **single file** checklist and keep it updated after each task. Use GitHub-style checkboxes.

```md
# Phase 5 TODO

## Prep
- [ ] Create Jenkins credentials: dockerhub-creds, vm-ssh-key
- [ ] Configure GitHub webhook → Jenkins (or Poll SCM)
- [ ] Provision VM with Docker Engine
- [ ] Create /etc/ai-loan-approval.env on VM (runtime env)

## Code & Infra
- [ ] Add Dockerfile (multi-stage, Next.js standalone)
- [ ] Add Jenkinsfile (stages: checkout→test→build→docker→push→deploy)
- [ ] Add /infra/deploy.sh and /infra/rollback.sh
- [ ] Add /infra/healthcheck.sh and /infra/README.md
- [ ] Add /app/api/health/route.ts

## CI/CD
- [ ] First pipeline run on PR (CI only)
- [ ] Merge to main → build & push images
- [ ] Auto-deploy to VM via SSH
- [ ] Validate healthcheck & app reachability
- [ ] Run rollback test

## Docs
- [ ] Update README: CI/CD overview, how to deploy/rollback
- [ ] Add /docs/Status-Phase5.md summary
- [ ] Capture screenshots in /docs/screenshots/phase-5/
```

---

## 15) Commit Plan (Conventional Commits)

* `chore(ci): scaffold Jenkinsfile and infra placeholders`
* `feat(docker): add multi-stage Dockerfile for nextjs`
* `feat(ci): add pipeline stages (install,test,build,docker,push,deploy)`
* `feat(infra): add deploy.sh, rollback.sh, healthcheck.sh`
* `feat(api): add /api/health route`
* `docs: add Phase-5 TODO, Status-Phase5, and screenshots`
* `chore(ci): enable dependency cache and junit reports`

---

## 16) Sample Implementation Snippets (for reference)

> These are **reference skeletons**. Your agent will generate the final versions.

### 16.1 `Dockerfile` (sketch)

```dockerfile
# --- Builder ---
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
# Prefer pnpm but fall back to npm if needed
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else yarn install --frozen-lockfile; fi
COPY . .
RUN if [ -f pnpm-lock.yaml ]; then pnpm build; \
    elif [ -f package-lock.json ]; then npm run build; \
    else yarn build; fi

# --- Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### 16.2 `Jenkinsfile` (sketch)

```groovy
pipeline {
  agent any
  environment {
    REGISTRY = 'docker.io/<youruser>'
    IMAGE = 'ai-loan-approval'
    COMMIT = "${env.GIT_COMMIT}"
    TAG = "${env.GIT_COMMIT.take(7)}"
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Setup Node') {
      steps {
        sh 'node -v || true'
        sh 'corepack enable || true'
      }
    }
    stage('Install') { steps { sh 'if [ -f pnpm-lock.yaml ]; then pnpm i --frozen-lockfile; elif [ -f package-lock.json ]; then npm ci; else yarn install --frozen-lockfile; fi' } }
    stage('Test') {
      steps { sh 'if [ -f pnpm-lock.yaml ]; then pnpm test -- --reporter=junit; else npm test -- --reporter=junit; fi' }
      post { always { junit '**/junit*.xml' } }
    }
    stage('Build') { steps { sh 'if [ -f pnpm-lock.yaml ]; then pnpm build; else npm run build; fi' } }
    stage('Docker Build & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker build -t $REGISTRY/$IMAGE:$TAG -t $REGISTRY/$IMAGE:latest .
            docker push $REGISTRY/$IMAGE:$TAG
            docker push $REGISTRY/$IMAGE:latest
          '''
        }
      }
    }
    stage('Deploy') {
      when { branch 'main' }
      steps {
        sshagent (credentials: ['vm-ssh-key']) {
          sh '''
            ssh -o StrictHostKeyChecking=no ubuntu@<VM_IP> "bash -s" <<'EOF'
            set -e
            sudo /bin/bash /opt/ai-loan-approval/deploy.sh $REGISTRY/$IMAGE:$TAG
            EOF
          '''
        }
      }
    }
  }
}
```

### 16.3 `/infra/deploy.sh` (sketch)

```bash
#!/usr/bin/env bash
set -euo pipefail
IMAGE="${1:?Usage: deploy.sh <image>}"
NAME="ai-loan-approval"
ENV_FILE="/etc/ai-loan-approval.env"
DATA_DIR="/var/lib/ai-loan-approval"
mkdir -p "$DATA_DIR"
echo "$IMAGE" > "$DATA_DIR/current_attempt"

echo "[deploy] pulling image $IMAGE"
docker pull "$IMAGE"

echo "[deploy] stopping old container (if any)"
docker rm -f "$NAME" || true

echo "[deploy] starting new container"
docker run -d --name "$NAME" \
  --env-file "$ENV_FILE" \
  -p 3000:3000 \
  --restart unless-stopped \
  "$IMAGE"

echo "[deploy] health check"
if /opt/ai-loan-approval/healthcheck.sh; then
  echo "$IMAGE" > "$DATA_DIR/last_successful"
  echo "[deploy] OK"
else
  echo "[deploy] FAILED — rolling back"
  /opt/ai-loan-approval/rollback.sh
  exit 1
fi
```

### 16.4 `/infra/rollback.sh` (sketch)

```bash
#!/usr/bin/env bash
set -euo pipefail
NAME="ai-loan-approval"
DATA_DIR="/var/lib/ai-loan-approval"
PREV="$(cat "$DATA_DIR/last_successful")"
[ -z "$PREV" ] && { echo "No previous image recorded"; exit 1; }
docker rm -f "$NAME" || true
docker run -d --name "$NAME" --env-file /etc/ai-loan-approval.env -p 3000:3000 --restart unless-stopped "$PREV"
```

### 16.5 `/infra/healthcheck.sh` (sketch)

```bash
#!/usr/bin/env bash
set -euo pipefail
for i in {1..20}; do
  if curl -fsS http://localhost:3000/api/health >/dev/null; then
    exit 0
  fi
  sleep 2
done
exit 1
```

### 16.6 `/app/api/health/route.ts` (sketch)

```ts
export async function GET() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}
```

---

## 17) Documentation & Screenshots

* `/docs/Status-Phase5.md`: summary, versions, links to Jenkins job, image tag deployed.
* Screenshots to capture:

  * Jenkins pipeline green
  * Image list in Docker Hub
  * VM `docker ps` showing `ai-loan-approval`
  * Health endpoint 200 OK in browser
  * Phase-5 TODO with all checkboxes ✅

---

# 📋 Copy-Paste Agent Prompt — **Phase 5 (CI/CD + Deploy)**

> **Role**: You are an AI build agent. Implement **Phase 5** end-to-end with **small commits** and **Conventional Commits**. Maintain a **live TODO list** for every task.

## Execution Rules

* Before each sub-task: **append a checkbox** to `/docs/Phase-5-TODO.md`.
* After completing it: **tick the box**, add a brief note, and **commit**.
* Keep commits atomic; push frequently.
* At the end: create `/docs/Status-Phase5.md` + screenshots.

## Tasks (do sequentially)

1. **Scaffold & TODO**

   * Create `/docs/Phase-5-TODO.md` with the checklist from Phase-5 spec.
   * Commit: `docs: add Phase-5 TODO checklist`

2. **Health Endpoint**

   * Add `/app/api/health/route.ts` returning `200 {ok:true}`.
   * Commit: `feat(api): add health endpoint for deploy checks`

3. **Dockerfile**

   * Add multi-stage `Dockerfile` (Node 20, Next.js build, standalone runner).
   * Commit: `feat(docker): add multi-stage Dockerfile for nextjs`

4. **Infra Scripts**

   * Add `/infra/deploy.sh`, `/infra/rollback.sh`, `/infra/healthcheck.sh`, `/infra/README.md`.
   * Commit: `feat(infra): add deploy, rollback, healthcheck scripts and runbook`

5. **Jenkinsfile**

   * Add Declarative pipeline with stages: checkout → setup node → install (cache) → test → build → docker build+push → deploy (SSH).
   * Commit: `feat(ci): add Jenkinsfile with build, test, docker, push, deploy`

6. **Jenkins/VM Setup (docs + screenshots)**

   * Document Jenkins credentials (`dockerhub-creds`, `vm-ssh-key`) and GitHub webhook.
   * On VM: create `/etc/ai-loan-approval.env`, put runtime env vars.
   * Put commands in `/infra/README.md`.
   * Commit: `docs: add Jenkins and VM setup steps`

7. **First CI Run**

   * Trigger a PR build (CI only). Ensure tests pass.
   * Archive JUnit reports.
   * Commit (if changes needed): `chore(ci): fix pipeline cache/test issues`

8. **Main → Image Push**

   * Merge PR to `main`. Verify Docker image pushed as `:<shortsha>` and `:latest`.
   * Screenshot Docker Hub tags.

9. **Deploy to VM**

   * Pipeline runs deploy stage (SSH → `deploy.sh <image>`).
   * Confirm `docker ps` shows container, health is OK.
   * If health fails, verify **auto-rollback** works via `rollback.sh`.
   * Commit (if scripts tuned): `fix(infra): harden deploy health/rollback`

10. **Docs & Screenshots**

    * Update `/docs/Status-Phase5.md` with:

      * Jenkins job URL, build number
      * Image tag deployed
      * VM IP/port (masked)
      * Notes on rollback test
    * Place screenshots in `/docs/screenshots/phase-5/`.
    * Commit: `docs: add Status-Phase5 and screenshots for review-1`

11. **Mark TODO Done**

    * Tick all completed checkboxes in `/docs/Phase-5-TODO.md`.
    * Commit: `docs: complete Phase-5 TODO`

## Acceptance Criteria

* Jenkins builds on PR; pushes & deploys on `main`.
* VM runs container with env-file; `/api/health` = 200.
* Rollback tested successfully.
* Docs + screenshots present.

**Start now**:

1. Create `/docs/Phase-5-TODO.md` with the checklist.
2. Execute Task 2, commit, and proceed step-by-step.
