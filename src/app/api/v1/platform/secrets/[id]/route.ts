import { NextResponse } from "next/server";
import { withPlatformTenant } from "@/lib/platform-guard";
import { tenantService } from "@/modules/platform";
import { PlatformPermissions } from "@/modules/platform/security/platform-authorization";
import { error, success } from "@/modules/shared/utils/response-envelope";
import { ErrorCodes } from "@/modules/shared/utils/error-codes";

export const GET = withPlatformTenant(
  PlatformPermissions.SECRET_READ,
  async (_req, { tenantId, params }) => {
  const secretId = params.id;
  const secret = await tenantService.findScopedSecretById(secretId, tenantId);

  if (!secret) {
    return NextResponse.json(
      error(ErrorCodes.CORE_USER_FORBIDDEN, "Resource not found in tenant scope"),
      { status: 404 }
    );
  }

  return NextResponse.json(
    success({
      id: secret.id,
      tenantId: secret.tenantId,
      label: secret.label,
      secret: secret.secret,
    })
  );
});
