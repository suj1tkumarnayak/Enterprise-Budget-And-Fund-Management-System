# AI_COLLABORATION_RULES.md
## EBFMS — AI Collaboration Rules

> These rules govern how Claude instances work together on this repository.
> Violation of these rules creates compounding problems for every subsequent Claude.
> Owner: Project Manager
> Referenced by: BOOTSTRAP.md Section 10

---

## Rule C-01 — GitHub Is the Only Long-Term Memory

A Claude's context window disappears when the session ends. GitHub does not.
Every decision, task state, assumption, and lesson must be committed to the
repository before the session ends. If it's not in GitHub, it doesn't exist
for the next Claude.

---

## Rule C-02 — Never Modify Another Role's Owned Files Without Approval

Each file has an owner defined in `ARCHITECTURE.md` Section 11.

- You may **read** any file.
- You may **not modify** files outside your ownership without explicit
  approval documented in `DECISION_REGISTER.md` (for architectural files)
  or the owning role's `pending.md` (for task-level cross-role edits).
- Emergency cross-role edits must be documented in the same commit.

---

## Rule C-03 — Never Invent API Contracts

If a frontend engineer needs an endpoint that doesn't exist, the correct
response is to create a task in the Backend Engineer's `pending.md` and
use a mock in the meantime — not to call a non-existent endpoint or assume
a request/response shape.

All API contracts exist in `backend/src/modules/<module>/<module>.dto.ts`
and `<module>.routes.ts`. These are the source of truth.

---

## Rule C-04 — Always Read Architecture Before Writing Code

Before starting any module or feature:
1. Read `ARCHITECTURE.md` for the relevant module.
2. Read the functional requirements for that module in the architecture `.docx`.
3. Read any existing sibling module for established patterns.

"I assumed the pattern" is not an acceptable reason for deviation.

---

## Rule C-05 — One Task Per Branch, One PR Per Task

Never bundle unrelated changes into a single branch or PR. This makes
code review harder, makes rollback impossible without losing multiple
changes, and makes the `CHANGELOG.md` inaccurate.

---

## Rule C-06 — Update Memory Files Before Ending Every Session

Before ending any session, every Claude must update:
- `progress.md` — overall completion status.
- `daily_log.md` — what was accomplished this session.
- `handoff.md` — exact state for the next Claude (specific, not vague).
- `pending.md` — tasks moved to done, in-progress tasks updated.

A `handoff.md` that says "continue working on the module" is a failed handoff.
Name the exact file, the exact line, the exact next action.

---

## Rule C-07 — Document Decisions, Even Small Ones

If you made a choice that isn't obvious from the code — a naming decision,
a business rule interpretation, a workaround for a Prisma quirk — write it
down. In `learning.md`, in a code comment, in `handoff.md`. The next Claude
will make a different choice if yours isn't documented.

For architectural decisions: create a `DECISION_REGISTER.md` entry.
For role-level decisions: document in `handoff.md` and `learning.md`.

---

## Rule C-08 — Never Delete Documentation

Outdated documentation must be **updated**, not deleted.
Deprecated sections must be marked `> ⚠️ DEPRECATED as of [DATE]` with the
reason and the superseding reference.

If a file is truly obsolete, move it to `ai-team/archive/` — never delete.

---

## Rule C-09 — Escalate Blockers, Don't Silently Stall

If you are blocked:
1. Document the blocker in `pending.md` with full context.
2. Log it in `PROJECT_STATUS.md` (or notify the Project Manager's `pending.md`).
3. If architectural: create a draft ADR entry in `DECISION_REGISTER.md` and
   flag the System Architect.
4. Move to a lower-priority task while the blocker resolves.

A session that ends with undocumented blockers causes the next Claude to
discover them the hard way.

---

## Rule C-10 — Security Reviews Are Non-Negotiable

No module touching authentication, authorization, RBAC, or file upload is
"done" without a Security Engineer sign-off. This is not bureaucracy — it's
because these are the highest blast-radius files in the codebase.

---

## Rule C-11 — Test Coverage Is Not Optional

The Definition of Done for any backend module includes ≥ 80% test coverage
on the service file. A PR without tests that meets coverage is a PR that has
not been finished, regardless of how clean the implementation is.

---

## Rule C-12 — Communicate Through Files, Not Assumptions

There is no real-time chat between Claude instances. Communication is
asynchronous and file-based:

| Need | Action |
|------|--------|
| Request work from another role | Add a task to their `pending.md` |
| Report a bug | Log it in the owning role's `pending.md` |
| Need an architectural decision | Draft an ADR entry, flag Architect's `pending.md` |
| Report a blocker | Log in own `pending.md` + `PROJECT_STATUS.md` |
| Share a lesson | Write in own `learning.md` |

Never assume another Claude will "just know" something. Write it down.
