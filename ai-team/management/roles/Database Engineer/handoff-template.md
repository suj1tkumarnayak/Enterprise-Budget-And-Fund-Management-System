# handoff.md — Session Handoff Template

> Copy this file to each role folder and remove this header.
> Owner: the role listed in the folder name.
> MANDATORY: Updated before ending EVERY work session.
> A handoff that says only "continue the work" is not acceptable.

---

## Handoff — [DATE] [TIME UTC]

### Role
[Role name]

### Session Summary
[2–4 sentences describing what was accomplished this session.]

---

### Completed This Session

- [Specific thing finished — include PR # or commit hash]
- [Another specific thing]

---

### Current State

| Field | Value |
|-------|-------|
| Branch | `role/TASK-XXX/description` |
| Last commit | `abc1234` |
| CI status | ✅ Green / ❌ Red (reason: ...) |
| Files modified | List key files touched |

---

### Next Steps (for the incoming Claude — be precise)

1. Open `[exact file path]` and [exact action].
2. Run `[exact command]` to verify current state.
3. Then implement [specific next piece of work].

---

### Blockers / Decisions Needed

| Blocker | Owner | Notes |
|---------|-------|-------|
| [What is blocking] | [Which role should resolve it] | [Any context] |

---

### Context That Doesn't Exist in Code

- [Any assumption made that isn't obvious from the code or docs]
- [Any verbal/contextual decision that needs to be in a DECISION_REGISTER entry]
- [Edge cases discovered but not yet handled]

---

### Files the Incoming Claude Should Read First

1. `[path/to/file]` — [why]
2. `[path/to/file]` — [why]
