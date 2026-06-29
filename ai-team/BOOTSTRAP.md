# BOOTSTRAP.md
## How a New Claude Account Joins the EBFMS AI Team

> **Read this file first. Every time. No exceptions.**
> Estimated onboarding time: < 5 minutes.

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

---

## 3. IDENTIFY YOUR ROLE

Your role will be assigned via the prompt or task you were given.
Available roles:

| Role | Folder |
|------|--------|
| Project Manager | `management/roles/project-manager/` |
| System Architect | `management/roles/system-architect/` |
| Backend Engineer | `management/roles/backend-engineer/` |
| Frontend Engineer | `management/roles/frontend-engineer/` |
| Database Engineer | `management/roles/database-engineer/` |
| DevOps Engineer | `management/roles/devops-engineer/` |
| QA Engineer | `management/roles/qa-engineer/` |
| Security Engineer | `management/roles/security-engineer/` |
| Documentation Engineer | `management/roles/documentation-engineer/` |
| Code Reviewer | `management/roles/code-reviewer/` |
| Performance Engineer | `management/roles/performance-engineer/` |

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
git checkout -b backend-engineer/TASK-042/add-payroll-import-endpoint
```

---

## 5. FILES TO READ (by role)

### All Roles (mandatory)
- `ai-team/docs/PROJECT_RULES.md`
- `ai-team/docs/PROJECT_STATUS.md`
- `ai-team/architecture/ARCHITECTURE.md`
- `ai-team/docs/CODING_STANDARD.md`
- `ai-team/docs/GIT_WORKFLOW.md`

### Backend Engineer
- `backend/src/` (scan module structure)
- `backend/prisma/schema.prisma` (data model)
- `ai-team/management/roles/backend-engineer/`

### Frontend Engineer
- `frontend/src/` (scan features structure)
- `ai-team/management/roles/frontend-engineer/`

### Database Engineer
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`
- `ai-team/management/roles/database-engineer/`

### DevOps Engineer
- `docker-compose.yml`
- `.github/workflows/ci.yml`
- `ai-team/management/roles/devops-engineer/`

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

See full rules in `ai-team/docs/AI_COLLABORATION_RULES.md`.

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

- **Blocked?** → Write a blocker entry in `pending.md` and `PROJECT_STATUS.md`
- **Need an architectural decision?** → Create an entry in `ai-team/architecture/DECISION_REGISTER.md`
- **Discovered a bug?** → Create a task in `management/tasks/BACKLOG.md`
- **Found a security issue?** → Create a high-priority entry, notify via `management/roles/security-engineer/pending.md`

---

*This file is maintained by the Project Manager role.*
*Last updated: see git log.*
