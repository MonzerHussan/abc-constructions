import { NextResponse } from "next/server";
import { withPlatformTenant } from "@/lib/platform-guard";
import { platformAuditService } from "@/modules/platform";
import { PlatformPermissions } from "@/modules/platform/security/platform-authorization";
import { success } from "@/modules/shared/utils/response-envelope";

export const GET = withPlatformTenant(
  PlatformPermissions.AUDIT_READ,
  async (_req, { tenantId }) => {
    const entries = await platformAuditService.listForTenant(tenantId, 100);
    return NextResponse.json(
      success({
        tenantId,
        entries: entries.map((e) => ({
          id: e.id,
          action: e.action,
          resourceType: e.resourceType,
          resourceId: e.resourceId,
          actorUserId: e.actorUserId,
          correlationId: e.correlationId,
          createdAt: e.createdAt.toISOString(),
        })),
      })
    );
  }
);
