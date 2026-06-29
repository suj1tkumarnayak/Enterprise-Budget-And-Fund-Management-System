# lessons-learned.md
## EBFMS Team-Wide Lessons Learned

> Maintained by: Documentation Engineer
> Source: Harvested from all role `learning.md` and `mistakes.md` files.
> Updated: After each milestone completes.
> Append new entries — never delete.

---

## How to Add an Entry

```
### [DATE] — [Module / Area] — [Short Title]

**Source Role:** [Which role encountered this]
**Lesson:** [What was learned]
**Impact if Ignored:** [What goes wrong without this knowledge]
**Applied To:** [Where this lesson is now reflected — checklist, ADR, template, etc.]
```

---

## Entries

### Project Inception — Financial Precision

**Source Role:** System Architect / Database Engineer
**Lesson:** JavaScript's `number` type introduces floating-point rounding errors
for financial arithmetic. `0.1 + 0.2 !== 0.3` in IEEE 754. For a financial
system this is not acceptable.
**Impact if Ignored:** Incorrect balance calculations, rounding errors in reports,
potential regulatory/compliance issues.
**Applied To:** ADR-005; `PROJECT_RULES.md` Rule 7; `decimal.ts` utility;
Code Review Checklist item; `CODING_STANDARD.md` Section 2.

---

### Project Inception — Audit Trail Integrity

**Source Role:** System Architect
**Lesson:** Financial records must never be hard-deleted. Even "test" or "mistake"
records need to be preserved for audit trails. Reversals, not deletions, are the
correct mechanism.
**Impact if Ignored:** Broken audit trails, inability to reconcile ledgers,
potential compliance violations.
**Applied To:** ADR-003 (soft delete); ADR-004 (append-only ledger);
`PROJECT_RULES.md` Rule 11.

---

### Project Inception — Polymorphic Approval Engine

**Source Role:** System Architect
**Lesson:** Building separate approval systems for Budget Requests and Expenses
doubles the code and guarantees inconsistent behaviour over time. A single
polymorphic engine is harder to build initially but pays dividends across every
subsequent module that needs approvals.
**Impact if Ignored:** Code duplication, diverging approval behaviour,
two codepaths to maintain.
**Applied To:** ADR-002; `ARCHITECTURE.md` Section 5.

---

### Project Inception — Context Window is Not Memory

**Source Role:** Project Manager
**Lesson:** Each Claude instance starts with zero memory of prior sessions.
If a decision, task state, or architectural choice is not committed to GitHub,
it does not exist for the next Claude. This is the foundational constraint of
the AI-DOS system.
**Impact if Ignored:** Repeated decisions, contradictory choices, lost work,
context that exists only in one Claude's context window and vanishes.
**Applied To:** `BOOTSTRAP.md`; `PROJECT_RULES.md` Rule 1; all `handoff.md`
and `daily_log.md` practices.
