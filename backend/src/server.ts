import { config } from '@config/index';
import { prisma } from '@prisma/client';
import { logger } from '@common/utils/logger';
import { createApp } from './app';

async function bootstrap(): Promise<void> {
  await prisma.$connect();
  logger.info('Database connection established');

  const app = createApp();

  const server = app.listen(config.port, () => {
    logger.info('EBFMS API listening', {
      port: config.port,
      env:  config.nodeEnv,
    });
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — initiating graceful shutdown`);

    server.close(async () => {
      logger.info('HTTP server closed');
      await prisma.$disconnect();
      logger.info('Database connection closed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
  process.on('SIGINT',  () => { void shutdown('SIGINT'); });

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled promise rejection', { reason });
  });

  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught exception — exiting', {
      message: err.message,
      stack:   err.stack,
    });
    process.exit(1);
  });
}

bootstrap().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  logger.error('Failed to start server', { message });
  process.exit(1);
});
