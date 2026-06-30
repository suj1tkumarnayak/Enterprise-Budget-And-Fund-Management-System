# pending.md — Frontend Engineer Task Queue

> Owner: Frontend Engineer
> Updated: 2026-06-30 — Session 1 (M1 completion + M2 prep)

---

## IN PROGRESS

| Task ID | Description | Priority | Started | Branch |
| ------- | ----------- | -------- | ------- | ------ |
| —       | —           | —        | —       | —      |

---

## PENDING (not yet started)

| Task ID     | Description                                                                                  | Priority | Assigned By     | Notes                                                                              |
| ----------- | -------------------------------------------------------------------------------------------- | -------- | --------------- | ---------------------------------------------------------------------------------- |
| TASK-018    | Login page, forgot-password flow, token storage via httpClient interceptor                   | P1       | Project Manager | Blocked until TASK-011 (auth routes) is live; mock available in features/auth/api/ |
| TASK-FE-001 | Wire active-route highlighting in AppShell sidebar using React Router `useMatch`             | P2       | Self            | Needs auth Zustand slice (M2) to show user info in sidebar footer                  |
| TASK-FE-002 | Add `ProtectedRoute` component to routes/index.tsx — redirect to /login if not authenticated | P1       | Self            | Implement in M2 alongside TASK-018                                                 |
| TASK-FE-003 | Add notification bell badge count in AppShell top bar — wired to notifications feature       | P3       | Self            | M10 milestone                                                                      |

---

## BLOCKED

| Task ID  | Description   | Blocked By                                         | Escalated To                | Date Blocked |
| -------- | ------------- | -------------------------------------------------- | --------------------------- | ------------ |
| TASK-018 | Login page UI | Backend auth routes (TASK-011) not yet implemented | Backend Engineer pending.md | 2026-06-30   |

---

## DONE (this sprint)

| Task ID        | Description                                                                                                     | Completed  | PR / Commit |
| -------------- | --------------------------------------------------------------------------------------------------------------- | ---------- | ----------- |
| TASK-007       | Frontend scaffold: Vite + React + TS + Tailwind, httpClient, store skeleton, routes skeleton                    | 2026-06-30 | —           |
| TASK-FE-M1-001 | Add missing `formatMoney()` export to `utils/currency.ts` (role doc required it, only `formatCurrency` existed) | 2026-06-30 | —           |
| TASK-FE-M1-002 | Create common UI primitives: `LoadingSpinner`, `ErrorMessage`, `EmptyState`, `PageHeader`                       | 2026-06-30 | —           |
| TASK-FE-M1-003 | Create `AppShell` layout (sidebar + top bar) — static skeleton, wired for M2 auth                               | 2026-06-30 | —           |
| TASK-FE-M1-004 | Create `useAuthStore` Zustand slice with `setAuth`/`clearAuth` actions and selectors                            | 2026-06-30 | —           |
| TASK-FE-M1-005 | Create `useApiError` global hook for consistent API error message extraction                                    | 2026-06-30 | —           |
| TASK-FE-M1-006 | Update `routes/index.tsx` with AppShell, 404 handling, error boundary, all route stubs                          | 2026-06-30 | —           |
| TASK-FE-M1-007 | Update `store/index.ts` to export auth slice                                                                    | 2026-06-30 | —           |

---

## Priority Legend

- **P1** — Blocks another role or the current sprint milestone. Do this first.
- **P2** — Important, should be done this sprint.
- **P3** — Backlog; do after P1 and P2 are clear.
