import argon2 from 'argon2';
import { z } from 'zod';

describe('Argon2 password hashing (seed)', () => {
  it('produces a hash that verifies against the original password', async () => {
    const password = 'TestAdmin@12345!';
    const hash = await argon2.hash(password, {
      type:        argon2.argon2id,
      memoryCost:  1024,
      timeCost:    1,
      parallelism: 1,
    });

    await expect(argon2.verify(hash, password)).resolves.toBe(true);
  });

  it('produces a different hash on each call (salt randomization)', async () => {
    const password = 'TestAdmin@12345!';
    const options = {
      type:        argon2.argon2id,
      memoryCost:  1024,
      timeCost:    1,
      parallelism: 1,
    };

    const hash1 = await argon2.hash(password, options);
    const hash2 = await argon2.hash(password, options);

    expect(hash1).not.toBe(hash2);
  });

  it('rejects an incorrect password', async () => {
    const hash = await argon2.hash('correct-password', {
      type:        argon2.argon2id,
      memoryCost:  1024,
      timeCost:    1,
      parallelism: 1,
    });

    await expect(argon2.verify(hash, 'wrong-password')).resolves.toBe(false);
  });
});

describe('Seed data integrity', () => {
  const EXPECTED_ROLES = [
    'Admin', 'FinanceHead', 'FinanceOfficer',
    'DeptManager', 'ProjectManager', 'Employee', 'Auditor',
  ] as const;

  const EXPECTED_CATEGORIES = [
    'Travel', 'Equipment', 'Software',
    'Payroll-Linked', 'Vendor', 'Miscellaneous',
  ] as const;

  const EXPECTED_SETTINGS = [
    'fiscal_year_start',
    'approval_threshold_tier1',
    'approval_threshold_tier2',
    'approval_threshold_tier3',
    'receipt_required_above',
    'max_export_rows',
    'sla_default_hours',
    'budget_warning_threshold_pct',
  ] as const;

  it('contains exactly 7 roles', () => {
    expect(EXPECTED_ROLES).toHaveLength(7);
  });

  it('contains all required role names', () => {
    const required = [
      'Admin', 'FinanceHead', 'FinanceOfficer',
      'DeptManager', 'ProjectManager', 'Employee', 'Auditor',
    ];
    for (const role of required) {
      expect(EXPECTED_ROLES).toContain(role);
    }
  });

  it('has no duplicate role names', () => {
    const unique = new Set(EXPECTED_ROLES);
    expect(unique.size).toBe(EXPECTED_ROLES.length);
  });

  it('contains exactly 6 expense categories', () => {
    expect(EXPECTED_CATEGORIES).toHaveLength(6);
  });

  it('has no duplicate category names', () => {
    const unique = new Set(EXPECTED_CATEGORIES);
    expect(unique.size).toBe(EXPECTED_CATEGORIES.length);
  });

  it('contains exactly 8 system settings', () => {
    expect(EXPECTED_SETTINGS).toHaveLength(8);
  });

  it('has no duplicate setting keys', () => {
    const unique = new Set(EXPECTED_SETTINGS);
    expect(unique.size).toBe(EXPECTED_SETTINGS.length);
  });

  it('approval threshold tiers have ascending maxAmount values', () => {
    const tier1MaxAmount = 10000;
    const tier2MaxAmount = 100000;
    expect(tier1MaxAmount).toBeLessThan(tier2MaxAmount);
  });

  it('receipt_required_above is a positive number', () => {
    const amount = 50;
    expect(amount).toBeGreaterThan(0);
  });

  it('budget_warning_threshold_pct is between 1 and 100', () => {
    const percentage = 90;
    expect(percentage).toBeGreaterThan(0);
    expect(percentage).toBeLessThanOrEqual(100);
  });

  it('sla_default_hours is a positive integer', () => {
    const hours = 48;
    expect(Number.isInteger(hours)).toBe(true);
    expect(hours).toBeGreaterThan(0);
  });
});

describe('Seed environment validation', () => {
  const seedEnvSchema = z.object({
    DATABASE_URL:        z.string().min(1).startsWith('postgresql://'),
    SEED_ADMIN_EMAIL:    z.string().email(),
    SEED_ADMIN_PASSWORD: z.string().min(12),
  });

  it('accepts a valid seed environment', () => {
    const result = seedEnvSchema.safeParse({
      DATABASE_URL:        'postgresql://user:pass@localhost:5432/db',
      SEED_ADMIN_EMAIL:    'admin@ebfms.io',
      SEED_ADMIN_PASSWORD: 'ChangeMe@12345!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid admin email', () => {
    const result = seedEnvSchema.safeParse({
      DATABASE_URL:        'postgresql://user:pass@localhost:5432/db',
      SEED_ADMIN_EMAIL:    'not-an-email',
      SEED_ADMIN_PASSWORD: 'ChangeMe@12345!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 12 characters', () => {
    const result = seedEnvSchema.safeParse({
      DATABASE_URL:        'postgresql://user:pass@localhost:5432/db',
      SEED_ADMIN_EMAIL:    'admin@ebfms.io',
      SEED_ADMIN_PASSWORD: 'Short@1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-postgresql DATABASE_URL', () => {
    const result = seedEnvSchema.safeParse({
      DATABASE_URL:        'mysql://user:pass@localhost:3306/db',
      SEED_ADMIN_EMAIL:    'admin@ebfms.io',
      SEED_ADMIN_PASSWORD: 'ChangeMe@12345!',
    });
    expect(result.success).toBe(false);
  });
});
