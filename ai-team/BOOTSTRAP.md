# BOOTSTRAP.md

## How a New Claude Account Joins the EBFMS AI Team

> **Read this file first. Every time. No exceptions.**
> Estimated onboarding time: < 5 minutes.
>
> **PM correction — 2026-06-30:** Section 3's role-folder table previously
> pointed every role at a lowercase-hyphenated path
> (`management/roles/backend-engineer/`). Audited against the actual
> repository this session: only 4 of 11 folders use that convention
> (`frontend-engineer`, `documentation-engineer`, `code-reviewer`,
> `performance-engineer`). The other 7 are Title Case with spaces
> (`Project Manager`, `System Architect`, `Backend Engineer`,
> `Database Engineer`, `DevOps Engineer`, `Security Engineer`,
> `QA Engineer`). Rather than rename 7 live folders (higher risk — other
> files may reference them by their current path), this document is
> corrected to match the real folders. See `RISK_REGISTER.md` RISK-02 and
> `DECISION_REGISTER.md` for the formal record if one is added.

---

## 1. WHAT IS THIS PROJECT?

**Enterprise Budget & Fund Management System (EBFMS)**
A full-stack financial management platform built on:

- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Infrastructure**: Docker + GitHub Actions
- **Auth**: JWT (access + refresh token rotation)

GitHub is the **only** source of truth. Nothing exists only in your context window.

---

## 2. MANDATORY READING ORDER (< 5 minutes)

Read these files in **exactly** this sequence before doing anything:

```
1.  ai-team/BOOTSTRAP.md                              ← YOU ARE HERE
2.  ai-team/docs/PROJECT_RULES.md                     ← Non-negotiable rules
3.  ai-team/docs/PROJECT_STATUS.md                    ← What is done / in progress
4.  ai-team/architecture/ARCHITECTURE.md              ← System design
5.  ai-team/docs/TECH_STACK.md                        ← Technology decisions
6.  ai-team/docs/CODING_STANDARD.md                   ← How code must be written
7.  ai-team/management/tasks/CURRENT_SPRINT.md        ← What needs doing NOW
8.  ai-team/management/roles/<YOUR-ROLE>/role.md      ← Your specific mission
9.  ai-team/management/roles/<YOUR-ROLE>/handoff.md   ← What was left for you
10. ai-team/management/roles/<YOUR-ROLE>/pending.md   ← Your task queue
```

**Do NOT skip or reorder.** These files eliminate the need to ask questions.

> `ai-team/docs/GIT_WORKFLOW.md` is referenced elsewhere as mandatory
> reading but does not yet exist in the repository (tracked as `TASK-P03`,
> owned by Documentation Engineer). Skip it until it exists — its absence
> is a known, tracked gap, not something you need to chase down.

---

## 3. IDENTIFY YOUR ROLE

Your role will be assigned via the prompt or task you were given.
Available roles — **folder names below are verified against the actual
repository, not assumed:**

| Role                   | Folder (exact, case-sensitive)             |
| ---------------------- | ------------------------------------------ |
| Project Manager        | `management/roles/Project Manager/`        |
| System Architect       | `management/roles/System Architect/`       |
| Backend Engineer       | `management/roles/Backend Engineer/`       |
| Frontend Engineer      | `management/roles/frontend-engineer/`      |
| Database Engineer      | `management/roles/Database Engineer/`      |
| DevOps Engineer        | `management/roles/DevOps Engineer/`        |
| QA Engineer            | `management/roles/QA Engineer/`            |
| Security Engineer      | `management/roles/Security Engineer/`      |
| Documentation Engineer | `management/roles/documentation-engineer/` |
| Code Reviewer          | `management/roles/code-reviewer/`          |
| Performance Engineer   | `management/roles/performance-engineer/`   |

If your assigned role's folder does not resolve, stop and log the
mismatch in `ai-team/management/tasks/CURRENT_SPRINT.md` under Blocked
Tasks rather than guessing or creating a duplicate folder.

---

## 4. INITIAL GIT COMMANDS

```bash
# Clone the repository
git clone https://github.com/<org>/ebfms.git
cd ebfms

# Always start from main
git checkout main
git pull origin main

# Create your working branch
# Format: <role>/<task-id>/<short-description>
git checkout -b backend-engineer/TASK-010/implement-auth-service
```

> Branch-name convention uses the lowercase-hyphenated role slug
> regardless of the folder's actual casing (e.g. branches are still
> `backend-engineer/...`, even though the folder is `Backend Engineer/`).
> This matches existing convention in `CODING_STANDARD.md` Section 5 and
> avoids spaces in branch names.

---

## 5. FILES TO READ (by role)

### All Roles (mandatory)

- `ai-team/docs/PROJECT_RULES.md`
- `ai-team/docs/PROJECT_STATUS.md`
- `ai-team/architecture/ARCHITECTURE.md`
- `ai-team/docs/CODING_STANDARD.md`
- `ai-team/docs/GIT_WORKFLOW.md` (once it exists — see note in Section 2)

### Backend Engineer

- `backend/src/` (scan module structure)
- `backend/prisma/schema.prisma` (data model)
- `ai-team/management/roles/Backend Engineer/`

### Frontend Engineer

- `frontend/src/` (scan features structure)
- `ai-team/management/roles/frontend-engineer/`

### Database Engineer

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`
- `ai-team/management/roles/Database Engineer/`

### DevOps Engineer

- `docker-compose.yml`
- `.github/workflows/ci.yml`
- `ai-team/management/roles/DevOps Engineer/`

---

## 6. FILES TO IGNORE

```
node_modules/
dist/
build/
.env
*.env.local
backend/prisma/migrations/*.sql   ← read-only, never edit manually
```

---

## 7. HOW TO START WORKING

```
Step 1: Read mandatory files (Section 2 above)
Step 2: Open your role's pending.md
Step 3: Pick the highest-priority unassigned task
Step 4: Update pending.md — mark task as IN_PROGRESS with timestamp
Step 5: Update daily_log.md — record what you are starting
Step 6: Create your feature branch
Step 7: Work
Step 8: Commit using the convention (see GIT_WORKFLOW.md)
```

---

## 8. HOW TO FINISH WORKING

Before ending your session, you MUST do all of the following:

```
☐  Update progress.md with percentage complete and blockers
☐  Update daily_log.md with what was accomplished
☐  Update handoff.md with exact state for the next Claude
☐  Update pending.md — move completed tasks to done, update in-progress
☐  If architectural decision was made → update decision_log.md
☐  If a mistake was made or lesson learned → update mistakes.md / learning.md
☐  Push your branch to origin
☐  Open a PR if work is complete (follow PR template)
```

**Never end a session without updating handoff.md.**

---

## 9. HOW TO PERFORM A HANDOFF

Edit `ai-team/management/roles/<YOUR-ROLE>/handoff.md` and fill in:

```markdown
## Handoff — [DATE] [TIME UTC]

### Completed This Session

- [What was finished]

### Current State

- Branch: [branch name]
- Last commit: [commit hash]
- Files modified: [list]

### Next Steps (for the incoming Claude)

1. [Exact action 1]
2. [Exact action 2]

### Blockers / Decisions Needed

- [Any blocking issues]

### Context That Doesn't Exist in Code

- [Any assumptions or reasoning not captured in code/docs]
```

---

## 10. COLLABORATION RULES (SUMMARY)

See full rules in `ai-team/docs/AI_COLLABORATION_RULES.md` (currently only
present at `ai-team/template/AI_COLLABORATION_RULES.md` — relocation
tracked as `TASK-P08`, Documentation Engineer).

Key rules:

- **Never modify** files owned by another role without approval
- **Never invent** API contracts — check the existing routes and DTOs
- **Never change** the Prisma schema without Database Engineer + Architect approval
- **Never delete** documentation
- **Always** read architecture before writing any code
- **Always** commit with the standard prefix (feat/fix/chore/etc.)
- **Always** update your role files at the end of every session

---

## 11. WHERE TO ASK FOR HELP

There is no chat. Communication is asynchronous through files.

- **Blocked?** → Write a blocker entry in `pending.md` and `ai-team/docs/PROJECT_STATUS.md`
- **Need an architectural decision?** → Create an entry in `ai-team/docs/DECISION_REGISTER.md`
- **Discovered a bug?** → Create a task in `ai-team/management/tasks/BACKLOG.md`
- **Found a security issue?** → Create a high-priority entry, notify via `management/roles/Security Engineer/pending.md`

---

_This file is maintained by the Project Manager role._
_Last updated: 2026-06-30 — role-folder table corrected against actual repository structure (see correction note at top)._
