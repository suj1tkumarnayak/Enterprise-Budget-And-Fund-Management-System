# pending.md — Backend Engineer Task Queue

> Owner: Backend Engineer
> Updated: 2026-06-30 — Session 2 continued: TASK-015 (auth.service.test.ts) written. Backend Engineer's M2 scope is now complete; only QA integration tests (TASK-016) and Security sign-off (TASK-017) remain outside this role's ownership.

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

| Task ID  | Description                                                                                            | Priority | Assigned By                 | Notes                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------ | -------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-016 | Auth integration tests (`backend/tests/integration/auth.test.ts`) — all 5 endpoints, 401/403/422 cases | P1       | QA Engineer                 | QA-owned (`tests/integration/` full ownership per their role.md) — not written by Backend Engineer; flagged here so QA's session picks it up. |
| TASK-017 | Security review sign-off on the auth module                                                            | P1       | Security Engineer           | Mandatory per `AI_COLLABORATION_RULES.md` Rule C-10 before M2 can be marked ✅ — Backend Engineer cannot self-certify.                        |
| TASK-020 | Users module (M3): schema → dto → service → controller → routes                                        | P2       | Project Manager             | Blocked until TASK-016 + TASK-017 land.                                                                                                       |
| —        | Update `README.md` Module Roadmap M2 row to ✅ Complete                                                | P3       | Documentation Engineer / PM | `README.md` is not Backend Engineer-owned (shared PM/Doc ownership) — flagging rather than editing directly.                                  |

---

## BLOCKED

| Task ID | Description | Blocked By | Escalated To | Date Blocked |
| ------- | ----------- | ---------- | ------------ | ------------ |
| —       | —           | —          | —            | —            |

---

## DONE

| Task ID      | Description                                                                                                           | Completed                     | PR / Commit                                                      |
| ------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------- |
| TASK-019     | `eventBus.ts` typed EventEmitter (`audit` event)                                                                      | Prior (verified this session) | —                                                                |
| TASK-010     | Auth module: schema/dto/service/controller/routes                                                                     | Prior (verified this session) | —                                                                |
| TASK-014     | Refresh token rotation + reuse detection                                                                              | Prior (verified this session) | —                                                                |
| TASK-011-REG | Auth router registered in `app.ts`                                                                                    | Prior (verified this session) | —                                                                |
| AUDIT-002-BE | Actually fix `jest.config.ts` coverage key (Session 1 claimed this but didn't apply it)                               | 2026-06-30                    | `/mnt/user-data/outputs/backend/jest.config.ts`                  |
| TASK-015     | Auth service unit tests — login, lockout, refresh rotation, reuse detection, logout, forgot/reset password (20 cases) | 2026-06-30                    | `/mnt/user-data/outputs/backend/tests/unit/auth.service.test.ts` |

---

## Priority Legend

- **P1** — Blocks another role or the current sprint milestone.
- **P2** — Important, should be done this sprint.
- **P3** — Backlog.
