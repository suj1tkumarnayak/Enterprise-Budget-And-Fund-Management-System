# CURRENT_SPRINT.md
## EBFMS — Current Sprint

> Owner: Project Manager
> Updated: At the start and end of every PM session, and whenever a task status changes.
> This file is the single source of truth for what is being worked on RIGHT NOW.

---

## Sprint Info

| Field | Value |
|-------|-------|
| Sprint # | 1 |
| Milestone | M1 — Foundation |
| Start Date | YYYY-MM-DD |
| Target End | YYYY-MM-DD |
| Status | 🔄 In Progress |

---

## Sprint Goal

[One or two sentences describing what "done" looks like for this sprint.]

E.g., "M1 Foundation complete: Docker Compose running, CI pipeline green, Prisma schema
baseline applied, seed data loading cleanly."

---

## Tasks

| Task ID | Description | Owner Role | Priority | Status | Branch | Notes |
|---------|-------------|------------|----------|--------|--------|-------|
| TASK-001 | Initialise Docker Compose (postgres, backend, frontend) | DevOps Engineer | P1 | ⏳ Not Started | — | Prerequisite for all other tasks |
| TASK-002 | Set up GitHub Actions CI pipeline (lint, type-check, test) | DevOps Engineer | P1 | ⏳ Not Started | — | Depends on TASK-001 |
| TASK-003 | Baseline Prisma schema — all tables per architecture doc Section 6 | Database Engineer | P1 | ⏳ Not Started | — | Requires ADR for any deviation |
| TASK-004 | Seed data — roles, default settings, test users | Database Engineer | P2 | ⏳ Not Started | — | Depends on TASK-003 |
| TASK-005 | Backend project scaffold — folder structure, common middleware, app.ts | Backend Engineer | P1 | ⏳ Not Started | — | Depends on TASK-001 |
| TASK-006 | Frontend project scaffold — Vite + React + Tailwind, httpClient | Frontend Engineer | P1 | ⏳ Not Started | — | Independent |
| TASK-007 | BOOTSTRAP.md and ai-team docs initial setup | Documentation Engineer | P2 | ✅ Complete | — | This file system |

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ⏳ | Not started |
| 🔄 | In progress |
| 🚫 | Blocked |
| 👀 | In review (PR open) |
| ✅ | Complete (merged) |

---

## Blocked Tasks

| Task ID | Blocked By | Owner | Action Required |
|---------|------------|-------|-----------------|
| — | — | — | — |

---

## Completed This Sprint

| Task ID | Description | Completed Date | PR |
|---------|-------------|----------------|----|
| TASK-007 | ai-team documentation framework | YYYY-MM-DD | — |

---

## Notes for Next PM Session

[What the next Project Manager Claude should pick up immediately.]
