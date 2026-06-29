# DEFINITION_OF_DONE.md
## EBFMS — Definition of Done

> Owner: Project Manager + System Architect
> Referenced by: All roles, CURRENT_SPRINT.md, PR template.

A task is DONE when **every** item in the applicable checklist is checked.
Partial completion is IN PROGRESS, not DONE.

---

## 1. Backend Module (all five files implemented)

- [ ] `<module>.schema.ts` — Zod validation schemas for all request bodies.
- [ ] `<module>.dto.ts` — TypeScript interfaces for request and response.
- [ ] `<module>.service.ts` — Business logic, DB access, event emission.
- [ ] `<module>.controller.ts` — Thin HTTP layer; all wrapped in `asyncHandler`.
- [ ] `<module>.routes.ts` — Router registered, all routes have `authenticate`
      + `authorize` (or are on the public-route exemption list).
- [ ] All monetary arithmetic uses `decimal.ts` — no native `number`.
- [ ] All queries on business entities include `deletedAt: null` filter.
- [ ] All Create/Update/Delete/Approve/Reject/Allocate operations emit an
      audit log entry.
- [ ] Cross-module side effects go through `eventBus.ts`, not direct imports.
- [ ] Unit tests pass; service coverage ≥ 80%.
- [ ] Integration tests cover: 200/201 happy path, 400 validation error,
      401 unauthenticated, 403 wrong role, 404 not found, 422 business rule
      violation.
- [ ] `npm run lint` — zero warnings.
- [ ] `npm run type-check` — zero errors.
- [ ] Router registered in `backend/src/app.ts`.
- [ ] `README.md` Module Roadmap updated to ✅ Complete.
- [ ] Code Reviewer approved.
- [ ] Security Engineer approved (if auth/RBAC-adjacent).
- [ ] QA Engineer sign-off recorded in sprint task.

---

## 2. Frontend Feature

- [ ] `types/` — TypeScript interfaces matching backend DTOs.
- [ ] `api/` — API functions using `httpClient.ts` only.
- [ ] `hooks/` — Custom hooks encapsulating data fetching and state.
- [ ] `components/` — Functional components; no inline styles; Tailwind only.
- [ ] `pages/` — Page-level component registered in `routes/index.tsx`.
- [ ] `index.ts` — Feature exported.
- [ ] Route guarded by correct role(s) from RBAC matrix.
- [ ] All currency values displayed via `formatMoney()`.
- [ ] All date values displayed via `formatDate()`.
- [ ] Loading, error, and empty states handled in all pages.
- [ ] `npm run lint` — zero warnings.
- [ ] `npm run type-check` — zero errors.
- [ ] `npm run build` — zero errors or warnings.
- [ ] Code Reviewer approved.

---

## 3. Database Schema Change

- [ ] `DECISION_REGISTER.md` entry exists at status "Accepted" — written
      before the migration was created.
- [ ] `schema.prisma` updated with correct conventions (UUID PK,
      Decimal(15,2), deletedAt, audit columns, Restrict FK behaviour).
- [ ] Migration file generated and committed (not hand-edited).
- [ ] Post-schema SQL constraints (CHECK, partial indexes) added to a
      migration SQL file if Prisma can't express them natively.
- [ ] `seed.ts` updated if new reference data is required; seed is idempotent.
- [ ] `npm run db:reset` succeeds from a clean state.
- [ ] Database Engineer sign-off.
- [ ] System Architect sign-off.
- [ ] No immutable ADR (ADR-002, ADR-004, ADR-005) violated.

---

## 4. PR / Release Readiness

- [ ] All items in the applicable module checklist above are complete.
- [ ] CI is green: lint, type-check, test, coverage.
- [ ] PR description follows the template in `GIT_WORKFLOW.md`.
- [ ] Linked task ID in PR description.
- [ ] `CHANGELOG.md` updated (by Documentation Engineer after merge).
- [ ] All new environment variables added to `.env.example`.
- [ ] No secret or credential in any committed file.

---

## 5. Sprint / Milestone Done

A sprint milestone is DONE when:
- [ ] All tasks in `CURRENT_SPRINT.md` are marked Complete.
- [ ] All PRs merged to `main`.
- [ ] CI green on `main`.
- [ ] `README.md` Module Roadmap reflects completed milestones.
- [ ] `PROJECT_STATUS.md` updated.
- [ ] `CHANGELOG.md` updated.
- [ ] Performance Engineer has reviewed the milestone's modules.
- [ ] Documentation Engineer has completed a documentation pass.
