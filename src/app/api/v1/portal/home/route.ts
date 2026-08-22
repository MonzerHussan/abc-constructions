import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { success, error } from "@/modules/shared/utils/response-envelope";
import { ErrorCodes } from "@/modules/shared/utils/error-codes";
import { logger } from "@/modules/shared/utils/logger";
import { portalHomeService } from "@/modules/portal";

/**
 * GET /api/v1/portal/home?persona=CONTRACTOR&orgId={optional}
 * Returns the contractor portal home payload (activation, KPIs, NBA, ...).
 * Phase 1 supports persona=CONTRACTOR only.
 */
export const GET = withAuth(
  async (
    request: NextRequest,
    { sessionUserId }: { sessionUserId: string; params: Record<string, string> }
  ) => {
    try {
      const { searchParams } = new URL(request.url);
      const persona = searchParams.get("persona") ?? "CONTRACTOR";
      const orgId = searchParams.get("orgId") ?? undefined;

      const data = await portalHomeService.getHome({
        persona,
        userId: sessionUserId,
        orgId,
      });

      return NextResponse.json(success(data));
    } catch (err) {
      logger.error("portal/home failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.json(
        error(ErrorCodes.INTERNAL_ERROR, "Failed to load portal home"),
        { status: 500 }
      );
    }
  }
);