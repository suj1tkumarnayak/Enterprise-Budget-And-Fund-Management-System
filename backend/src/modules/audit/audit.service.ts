import { eventBus, type AuditEventPayload } from '@events/eventBus';
import { prisma } from '@db/client';
import { logger } from '@common/utils/logger';
import { Prisma } from '@prisma/client';
/**
 * Audit service — append-only (ADR-004). Never UPDATE/DELETE audit_logs
 * at the application layer.
 *
 * Subscribes to eventBus 'audit' events so other modules never write to
 * AuditLog directly (ADR-007) — they emit, this module persists.
 */

async function recordAuditLog(payload: AuditEventPayload): Promise<void> {
  try {
    const data: Prisma.AuditLogCreateInput = {
      actor: {
  connect: {
    id: payload.actorId,
  },
},
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId,
      ipAddress: payload.ipAddress ?? null,
      userAgent: payload.userAgent ?? null,
    };

    if (payload.beforeState !== undefined) {
      data.beforeState = payload.beforeState as Prisma.InputJsonValue;
    }

    if (payload.afterState !== undefined) {
      data.afterState = payload.afterState as Prisma.InputJsonValue;
    }

    await prisma.auditLog.create({ data });
  } catch (err) {
    logger.error('Failed to write audit log entry', {
      error: err,
      payload,
    });
  }
}

eventBus.onTyped('audit', (payload) => {
  void recordAuditLog(payload);
});

export const auditService = { recordAuditLog };
