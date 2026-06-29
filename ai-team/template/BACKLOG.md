# BACKLOG.md
## EBFMS — Product Backlog

> Owner: Project Manager
> Updated: After sprint planning and when new tasks are identified.
> Sorted by: Milestone, then Priority within each milestone.

---

## How to Use This File

- Project Manager pulls tasks from here into `CURRENT_SPRINT.md` at sprint planning.
- Any role can add a task to the backlog by appending to the relevant milestone section.
- Tasks must have a unique TASK-ID, a description clear enough for any Claude to start
  without asking questions, an owner role, and a priority.

---

## Priority Legend

- **P1** — Blocks milestone completion or another task.
- **P2** — Required for milestone; no blocking dependency.
- **P3** — Nice to have; schedule after P1 and P2 clear.

---

## M1 — Foundation

| Task ID | Description | Owner Role | Priority | Dependencies |
|---------|-------------|------------|----------|-------------|
| TASK-001 | Docker Compose with postgres, backend, frontend, postgres_test services | DevOps Engineer | P1 | — |
| TASK-002 | GitHub Actions CI: lint → type-check → prisma generate → migrate → test:coverage (backend) + build (frontend) | DevOps Engineer | P1 | TASK-001 |
| TASK-003 | Prisma schema baseline — all tables per architecture doc Section 6.2 | Database Engineer | P1 | — |
| TASK-004 | Post-schema SQL constraints migration (CHECK constraints, partial indexes per architecture doc Section 6.3) | Database Engineer | P1 | TASK-003 |
| TASK-005 | Seed data: roles, expense categories, default system settings, 3 test users (one per key role) | Database Engineer | P2 | TASK-003 |
| TASK-006 | Backend scaffold: Express app, common middleware (error handler, request logger, asyncHandler, AppError), app.ts with placeholder module registrations | Backend Engineer | P1 | TASK-001 |
| TASK-007 | Frontend scaffold: Vite + React 18 + TS + Tailwind, httpClient.ts, store skeleton, routes skeleton | Frontend Engineer | P1 | — |

---

## M2 — Authentication

| Task ID | Description | Owner Role | Priority | Dependencies |
|---------|-------------|------------|----------|-------------|
| TASK-010 | Auth module: schema, DTO, service (login, refresh, logout, forgot-password, reset-password) | Backend Engineer | P1 | M1 complete |
| TASK-011 | Auth routes: POST /auth/login, /auth/refresh, /auth/logout, /auth/forgot-password, /auth/reset-password | Backend Engineer | P1 | TASK-010 |
| TASK-012 | authenticate.ts middleware: JWT validation, req.user attachment | Backend Engineer | P1 | TASK-010 |
| TASK-013 | authorize.ts middleware: role-based access control | Backend Engineer | P1 | TASK-012 |
| TASK-014 | Refresh token rotation: revoke old on use, reuse detection = security event | Backend Engineer | P1 | TASK-010 |
| TASK-015 | Auth unit tests (service): login, refresh, logout, lockout after N failures | QA / Backend Engineer | P1 | TASK-010 |
| TASK-016 | Auth integration tests: all 5 endpoints, 401/403/422 cases | QA Engineer | P1 | TASK-011 |
| TASK-017 | Security review: Auth module (Argon2id params, token TTLs, refresh rotation) | Security Engineer | P1 | TASK-014 |
| TASK-018 | Frontend: Login page, forgot-password flow, token storage in httpClient interceptor | Frontend Engineer | P1 | TASK-011 |

---

## M3 — User & Role Management

| Task ID | Description | Owner Role | Priority | Dependencies |
|---------|-------------|------------|----------|-------------|
| TASK-020 | Users module: CRUD, role assignment, department association | Backend Engineer | P1 | M2 complete |
| TASK-021 | Users integration tests: RBAC matrix for user endpoints | QA Engineer | P1 | TASK-020 |
| TASK-022 | Frontend: User list, user detail, invite user, role assignment pages | Frontend Engineer | P2 | TASK-020 |

---

## M4 — Departments & Org Structure

*(Tasks to be defined at sprint planning for M4)*

---

## M5 — Projects & Teams

*(Tasks to be defined at sprint planning for M5)*

---

## M6 — Budget Requests

*(Tasks to be defined at sprint planning for M6)*

---

## M7 — Approval Engine

*(Tasks to be defined at sprint planning for M7 — highest complexity milestone)*

---

## M8 — Fund Allocation

*(Tasks to be defined at sprint planning for M8)*

---

## M9 — Expense Management

*(Tasks to be defined at sprint planning for M9)*

---

## M10 — Notifications

*(Tasks to be defined at sprint planning for M10)*

---

## M11 — Audit Logging

*(Note: Audit logging should be built incrementally alongside each module,
not entirely in M11. M11 is for the viewer UI and partitioning setup.)*

---

## M12–M18 — Payroll, Reports, Analytics, Search, Settings, Hardening, UAT

*(Tasks to be defined closer to the relevant milestone.)*

---

## Technical Debt / Infrastructure

| Task ID | Description | Owner Role | Priority | Notes |
|---------|-------------|------------|----------|-------|
| TASK-090 | Add frontend test infrastructure (Vitest + Testing Library) | DevOps Engineer + QA | P2 | Currently no frontend tests |
| TASK-091 | Add load testing baseline suite (k6 or Artillery) | Performance Engineer | P2 | Needed before M9 |
| TASK-092 | Set up read replica configuration for analytics | DevOps Engineer | P3 | Needed before M14 |
