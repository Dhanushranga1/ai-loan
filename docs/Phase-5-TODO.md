# Phase 5 TODO

## Prep
- [ ] Create Jenkins credentials: dockerhub-creds, vm-ssh-key
- [ ] Configure GitHub webhook → Jenkins (or Poll SCM)
- [ ] Provision VM with Docker Engine
- [ ] Create /etc/ai-loan-approval.env on VM (runtime env)

## Code & Infra
- [x] Add Dockerfile (multi-stage, Next.js standalone)
- [ ] Add Jenkinsfile (stages: checkout→test→build→docker→push→deploy)
- [x] Add /infra/deploy.sh and /infra/rollback.sh
- [x] Add /infra/healthcheck.sh and /infra/README.md
- [x] Add /app/api/health/route.ts

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
