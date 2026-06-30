import { EventEmitter } from 'events';

import { logger } from '@common/utils/logger';

/**
 * Internal in-process event bus (ADR-007).
 *
 * Cross-module side effects (audit logging, notifications, analytics
 * invalidation) are emitted here instead of via direct service imports.
 * Implemented now (M2) because auth is the first module requiring an
 * audit log entry (Login action, PROJECT_RULES.md Rule 8).
 */

export interface AuditEventPayload {
  actorId: string | null;
  action:
    | 'Create'
    | 'Update'
    | 'Delete'
    | 'Approve'
    | 'Reject'
    | 'Return'
    | 'Withdraw'
    | 'Allocate'
    | 'Post'
    | 'Import'
    | 'Login'
    | 'Logout'
    | 'PasswordChange'
    | 'RoleChange';
  entityType: string;
  entityId: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

interface AppEvents {
  audit: (payload: AuditEventPayload) => void;
}

class TypedEventBus extends EventEmitter {
  emitTyped<K extends keyof AppEvents>(event: K, payload: Parameters<AppEvents[K]>[0]): void {
    this.emit(event, payload);
  }

  onTyped<K extends keyof AppEvents>(event: K, listener: AppEvents[K]): void {
    this.on(event, listener as (...args: unknown[]) => void);
  }
}

export const eventBus = new TypedEventBus();

eventBus.on('error', (err: unknown) => {
  logger.error('eventBus listener threw', { error: err });
});
