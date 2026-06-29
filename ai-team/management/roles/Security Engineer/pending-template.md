# pending.md — Task Queue Template

> Copy this file to each role folder and remove this header.
> Owner: the role listed in the folder name.
> Updated: at the START and END of every work session.

---

## IN PROGRESS

| Task ID | Description | Priority | Started | Branch |
|---------|-------------|----------|---------|--------|
| TASK-XXX | Example in-progress task | P1 | YYYY-MM-DD HH:mm UTC | role/TASK-XXX/description |

---

## PENDING (not yet started)

| Task ID | Description | Priority | Assigned By | Notes |
|---------|-------------|----------|-------------|-------|
| TASK-YYY | Example pending task | P2 | Project Manager | Waiting on TASK-XXX to complete |

---

## BLOCKED

| Task ID | Description | Blocked By | Escalated To | Date Blocked |
|---------|-------------|------------|--------------|--------------|
| TASK-ZZZ | Example blocked task | Missing API endpoint | Backend Engineer | YYYY-MM-DD |

---

## DONE (this sprint)

| Task ID | Description | Completed | PR / Commit |
|---------|-------------|-----------|-------------|
| TASK-AAA | Example completed task | YYYY-MM-DD | PR #42 |

---

## Priority Legend

- **P1** — Blocks another role or the current sprint milestone. Do this first.
- **P2** — Important, should be done this sprint.
- **P3** — Backlog; do after P1 and P2 are clear.
