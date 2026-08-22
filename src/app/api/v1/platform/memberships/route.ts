import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { tenantService } from "@/modules/platform";
import { success } from "@/modules/shared/utils/response-envelope";

export const GET = withAuth(async (_req, { sessionUserId }) => {
  const memberships = await tenantService.listMembershipsForUser(sessionUserId);
  return NextResponse.json(
    success({
      memberships: memberships.map((m) => ({
        tenantId: m.tenantId,
        slug: m.tenant.slug,
        name: m.tenant.name,
        roleKeys: m.roleKeys,
      })),
    })
  );
});
