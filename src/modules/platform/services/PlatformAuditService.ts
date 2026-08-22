import { platformPrisma } from "@/lib/platform-prisma";
import type { Prisma } from "@/generated/platform-prisma/client";
import { getRequestContext } from "@/modules/platform/context/request-context";

export interface PlatformAuditInput {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  tenantId?: string;
  actorUserId?: string;
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Append-only platform audit (WORM at service layer — no update/delete APIs).
 * Mutations on audit_entry are forbidden by design for G3-1 compliance.
 */
export class PlatformAuditService {
  async append(input: PlatformAuditInput, tx?: Prisma.TransactionClient) {
    const ctx = getRequestContext();
    const client = tx ?? platformPrisma;

    return client.platformAuditEntry.create({
      data: {
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        details: input.details as Prisma.InputJsonValue | undefined,
        tenantId: input.tenantId ?? ctx?.tenantId,
        actorUserId: input.actorUserId ?? ctx?.userId,
        correlationId: input.correlationId ?? ctx?.correlationId,
        ipAddress: input.ipAddress ?? ctx?.ipAddress,
        userAgent: input.userAgent ?? ctx?.userAgent,
      },
    });
  }

  async listForTenant(tenantId: string, limit = 50) {
    return platformPrisma.platformAuditEntry.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const platformAuditService = new PlatformAuditService();
