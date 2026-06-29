-- ============================================================================
-- Post-schema constraints that Prisma cannot express natively.
-- Run after `prisma migrate dev` generates the initial migration.
-- ============================================================================

-- ── CHECK constraints on monetary amounts ────────────────────────────────────

ALTER TABLE budget_requests
  ADD CONSTRAINT budget_requests_amount_positive CHECK (amount > 0);

ALTER TABLE fund_allocations
  ADD CONSTRAINT fund_allocations_amount_positive CHECK (amount > 0);

ALTER TABLE expenses
  ADD CONSTRAINT expenses_amount_positive CHECK (amount > 0);

ALTER TABLE departments
  ADD CONSTRAINT departments_budget_ceiling_non_negative CHECK (budget_ceiling >= 0);

ALTER TABLE project_department_funding
  ADD CONSTRAINT pdf_funding_share_range CHECK (funding_share > 0 AND funding_share <= 100);

ALTER TABLE allocation_ledger_entries
  ADD CONSTRAINT ledger_amount_positive CHECK (amount > 0);

ALTER TABLE payroll_cost_entries
  ADD CONSTRAINT payroll_gross_amount_positive CHECK (gross_amount > 0);

-- ── CHECK: project end_date must be after start_date ─────────────────────────

ALTER TABLE projects
  ADD CONSTRAINT projects_end_after_start CHECK (end_date IS NULL OR end_date > start_date);

-- ── Partial index: active users only — speeds /auth/login lookup ──────────────

CREATE UNIQUE INDEX users_email_active_uidx
  ON users (email)
  WHERE deleted_at IS NULL;

-- ── Partial index: unrevoked refresh tokens per user ─────────────────────────

CREATE INDEX refresh_tokens_active_idx
  ON refresh_tokens (user_id)
  WHERE revoked_at IS NULL;

-- ── Partial index: unused password reset tokens ──────────────────────────────

CREATE INDEX password_reset_tokens_unused_idx
  ON password_reset_tokens (token_hash)
  WHERE used_at IS NULL;

-- ── GIN index for JSONB forensic search on audit_logs ────────────────────────
-- (Section 6.3 — only enable if JSONB querying is required; has a write cost)

-- CREATE INDEX audit_logs_before_state_gin ON audit_logs USING GIN (before_state);
-- CREATE INDEX audit_logs_after_state_gin  ON audit_logs USING GIN (after_state);

-- ── Append-only enforcement: revoke UPDATE/DELETE on audit_logs from app role ─
-- Replace 'ebfms_app' with your actual application DB role name.

-- REVOKE UPDATE, DELETE ON audit_logs FROM ebfms_app;

-- ── Monthly range partitioning (audit_logs) ───────────────────────────────────
-- NOTE: Partitioning requires converting audit_logs to a partitioned table.
-- This is a significant schema operation best handled as a separate migration
-- once the table accumulates meaningful data. Placeholder left here for clarity.
-- The table is designed to be partition-ready (createdAt is in the schema).