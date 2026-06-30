# pending.md — Security Engineer Task Queue

> Owner: Security Engineer
> Updated: 2026-06-30 — TASK-017 (M2 auth security review) completed: CONDITIONAL PASS.

---

## IN PROGRESS

| Task ID | Description | Priority | Started | Branch |
| ------- | ----------- | -------- | ------- | ------ |
| —       | —           | —        | —       | —      |

---

## PENDING

| Task ID | Description                                                                                                                                                                                            | Priority | Assigned By | Notes                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------- | ----------------------------------------------------------------- |
| SEC-001 | Re-review auth module once Backend Engineer fixes the `'SystemAlert' as never` audit-action bug (see review §8) — confirm lockout/refresh-reuse events actually persist to `audit_logs` after the fix. | P1       | Self        | Blocked on Backend Engineer's fix landing first.                  |
| SEC-002 | Re-review once System Architect updates `ARCHITECTURE.md` §4.3 to list all 5 public auth routes (see review §2) — confirm doc now matches `auth.routes.ts`.                                            | P3       | Self        | Doc-only; not a vuln, just needs verifying the correction landed. |
| SEC-003 | Rate limiting on `/auth/*` — review whatever Backend/DevOps Engineer implements once Redis-backed rate limiting is built (standing gap, review §9).                                                    | P2       | Self        | No implementation exists yet to review.                           |

---

## BLOCKED

| Task ID | Description | Blocked By | Escalated To | Date Blocked |
| ------- | ----------- | ---------- | ------------ | ------------ |
| —       | —           | —          | —            | —            |

---

## DONE (this sprint)

| Task ID  | Description                                                   | Completed  | PR / Commit                                                                                             |
| -------- | ------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------- |
| TASK-017 | Security review sign-off on M2 auth module — CONDITIONAL PASS | 2026-06-30 | `/mnt/user-data/outputs/ai-team/management/roles/Security Engineer/security-review-M2-auth-TASK-017.md` |

---

## Priority Legend

- **P1** — Blocks another role or the current sprint milestone.
- **P2** — Important, should be done this sprint.
- **P3** — Backlog.
