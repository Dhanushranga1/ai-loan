# Phase 7 TODO List - Post-Review Hardening

## Tasks Progress

### ✅ Completed Tasks
- [x] **Task 1: Scaffold & TODO** — Created Phase-7-TODO.md and Status-Phase7.md skeleton
- [x] **Task 2: Admin List** — Add /app/(admin)/loans/page.tsx with table, filters, and admin guards

### 🔄 In Progress Tasks

### ⏳ Pending Tasks
- [ ] **Task 3: Admin Detail** — Add /app/(admin)/loans/[id]/page.tsx with DecisionTimeline component
- [ ] **Task 4: Build Info Footer** — Add AppFooterBuildInfo component with BUILD_SHA_SHORT
- [ ] **Task 5: Security Headers** — Add middleware.ts with CSP-lite, security headers
- [ ] **Task 6: Rate Limiting** — Add rate limiting for decision endpoint (3/min per user)
- [ ] **Task 7: Env Validation** — Add Zod-based environment validation on boot
- [ ] **Task 8: E2E Tests** — Add Playwright smoke flow covering login→create→decide
- [ ] **Task 9: Runbook & Screenshots** — Create operational runbook and capture evidence
- [ ] **Task 10: Status Update** — Complete Status-Phase7.md with outputs and links

## Implementation Checklist

### Admin Features
- [ ] Admin route guards with isAdmin() helper
- [ ] Admin loans list with filters (status, search, sort, pagination)
- [ ] Admin loan detail with decision timeline
- [ ] Server-side access control (403 redirect for non-admins)

### Security & Performance
- [ ] Security headers middleware (CSP, HSTS, no-sniff, frame-deny)
- [ ] Rate limiting on decision endpoint (429 responses)
- [ ] Environment validation with Zod schema
- [ ] Accessibility improvements (labels, aria-live, focus rings)

### Testing & Observability
- [ ] Playwright E2E test suite
- [ ] Structured logging in API routes
- [ ] Operational runbook with commands and troubleshooting
- [ ] Build info footer showing deployed commit SHA

### Documentation
- [ ] Phase 7 screenshots (admin views, tests, headers, rate limits)
- [ ] Runbook with health checks, logs, rollback procedures
- [ ] Status report with implementation summary

---
**Phase 7 Status**: 🚀 Started - Post-Review Hardening  
**Last Updated**: August 25, 2025  
**Goal**: Production-ready admin views, E2E tests, and operational tooling
