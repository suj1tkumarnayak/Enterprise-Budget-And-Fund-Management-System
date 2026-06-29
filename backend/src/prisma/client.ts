import { PrismaClient } from '@prisma/client';

import { logger } from '@common/utils/logger';

/**
 * Singleton Prisma client.
 *
 * A single instance is reused across the entire application lifetime.
 * In development, the instance is attached to `globalThis` to survive
 * hot-module reloads without exhausting the PostgreSQL connection pool.
 *
 * Never import PrismaClient directly in modules — always import this singleton.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'production'
        ? ['error']
        : [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ],
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;

  // Log slow queries in development to surface N+1 and missing-index problems early.
  (prisma as PrismaClient).$on(
    'query' as never,
    (e: { query: string; duration: number }) => {
      if (e.duration > 200) {
        logger.warn('Slow query detected', { query: e.query, durationMs: e.duration });
      }
    },
  );
}
