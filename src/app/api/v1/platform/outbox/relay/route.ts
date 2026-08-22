import { NextResponse } from "next/server";
import { withPlatformTenant } from "@/lib/platform-guard";
import { outboxRelayService, idempotencyService } from "@/modules/platform";
import { PlatformPermissions } from "@/modules/platform/security/platform-authorization";
import { success } from "@/modules/shared/utils/response-envelope";

/**
 * VS-0: triggers one outbox relay batch (worker substitute in dev/CI).
 * Idempotent per tenant + correlation via Idempotency-Key header.
 */
export const POST = withPlatformTenant(
  PlatformPermissions.OUTBOX_RELAY,
  async (req, { tenantId, correlationId }) => {
    const idempotencyKey =
      req.headers.get("idempotency-key")?.trim() ??
      `outbox-relay:${tenantId}:${correlationId}`;

    const { replay, value } = await idempotencyService.executeOnce(
      idempotencyKey,
      tenantId,
      60_000,
      () => outboxRelayService.relayBatch()
    );

    return NextResponse.json(success({ ...value, replay }));
  }
);
