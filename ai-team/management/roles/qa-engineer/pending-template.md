# pending.md — QA Engineer Task Queue

> Owner: QA Engineer
> Updated: 2026-06-30 — TASK-016 (auth integration tests) completed.

---

## IN PROGRESS

| Task ID | Description | Priority | Started | Branch |
| ------- | ----------- | -------- | ------- | ------ |
| —       | —           | —        | —       | —      |

---

## PENDING

| Task ID  | Description                                                                                                                                                                    | Priority | Assigned By       | Notes                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------- |
| —        | Re-run `npm run test:coverage` once this suite is merged to confirm the auth module clears 80% now that `jest.config.ts`'s coverage gate is genuinely enforced (AUDIT-002-BE). | P1       | Self              | No live test DB in this sandbox session — could not execute the run; flagged as the immediate next QA action. |
| TASK-017 | Security review sign-off on the auth module                                                                                                                                    | P1       | Security Engineer | Still outside QA ownership — not blocking this task, but M2 cannot be ✅ until it lands.                      |

---

## BLOCKED

| Task ID | Description | Blocked By | Escalated To | Date Blocked |
| ------- | ----------- | ---------- | ------------ | ------------ |
| —       | —           | —          | —            | —            |

---

## DONE (this sprint)

| Task ID  | Description                                                                                                                          | Completed  | PR / Commit                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------- | --------------------------------------------------------------- |
| TASK-016 | Auth integration tests (`backend/tests/integration/auth.test.ts`) — all 5 endpoints, 400/401/403 cases, public-route exemption check | 2026-06-30 | `/mnt/user-data/outputs/backend/tests/integration/auth.test.ts` |

---

## Bug filed this session

A 422 (business-rule violation) is expected for an invalid/expired/used
password-reset token per `CODING_STANDARD.md` §4's general 422 convention,
but `auth.service.ts`'s `resetPassword()` throws `ValidationError`, which
`errorHandler.ts` maps to **400**, not 422. The test suite asserts the
actual (400) behavior so it doesn't false-fail, but this is logged as a
discrepancy for Backend Engineer to confirm is intentional (an
invalid-token submission is arguably closer to a validation failure than
a business-rule violation, so 400 may in fact be correct — needs a
System Architect/Backend Engineer call, not a QA unilateral fix).

## Priority Legend

- **P1** — Blocks another role or the current sprint milestone.
- **P2** — Important, should be done this sprint.
- **P3** — Backlog.
