import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z
    .string()
    .regex(/^\d+$/, 'PORT must be a numeric string')
    .default('3000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val < 65536, 'PORT must be between 1 and 65535'),

  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .startsWith('postgresql://', 'DATABASE_URL must be a valid PostgreSQL connection string'),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  JWT_ACCESS_EXPIRY: z
    .string()
    .regex(/^\d+[smhd]$/, 'JWT_ACCESS_EXPIRY must be a duration string (e.g. 15m, 1h, 7d)')
    .default('15m'),

  JWT_REFRESH_EXPIRY: z
    .string()
    .regex(/^\d+[smhd]$/, 'JWT_REFRESH_EXPIRY must be a duration string (e.g. 15m, 1h, 7d)')
    .default('7d'),

  CORS_ALLOWED_ORIGINS: z
    .string()
    .min(1, 'CORS_ALLOWED_ORIGINS is required')
    .default('http://localhost:5173'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY:    z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .regex(/^\d+$/, 'SMTP_PORT must be numeric')
    .optional()
    .transform((val) => (val !== undefined ? parseInt(val, 10) : undefined)),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email('SMTP_FROM must be a valid email address').optional(),

  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),

  // Seed — only consumed by prisma/seed.ts, never at runtime
  SEED_ADMIN_EMAIL: z
    .string()
    .email('SEED_ADMIN_EMAIL must be a valid email address')
    .optional(),
  SEED_ADMIN_PASSWORD: z
    .string()
    .min(12, 'SEED_ADMIN_PASSWORD must be at least 12 characters')
    .optional(),
});

export type AppEnvironment = z.infer<typeof environmentSchema>;

function validateEnvironment(): AppEnvironment {
  const result = environmentSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.errors
      .map((err) => `  • ${err.path.join('.')}: ${err.message}`)
      .join('\n');

    process.stderr.write(
      `\n[EBFMS] ✗ Environment validation failed. Fix the following before starting:\n${formatted}\n\n`,
    );
    process.exit(1);
  }

  return result.data;
}

const env = validateEnvironment();

export const config = {
  nodeEnv:      env.NODE_ENV,
  port:         env.PORT,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  isTest:       env.NODE_ENV === 'test',

  database: {
    url: env.DATABASE_URL,
  },

  jwt: {
    accessSecret:  env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry:  env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },

  cors: {
    allowedOrigins: env.CORS_ALLOWED_ORIGINS
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0),
  },

  cloudinary: {
    cloudName:    env.CLOUDINARY_CLOUD_NAME,
    apiKey:       env.CLOUDINARY_API_KEY,
    apiSecret:    env.CLOUDINARY_API_SECRET,
    isConfigured:
      env.CLOUDINARY_CLOUD_NAME !== undefined &&
      env.CLOUDINARY_API_KEY !== undefined &&
      env.CLOUDINARY_API_SECRET !== undefined,
  },

  smtp: {
    host:         env.SMTP_HOST,
    port:         env.SMTP_PORT,
    user:         env.SMTP_USER,
    pass:         env.SMTP_PASS,
    from:         env.SMTP_FROM,
    isConfigured:
      env.SMTP_HOST !== undefined &&
      env.SMTP_USER !== undefined &&
      env.SMTP_PASS !== undefined &&
      env.SMTP_FROM !== undefined,
  },

  redis: {
    url:          env.REDIS_URL,
    isConfigured: env.REDIS_URL !== undefined,
  },

  seed: {
    adminEmail:    env.SEED_ADMIN_EMAIL,
    adminPassword: env.SEED_ADMIN_PASSWORD,
  },
} as const;

export type AppConfig = typeof config;
