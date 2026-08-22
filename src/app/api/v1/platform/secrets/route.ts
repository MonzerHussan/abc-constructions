import { NextResponse } from "next/server";
import { withPlatformTenant } from "@/lib/platform-guard";
import { tenantService, platformAuditService } from "@/modules/platform";
import { PlatformPermissions } from "@/modules/platform/security/platform-authorization";
import { success } from "@/modules/shared/utils/response-envelope";

export const GET = withPlatformTenant(
  PlatformPermissions.SECRET_READ,
  async (_req, { tenantId, sessionUserId }) => {
  const secrets = await tenantService.listScopedSecretsForTenant(tenantId);

  await platformAuditService.append({
    action: "platform.secret.list",
    resourceType: "TenantScopedSecret",
    tenantId,
    actorUserId: sessionUserId,
  });

  return NextResponse.json(
    success({
      tenantId,
      secrets: secrets.map((s) => ({ id: s.id, label: s.label })),
    })
  );
});
