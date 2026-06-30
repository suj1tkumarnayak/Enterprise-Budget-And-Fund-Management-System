# handoff.md — QA Engineer

## Handoff — 2026-06-30 UTC

### Role

QA Engineer

### Session Summary

Read the repo state (auth module fully implemented per Backend Engineer's
Session 2; `jest.config.ts` coverage gate genuinely fixed per AUDIT-002-BE;
TASK-016 was the only item blocking M2 besides Security sign-off). Wrote
the auth integration test suite that was missing, closing out QA's portion
of M2.

---

### Completed This Session

- `backend/tests/integration/auth.test.ts` — full integration coverage of
  all 5 auth endpoints (`/login`, `/refresh`, `/logout`,
  `/forgot-password`, `/reset-password`) against the real Express stack
  (routing → Zod validation middleware → controller → service →
  errorHandler), with Prisma/argon2/jwt/eventBus mocked at the module
  boundary (no live test DB available in this sandbox session).
  - login: 200 happy path, 400 malformed email, 400 missing password,
    401 unknown email (no enumeration), 401 wrong password, 403
    deactivated account, 403 locked account, stack-trace-leak check.
  - refresh: 200 rotation, 400 missing token, 401 unknown/expired token,
    401 + token-family revocation on reuse.
  - logout: 200 active token revoked, 200 idempotent on unknown token,
    400 missing token.
  - forgot-password: 200 known email (token created), 200 unknown email
    (no enumeration, no token created), 400 malformed email.
  - reset-password: 200 happy path (hash + transaction + session
    revocation), 400 invalid/expired/used token (see Bug Filed below),
    400 short password, 400 missing token.
  - Cross-cutting: confirmed none of the 5 endpoints depend on an
    `authenticate` middleware rejection, consistent with the
    `ARCHITECTURE.md` §4.3 public-route exemption list.

---

### Current State

| Field               | Value                                                            |
| ------------------- | ---------------------------------------------------------------- |
| Branch              | `qa-engineer/TASK-016/auth-integration-tests`                    |
| Files created       | `backend/tests/integration/auth.test.ts`                         |
| CI status           | Not run in this sandbox — no live Postgres test DB attached      |
| M2 status (QA)      | ✅ Complete (test suite written; coverage run still outstanding) |
| M2 status (overall) | 🔄 Blocked only on TASK-017 (Security Engineer sign-off)         |

---

### Next Steps (for the incoming QA Engineer — be precise)

1. Run `npm run test:coverage` against a real Postgres instance (via
   `docker compose up -d postgres_test` per `docker-compose.yml`) to
   confirm `auth.test.ts` actually executes green and that the combined
   unit (`auth.service.test.ts`) + integration suite clears 80% on
   `auth.service.ts` now that the coverage gate is genuinely enforced.
2. Resolve the 400-vs-422 question on `resetPassword`'s invalid-token
   path (see Bug Filed below) with Backend Engineer / System Architect —
   confirm intentional, then either update `CODING_STANDARD.md` §4's
   422 framing or have Backend Engineer switch the thrown error type.
3. Do not write `tests/unit/` content for `auth.service.ts` — that's
   Backend Engineer-authored (already done, `TASK-015`); QA's unit-test
   ownership is cross-cutting/regression only, per `role.md`.

---

### Blockers / Decisions Needed

| Blocker                                    | Owner                                  | Notes                                                                                                                                 |
| ------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| No live test database in this session      | DevOps / whoever runs this branch next | Could not execute the suite for real; logic was verified by hand against `auth.service.ts` and `auth.routes.ts` line-by-line instead. |
| 400 vs 422 on invalid reset-password token | Backend Engineer / System Architect    | See "Bug filed this session" in `pending.md`.                                                                                         |

---

### Context That Doesn't Exist in Code

- The test suite intentionally mocks Prisma/argon2/jwt/eventBus rather
  than hitting a real DB, mirroring `auth.service.test.ts`'s pattern —
  this is a pragmatic choice for a sandbox without DB access, not a
  statement that integration tests should always be mocked. The next
  QA session with real DB access should consider adding a second,
  DB-backed integration suite (or converting this one) for full
  end-to-end confidence, since mocked-Prisma integration tests still
  don't catch real Prisma query/schema mismatches.

---

### Files the Incoming Claude Should Read First

1. `backend/tests/integration/auth.test.ts` — the new suite.
2. `ai-team/management/roles/Security Engineer/pending.md` /
   `handoff.md` — check TASK-017 status; that's the only remaining M2
   blocker.
3. `backend/jest.config.ts` — confirm coverage gate is still correctly
   spelled (`coverageThreshold`, singular) before trusting any run.
