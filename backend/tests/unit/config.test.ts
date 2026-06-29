import { z } from 'zod';

const testSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .regex(/^\d+$/)
    .default('3000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val < 65536),
  DATABASE_URL: z.string().min(1).startsWith('postgresql://'),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().regex(/^\d+[smhd]$/).default('15m'),
  JWT_REFRESH_EXPIRY: z.string().regex(/^\d+[smhd]$/).default('7d'),
  CORS_ALLOWED_ORIGINS: z.string().min(1).default('http://localhost:5173'),
});

const validEnv = {
  NODE_ENV: 'test' as const,
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/ebfms_test',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
};

describe('Environment configuration schema', () => {
  describe('NODE_ENV', () => {
    it('accepts valid values', () => {
      for (const value of ['development', 'test', 'production'] as const) {
        const result = testSchema.safeParse({ ...validEnv, NODE_ENV: value });
        expect(result.success).toBe(true);
      }
    });

    it('rejects unknown values', () => {
      const result = testSchema.safeParse({ ...validEnv, NODE_ENV: 'staging' });
      expect(result.success).toBe(false);
    });

    it('defaults to development when absent', () => {
      const { NODE_ENV: _, ...withoutNodeEnv } = validEnv;
      const result = testSchema.safeParse(withoutNodeEnv);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe('development');
      }
    });
  });

  describe('PORT', () => {
    it('transforms valid string to number', () => {
      const result = testSchema.safeParse({ ...validEnv, PORT: '4000' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.PORT).toBe(4000);
      }
    });

    it('rejects non-numeric port', () => {
      const result = testSchema.safeParse({ ...validEnv, PORT: 'abc' });
      expect(result.success).toBe(false);
    });

    it('rejects port 0', () => {
      const result = testSchema.safeParse({ ...validEnv, PORT: '0' });
      expect(result.success).toBe(false);
    });

    it('rejects port above 65535', () => {
      const result = testSchema.safeParse({ ...validEnv, PORT: '70000' });
      expect(result.success).toBe(false);
    });

    it('defaults to 3000 when absent', () => {
      const result = testSchema.safeParse(validEnv);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.PORT).toBe(3000);
      }
    });
  });

  describe('DATABASE_URL', () => {
    it('accepts a valid postgresql URL', () => {
      const result = testSchema.safeParse(validEnv);
      expect(result.success).toBe(true);
    });

    it('rejects a mysql URL', () => {
      const result = testSchema.safeParse({
        ...validEnv,
        DATABASE_URL: 'mysql://user:pass@localhost:3306/db',
      });
      expect(result.success).toBe(false);
    });

    it('rejects an empty string', () => {
      const result = testSchema.safeParse({ ...validEnv, DATABASE_URL: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('JWT secrets', () => {
    it('rejects secrets shorter than 32 characters', () => {
      const result = testSchema.safeParse({ ...validEnv, JWT_ACCESS_SECRET: 'tooshort' });
      expect(result.success).toBe(false);
    });

    it('accepts secrets exactly 32 characters', () => {
      const result = testSchema.safeParse({
        ...validEnv,
        JWT_ACCESS_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'b'.repeat(32),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('JWT expiry', () => {
    it('accepts valid duration strings', () => {
      for (const expiry of ['15m', '1h', '7d', '3600s']) {
        const result = testSchema.safeParse({ ...validEnv, JWT_ACCESS_EXPIRY: expiry });
        expect(result.success).toBe(true);
      }
    });

    it('rejects invalid duration strings', () => {
      for (const expiry of ['15 minutes', '1hour', 'never', '']) {
        const result = testSchema.safeParse({ ...validEnv, JWT_ACCESS_EXPIRY: expiry });
        expect(result.success).toBe(false);
      }
    });

    it('defaults ACCESS_EXPIRY to 15m', () => {
      const result = testSchema.safeParse(validEnv);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.JWT_ACCESS_EXPIRY).toBe('15m');
      }
    });

    it('defaults REFRESH_EXPIRY to 7d', () => {
      const result = testSchema.safeParse(validEnv);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.JWT_REFRESH_EXPIRY).toBe('7d');
      }
    });
  });

  describe('CORS_ALLOWED_ORIGINS', () => {
    it('accepts a single origin', () => {
      const result = testSchema.safeParse({
        ...validEnv,
        CORS_ALLOWED_ORIGINS: 'https://app.ebfms.io',
      });
      expect(result.success).toBe(true);
    });

    it('accepts a comma-separated list', () => {
      const result = testSchema.safeParse({
        ...validEnv,
        CORS_ALLOWED_ORIGINS: 'https://app.ebfms.io,https://admin.ebfms.io',
      });
      expect(result.success).toBe(true);
    });

    it('defaults to localhost when absent', () => {
      const result = testSchema.safeParse(validEnv);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.CORS_ALLOWED_ORIGINS).toBe('http://localhost:5173');
      }
    });
  });

  describe('complete valid environment', () => {
    it('parses all required fields successfully', () => {
      const result = testSchema.safeParse(validEnv);
      expect(result.success).toBe(true);
    });

    it('returns correct types after parsing', () => {
      const result = testSchema.safeParse({ ...validEnv, PORT: '3001' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.PORT).toBe('number');
        expect(typeof result.data.DATABASE_URL).toBe('string');
        expect(typeof result.data.JWT_ACCESS_SECRET).toBe('string');
      }
    });
  });
});
