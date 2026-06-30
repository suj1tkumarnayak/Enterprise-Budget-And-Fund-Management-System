import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { config } from '@config/index';
import { errorHandler } from '@common/middleware/errorHandler';
import { notFoundHandler } from '@common/middleware/notFound';
import { requestLogger } from '@common/middleware/requestLogger';
import { logger } from '@common/utils/logger';

import authRoutes from '@modules/auth/auth.routes';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (origin === undefined && !config.isProduction) {
          callback(null, true);
          return;
        }
        if (origin !== undefined && config.cors.allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`CORS policy: origin '${String(origin)}' is not allowed`));
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes — registered as each module milestone completes
  app.use('/api/v1/auth', authRoutes);
  // app.use('/api/v1/users',           usersRoutes);
  // app.use('/api/v1/departments',     departmentsRoutes);
  // app.use('/api/v1/projects',        projectsRoutes);
  // app.use('/api/v1/teams',           teamsRoutes);
  // app.use('/api/v1/budget-requests', budgetRequestsRoutes);
  // app.use('/api/v1/approvals',       approvalsRoutes);
  // app.use('/api/v1/allocations',     allocationsRoutes);
  // app.use('/api/v1/expenses',        expensesRoutes);
  // app.use('/api/v1/payroll',         payrollRoutes);
  // app.use('/api/v1/reports',         reportsRoutes);
  // app.use('/api/v1/analytics',       analyticsRoutes);
  // app.use('/api/v1/notifications',   notificationsRoutes);
  // app.use('/api/v1/audit-logs',      auditRoutes);
  // app.use('/api/v1/settings',        settingsRoutes);

  logger.info('Express application initialised');

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
