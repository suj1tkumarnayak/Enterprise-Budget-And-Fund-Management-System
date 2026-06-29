import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { z } from 'zod';

// =============================================================================
// Seed environment validation
// Runs as a standalone tsx process — does not go through the Express app or
// the main config module.
// =============================================================================

const seedEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .startsWith('postgresql://'),
  SEED_ADMIN_EMAIL: z
    .string()
    .email('SEED_ADMIN_EMAIL must be a valid email address'),
  SEED_ADMIN_PASSWORD: z
    .string()
    .min(12, 'SEED_ADMIN_PASSWORD must be at least 12 characters'),
});

function validateSeedEnv(): z.infer<typeof seedEnvSchema> {
  const result = seedEnvSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.errors
      .map((err) => `  • ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    process.stderr.write(
      `\n[SEED] ✗ Environment validation failed:\n${formatted}\n\n`,
    );
    process.exit(1);
  }

  return result.data;
}

// =============================================================================
// Seed data
// =============================================================================

const ROLES = [
  { name: 'Admin',          description: 'Full system configuration and user management. Does not participate in financial approvals.' },
  { name: 'FinanceHead',    description: 'Final-stage approval authority for high-value requests. Full org-wide financial visibility.' },
  { name: 'FinanceOfficer', description: 'Mid-tier approval authority. Processes fund allocations and expense approvals.' },
  { name: 'DeptManager',    description: 'First-stage approver for their department. Monitors department budget utilization.' },
  { name: 'ProjectManager', description: 'Creates budget requests and submits expenses for their projects.' },
  { name: 'Employee',       description: 'Submits personal expense claims tied to assigned projects or teams.' },
  { name: 'Auditor',        description: 'Read-only access across the entire system including all audit logs.' },
] as const satisfies ReadonlyArray<{ name: string; description: string }>;

const EXPENSE_CATEGORIES = [
  { name: 'Travel',         description: 'Transportation, accommodation, and per diem expenses.' },
  { name: 'Equipment',      description: 'Hardware, tools, and physical assets.' },
  { name: 'Software',       description: 'Software licences, SaaS subscriptions, and digital tools.' },
  { name: 'Payroll-Linked', description: 'Expenses directly associated with payroll runs and staff costs.' },
  { name: 'Vendor',         description: 'Third-party vendor invoices and contractor payments.' },
  { name: 'Miscellaneous',  description: 'Expenses that do not fit a more specific category.' },
] as const satisfies ReadonlyArray<{ name: string; description: string }>;

const SYSTEM_SETTINGS = [
  {
    key:   'fiscal_year_start',
    value: { month: 1, day: 1 },
  },
  {
    key:   'approval_threshold_tier1',
    value: { maxAmount: 10000, currency: 'USD' },
  },
  {
    key:   'approval_threshold_tier2',
    value: { maxAmount: 100000, currency: 'USD' },
  },
  {
    key:   'approval_threshold_tier3',
    value: { maxAmount: null, currency: 'USD' },
  },
  {
    key:   'receipt_required_above',
    value: { amount: 50, currency: 'USD' },
  },
  {
    key:   'max_export_rows',
    value: { rows: 100000 },
  },
  {
    key:   'sla_default_hours',
    value: { hours: 48 },
  },
  {
    key:   'budget_warning_threshold_pct',
    value: { percentage: 90 },
  },
] as const satisfies ReadonlyArray<{ key: string; value: Record<string, unknown> }>;

// =============================================================================
// Seed functions
// =============================================================================

const prisma = new PrismaClient();

async function seedRoles(): Promise<Map<string, string>> {
  console.log('  → Seeding roles...');

  const roleIdMap = new Map<string, string>();

  for (const role of ROLES) {
    const upserted = await prisma.role.upsert({
      where:  { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
      select: { id: true, name: true },
    });
    roleIdMap.set(upserted.name, upserted.id);
  }

  console.log(`     ✓ ${ROLES.length} roles seeded`);
  return roleIdMap;
}

async function seedExpenseCategories(): Promise<void> {
  console.log('  → Seeding expense categories...');

  for (const category of EXPENSE_CATEGORIES) {
    await prisma.expenseCategory.upsert({
      where:  { name: category.name },
      update: { description: category.description, isActive: true },
      create: { name: category.name, description: category.description, isActive: true },
    });
  }

  console.log(`     ✓ ${EXPENSE_CATEGORIES.length} expense categories seeded`);
}

async function seedSystemSettings(): Promise<void> {
  console.log('  → Seeding system settings...');

  for (const setting of SYSTEM_SETTINGS) {
    await prisma.systemSetting.upsert({
      where:  { key: setting.key },
      // Do NOT overwrite on re-run — an Admin may have changed these values.
      // Only insert if the key does not yet exist.
      update: {},
      create: {
        key:     setting.key,
        value:   setting.value,
        version: 1,
      },
    });
  }

  console.log(`     ✓ ${SYSTEM_SETTINGS.length} system settings seeded`);
}

async function seedAdminUser(
  adminEmail: string,
  adminPassword: string,
  adminRoleId: string,
): Promise<void> {
  console.log('  → Seeding Admin user...');

  const existing = await prisma.user.findFirst({
    where:  { email: adminEmail, deletedAt: null },
    select: { id: true, email: true },
  });

  if (existing !== null) {
    console.log(`     ⚠  Admin '${adminEmail}' already exists — skipping`);
    return;
  }

  const passwordHash = await argon2.hash(adminPassword, {
    type:        argon2.argon2id,
    memoryCost:  65536,
    timeCost:    3,
    parallelism: 4,
  });

  const admin = await prisma.user.create({
    data: {
      email:              adminEmail,
      passwordHash,
      fullName:           'System Administrator',
      roleId:             adminRoleId,
      isActive:           true,
      mustChangePassword: true,
    },
    select: { id: true, email: true },
  });

  await prisma.notificationPreference.upsert({
    where:  { userId: admin.id },
    update: {},
    create: {
      userId:          admin.id,
      emailEnabled:    true,
      digestFrequency: 'Immediate',
    },
  });

  console.log(`     ✓ Admin user '${admin.email}' created (mustChangePassword=true)`);
}

// =============================================================================
// Entry point
// =============================================================================

async function main(): Promise<void> {
  console.log('\n[EBFMS Seed] Starting...\n');

  const seedEnv = validateSeedEnv();

  try {
    await prisma.$connect();
    console.log('  ✓ Database connection established\n');

    const roleIdMap = await seedRoles();
    await seedExpenseCategories();
    await seedSystemSettings();

    const adminRoleId = roleIdMap.get('Admin');
    if (adminRoleId === undefined) {
      throw new Error('Admin role missing after seed — this should never happen');
    }

    await seedAdminUser(
      seedEnv.SEED_ADMIN_EMAIL,
      seedEnv.SEED_ADMIN_PASSWORD,
      adminRoleId,
    );

    console.log('\n[EBFMS Seed] ✓ Complete\n');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`\n[EBFMS Seed] ✗ Fatal: ${message}\n`);
  process.exit(1);
});
