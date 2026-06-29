import morgan from 'morgan';

import { logger } from '@common/utils/logger';

/**
 * HTTP request logging middleware.
 *
 * Delegates to Morgan for access-log formatting and pipes output through
 * the Winston logger so all application logs share one structured stream.
 * Requests to /health are excluded to avoid polluting logs with liveness
 * probe noise in Kubernetes/container environments.
 */
export const requestLogger = morgan('combined', {
  skip: (req) => req.url === '/health',
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    },
  },
});
