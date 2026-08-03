import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';
import type { WorkflowHistoryEntry, WorkflowHistoryRecorder } from '@/modules/shared/workflow/WorkflowHistoryRecorder';

function toEntry(record: {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  fromStatus: string;
  toStatus: string | null;
  result: WorkflowHistoryEntry['result'];
  guardName: string | null;
  reason: string | null;
  actorId: string | null;
  actorRole: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
}): WorkflowHistoryEntry {
  return {
    id: record.id,
    entityType: record.entityType,
    entityId: record.entityId,
    action: record.action,
    fromStatus: record.fromStatus,
    toStatus: record.toStatus,
    result: record.result,
    guardName: record.guardName ?? undefined,
    reason: record.reason ?? undefined,
    actorId: record.actorId ?? undefined,
    actorRole: record.actorRole ?? undefined,
    metadata: record.metadata && typeof record.metadata === 'object' ? (record.metadata as Record<string, unknown>) : undefined,
    createdAt: record.createdAt,
  };
}

export class PrismaWorkflowHistoryRecorder implements WorkflowHistoryRecorder {
  async record(entry: Omit<WorkflowHistoryEntry, 'id' | 'createdAt'>): Promise<WorkflowHistoryEntry> {
    const created = await prisma.workflowHistory.create({
      data: {
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        result: entry.result,
        guardName: entry.guardName ?? null,
        reason: entry.reason ?? null,
        actorId: entry.actorId ?? null,
        actorRole: entry.actorRole ?? null,
        metadata: (entry.metadata as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
      },
    });
    return toEntry(created);
  }

  async listByEntity(entityType: string, entityId: string): Promise<WorkflowHistoryEntry[]> {
    const records = await prisma.workflowHistory.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'asc' },
    });
    return records.map(toEntry);
  }

  async list(): Promise<WorkflowHistoryEntry[]> {
    const records = await prisma.workflowHistory.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return records.map(toEntry);
  }
}
