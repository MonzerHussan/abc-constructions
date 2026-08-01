import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';

export interface AuditInput {
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  userId?: string;
  organizationId?: string;
}

export class AuditService {
  async log(input: AuditInput) {
    const record = await prisma.auditLog.create({
      data: {
        action: input.action as any,
        entity: input.entity,
        entityId: input.entityId,
        details: (input.details as Prisma.JsonValue) || undefined,
        ip: input.ip,
        userAgent: input.userAgent,
        userId: input.userId,
        organizationId: input.organizationId,
      },
    });
    await eventBus.publish({
      name: buildEventName('Core', 'Audit', 'Created'),
      version: 1,
      payload: {
        auditId: record.id,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        userId: input.userId,
      },
      metadata: {
        timestamp: new Date(),
        correlationId: `audit_${record.id}_${Date.now()}`,
        source: 'core',
      },
    });
    return record;
  }

  async findByEntity(entity: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findByUser(userId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByOrg(orgId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }
}
