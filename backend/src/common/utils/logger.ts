import winston from 'winston';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const isProduction = process.env['NODE_ENV'] === 'production';
const isTest = process.env['NODE_ENV'] === 'test';

/**
 * Structured logger used across the entire application.
 *
 * In production: outputs JSON for ingestion by ELK / CloudWatch.
 * In development: outputs colourised human-readable lines.
 * In test: silenced to keep test output clean.
 */
export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  silent: isTest,
  format: isProduction
    ? combine(timestamp(), errors({ stack: true }), json())
    : combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        simple(),
      ),
  transports: [new winston.transports.Console()],
});
