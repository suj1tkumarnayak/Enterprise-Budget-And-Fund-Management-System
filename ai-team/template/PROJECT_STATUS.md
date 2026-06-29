# PROJECT_STATUS.md
## EBFMS — Project Status

> Owner: Project Manager
> Updated: After every sprint and when milestone status changes.
> Purpose: Any stakeholder (human or AI) reads this in under 2 minutes and
>          knows exactly where the project stands.

---

## Executive Summary

| Field | Value |
|-------|-------|
| Project | Enterprise Budget & Fund Management System (EBFMS) |
| Overall Status | 🟡 In Progress — Foundation phase |
| Current Milestone | M1 — Foundation |
| Target v1.0 | See Development Roadmap (architecture doc Section 12) |
| Last Updated | YYYY-MM-DD |

---

## Milestone Status

| Milestone | Description | Status | Est. Duration | Start | Complete |
|-----------|-------------|--------|--------------|-------|---------|
| M1 | Foundation — scaffold, CI, schema, Docker | 🔄 In Progress | 1–2 weeks | — | — |
| M2 | Authentication — JWT, refresh rotation, lockout | ⏳ Not Started | 2 weeks | — | — |
| M3 | User & Role Management | ⏳ Not Started | 2 weeks | — | — |
| M4 | Departments & Org Structure | ⏳ Not Started | 1–1.5 weeks | — | — |
| M5 | Projects & Teams | ⏳ Not Started | 2 weeks | — | — |
| M6 | Budget Requests | ⏳ Not Started | 1.5–2 weeks | — | — |
| M7 | Approval Engine (highest complexity) | ⏳ Not Started | 3–4 weeks | — | — |
| M8 | Fund Allocation | ⏳ Not Started | 2–3 weeks | — | — |
| M9 | Expense Management | ⏳ Not Started | 2.5–3 weeks | — | — |
| M10 | Notifications | ⏳ Not Started | 1.5–2 weeks | — | — |
| M11 | Audit Logging | ⏳ Not Started | 1.5–2 weeks | — | — |
| M12 | Payroll Integration | ⏳ Not Started | 2 weeks | — | — |
| M13 | Reports | ⏳ Not Started | 2–2.5 weeks | — | — |
| M14 | Analytics Dashboard | ⏳ Not Started | 2 weeks | — | — |
| M15 | Search | ⏳ Not Started | 1–1.5 weeks | — | — |
| M16 | Settings & Admin Config | ⏳ Not Started | 1 week | — | — |
| M17 | Security Hardening | ⏳ Not Started | 2–3 weeks | — | — |
| M18 | UAT & Deployment | ⏳ Not Started | 2 weeks | — | — |

---

## Current Sprint Focus

**Sprint 1 — M1 Foundation**

Active tasks: See `CURRENT_SPRINT.md` for full detail.

Key progress:
- ai-team documentation framework: ✅ Complete
- Docker Compose setup: ⏳ Not started
- Prisma schema baseline: ⏳ Not started
- Backend scaffold: ⏳ Not started
- Frontend scaffold: ⏳ Not started
- CI pipeline: ⏳ Not started

---

## Active Blockers

| Blocker | Affects | Owner | Since |
|---------|---------|-------|-------|
| None | — | — | — |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| M7 Approval Engine complexity exceeds estimate | Medium | High | Start early; break into sub-tasks; architect review at each sub-task |
| Prisma schema changes mid-project require migration cascades | Low-Medium | Medium | Freeze schema early per milestone; ADR process enforces discipline |
| AI context loss between sessions | High | Medium | Mitigated by ai-team documentation framework (this system) |
