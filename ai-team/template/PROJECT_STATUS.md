# PROJECT_STATUS.md

## EBFMS — Project Status

> Owner: Project Manager
> Updated: After every sprint and when milestone status changes.
> Purpose: Any stakeholder (human or AI) reads this in under 2 minutes and
> knows exactly where the project stands.

---

## Executive Summary

| Field             | Value                                                 |
| ----------------- | ----------------------------------------------------- |
| Project           | Enterprise Budget & Fund Management System (EBFMS)    |
| Overall Status    | 🟡 In Progress — Foundation phase                     |
| Current Milestone | M1 — Foundation                                       |
| Target v1.0       | See Development Roadmap (architecture doc Section 12) |
| Last Updated      | 2026-06-30                                            |

---

## Milestone Status

| Milestone | Description                                     | Status         | Est. Duration | Start | Complete |
| --------- | ----------------------------------------------- | -------------- | ------------- | ----- | -------- |
| M1        | Foundation — scaffold, CI, schema, Docker       | 🔄 In Progress | 1–2 weeks     | —     | —        |
| M2        | Authentication — JWT, refresh rotation, lockout | ⏳ Not Started | 2 weeks       | —     | —        |
| M3        | User & Role Management                          | ⏳ Not Started | 2 weeks       | —     | —        |
| M4        | Departments & Org Structure                     | ⏳ Not Started | 1–1.5 weeks   | —     | —        |
| M5        | Projects & Teams                                | ⏳ Not Started | 2 weeks       | —     | —        |
| M6        | Budget Requests                                 | ⏳ Not Started | 1.5–2 weeks   | —     | —        |
| M7        | Approval Engine (highest complexity)            | ⏳ Not Started | 3–4 weeks     | —     | —        |
| M8        | Fund Allocation                                 | ⏳ Not Started | 2–3 weeks     | —     | —        |
| M9        | Expense Management                              | ⏳ Not Started | 2.5–3 weeks   | —     | —        |
| M10       | Notifications                                   | ⏳ Not Started | 1.5–2 weeks   | —     | —        |
| M11       | Audit Logging                                   | ⏳ Not Started | 1.5–2 weeks   | —     | —        |
| M12       | Payroll Integration                             | ⏳ Not Started | 2 weeks       | —     | —        |
| M13       | Reports                                         | ⏳ Not Started | 2–2.5 weeks   | —     | —        |
| M14       | Analytics Dashboard                             | ⏳ Not Started | 2 weeks       | —     | —        |
| M15       | Search                                          | ⏳ Not Started | 1–1.5 weeks   | —     | —        |
| M16       | Settings & Admin Config                         | ⏳ Not Started | 1 week        | —     | —        |
| M17       | Security Hardening                              | ⏳ Not Started | 2–3 weeks     | —     | —        |
| M18       | UAT & Deployment                                | ⏳ Not Started | 2 weeks       | —     | —        |

---

## Current Sprint Focus

**Sprint 1 — M1 Foundation**

Active tasks: See `CURRENT_SPRINT.md` for full detail.

Key progress:

- ai-team documentation framework: ✅ Complete
- Docker Compose setup: ✅ Present (`docker-compose.yml` — postgres, postgres_test, redis, backend, frontend)
- Prisma schema baseline: ✅ Present (`schema.prisma` — all 24 models, all ARCHITECTURE.md §6.3 indexes verified)
- Backend scaffold: ✅ Present (app.ts, common/ middleware, error handling, config validation, all 15 module skeletons as `export {}` placeholders awaiting their milestone)
- Frontend scaffold: ✅ Present (Vite + React 18 + TS + Tailwind, httpClient.ts, store/routes skeletons)
- CI pipeline: ✅ Present (`.github/workflows/ci.yml` — lint, type-check, format, migrate, test:coverage, build)
- System Architect architecture audit (this session): ✅ Complete — see findings below

---

## Active Blockers

| Blocker                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Affects                                                                                                                                                                               | Owner                                                                                            | Since                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `backend/jest.config.ts` uses the invalid key `coverageThresholds` (plural). Jest does not recognize this key — confirmed via `npx jest --showConfig`, which reports "Unknown option... Did you mean \"coverageThreshold\"?" As a result, **no coverage threshold is currently enforced**, despite every process doc (PROJECT_RULES.md, CODING_STANDARD.md, DEFINITION_OF_DONE.md, every role.md) stating 80% coverage is enforced via this file. `npm run test:coverage` and the matching CI step currently pass regardless of actual coverage. | All milestones from M2 onward — any module currently being marked "Definition of Done" complete on the basis of `test:coverage` passing is not actually verified against the 80% bar. | DevOps Engineer (owns `jest.config.ts` tooling) / QA Engineer (relies on this gate for sign-off) | 2026-06-30 (found during System Architect audit; root cause is a one-character pluralization typo, not a design flaw) |

**Recommended immediate action**: rename `coverageThresholds` → `coverageThreshold` in `backend/jest.config.ts` (see reference fix left by System Architect) and re-run `npm run test:coverage` on any module currently marked complete to confirm it actually clears 80%, since this has never been true-tested.

---

## Risks

| Risk                                                                      | Likelihood            | Impact      | Mitigation                                                                                                               |
| ------------------------------------------------------------------------- | --------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| M7 Approval Engine complexity exceeds estimate                            | Medium                | High        | Start early; break into sub-tasks; architect review at each sub-task                                                     |
| Prisma schema changes mid-project require migration cascades              | Low-Medium            | Medium      | Freeze schema early per milestone; ADR process enforces discipline                                                       |
| AI context loss between sessions                                          | High                  | Medium      | Mitigated by ai-team documentation framework (this system)                                                               |
| Silent CI gate failure (see Active Blockers) masking under-tested modules | Medium (now realized) | Medium-High | Fix `jest.config.ts` key immediately; re-verify coverage on any module already marked done before trusting its 80% claim |
