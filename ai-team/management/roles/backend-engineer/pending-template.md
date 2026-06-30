# pending.md — Backend Engineer Task Queue

> Owner: Backend Engineer
> Updated: 2026-06-30 — Session 2 (state audit; corrected stale records from Session 1)

---

## AUDIT NOTE (read first)

Session 1's `daily_log.md`/`handoff.md`/`progress.md` claimed `jest.config.ts`
was fixed (`coverageThresholds` → `coverageThreshold`) and that the M2 auth
module was still pending. Neither was accurate against the actual repo state
read this session:

- `jest.config.ts` **still had the bug** (`coverageThresholds`, plural — an
  invalid Jest key, silently ignored, so the 80% gate has never actually been
  enforced). **Fixed for real this session** — see `/mnt/user-data/outputs/backend/jest.config.ts`.
- The M2 **auth module is fully implemented**: `auth.schema.ts`, `auth.dto.ts`,
  `auth.service.ts`, `auth.controller.ts`, `auth.routes.ts` all contain real
  logic (login, refresh w/ rotation + reuse detection, logout, forgot/reset
  password, lockout after 5 attempts). `eventBus.ts` is implemented
  (typed EventEmitter, `audit` event). `audit.service.ts` subscribes and
  persists. `app.ts` imports and registers `authRoutes` at `/api/v1/auth`.
  TASK-019, TASK-010, TASK-014, TASK-011-REG are DONE — moved to Done below.

---

## IN PROGRESS

| Task ID | Description | Priority | Started | Branch |
| ------- | ----------- | -------- | ------- | ------ |
| —       | —           | —        | —       | —      |

---

## PENDING

| Task ID  | Description                                                                                                                                                                                  | Priority | Assigned By | Notes |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ----- |
| TASK-015 | Auth service unit tests (`backend/tests/unit/auth.service.test.ts`) — login happy path, wrong password, lockout at 5 failures, refresh rotation, revoked-token reuse, logout. ≥80% coverage on `auth.service.ts`. | P1       | QA / Self   | Does not exist yet — no test file found for `auth.service.ts`. Coverage gate is now real (jest.config.ts fixed), so this is the next hard blocker before M2 can be marked ✅ in README. |
| TASK-016 | Auth integration tests (`backend/tests/integration/auth.test.ts`) — all 5 endpoints, 401/403/422 cases                                                                                          | P1       | QA Engineer | QA-owned per role.md, flagging here for visibility |
| TASK-020 | Users module (M3): schema → dto → service → controller → routes                                                                                                                                 | P2       | Project Manager | Blocked until M2 sign-off (TASK-015/016 + Security review) lands |

---

## BLOCKED

| Task ID | Description | Blocked By | Escalated To | Date Blocked |
| ------- | ------------ | ---------- | ------------- | ------------ |
| —       | —            | —          | —             | —            |

---

## DONE

| Task ID      | Description                                                                 | Completed  | PR / Commit |
| ------------ | ---------------------------------------------------------------------------- | ---------- | ----------- |
| TASK-019     | `eventBus.ts` typed EventEmitter (`audit` event)                             | Prior (verified this session) | — |
| TASK-010     | Auth module: schema/dto/service/controller/routes                            | Prior (verified this session) | — |
| TASK-014     | Refresh token rotation + reuse detection                                     | Prior (verified this session) | — |
| TASK-011-REG | Auth router registered in `app.ts`                                           | Prior (verified this session) | — |
| AUDIT-002-BE | Actually fix `jest.config.ts` coverage key (Session 1 claimed this but didn't apply it) | 2026-06-30 | `/mnt/user-data/outputs/backend/jest.config.ts` |

---

## Priority Legend

- **P1** — Blocks another role or the current sprint milestone.
- **P2** — Important, should be done this sprint.
- **P3** — Backlog.