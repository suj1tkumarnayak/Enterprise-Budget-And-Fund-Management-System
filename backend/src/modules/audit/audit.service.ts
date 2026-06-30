import { eventBus, type AuditEventPayload } from '@events/eventBus';
import { prisma } from '@prisma/client';
import { logger } from '@common/utils/logger';

/**
 * Audit service — append-only (ADR-004). Never UPDATE/DELETE audit_logs
 * at the application layer.
 *
 * Subscribes to eventBus 'audit' events so other modules never write to
 * AuditLog directly (ADR-007) — they emit, this module persists.
 */
async function recordAuditLog(payload: AuditEventPayload): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: payload.actorId,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        beforeState: payload.beforeState ?? undefined,
        afterState: payload.afterState ?? undefined,
        ipAddress: payload.ipAddress ?? undefined,
        userAgent: payload.userAgent ?? undefined,
      },
    });
  } catch (err) {
    // Audit write failures must never break the originating request, but
    // must be loud — this is a compliance-relevant silent-failure path.
    logger.error('Failed to write audit log entry', { error: err, payload });
  }
}

eventBus.onTyped('audit', (payload) => {
  void recordAuditLog(payload);
});

export const auditService = { recordAuditLog };
