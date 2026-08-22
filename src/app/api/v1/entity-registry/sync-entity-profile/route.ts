import { NextRequest, NextResponse } from 'next/server';
import { entityRegistryService, syncEntityProfileSchema } from '@/modules/entity-registry';
import { crmBridgeService } from '@/modules/crm';
import { portalHomeService } from '@/modules/portal';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { logger } from '@/modules/shared/utils/logger';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withAuth } from '@/lib/auth-guard';

/**
 * sync-entity-profile
 *
 * Creates an Entity + Profile atomically and bridges it to the authenticated user
 * via Profile.userId (plain string — no FK, preserving Architecture Isolation).
 * Data teams (P2) and AI (P4) consume only Entity + Profile tables.
 */
export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = validate(syncEntityProfileSchema, body);
    if (!parsed.success) return NextResponse.json(parsed.response, { status: 422 });

    // SECURITY: userId ALWAYS comes from the session — never from the body.
    // Accepting a client-supplied userId would allow identity spoofing (IDOR).
    const bodyProfile = parsed.data.profile ?? {};
    const profileWithoutUserId = Object.fromEntries(
      Object.entries(bodyProfile).filter(([key]) => key !== 'userId'),
    ) as Omit<NonNullable<typeof parsed.data.profile>, 'userId'>;
    const payload = {
      entity: parsed.data.entity,
      profile: { ...profileWithoutUserId, userId: sessionUserId },
    };

    const result = await entityRegistryService.syncEntityProfile(payload);

    // CRM bridge: create/refresh a lead for the onboarded user, keyed by the
    // unique entity registry ID (idempotent — no duplicate leads on re-sync).
    try {
      await crmBridgeService.syncLeadFromEntityRegistry({
        entity: result.entity,
        profile: result.profile,
        userId: sessionUserId,
      });
    } catch (bridgeErr) {
      // CRM must never break onboarding; log and continue.
      logger.error('CRM lead sync (onboarding) failed', {
        userId: sessionUserId,
        error: bridgeErr instanceof Error ? bridgeErr.message : String(bridgeErr),
      });
    }

    // Portal bootstrap: map User.role → platform persona and seed org capabilities.
    try {
      await portalHomeService.ensurePersonaBootstrap(sessionUserId);
    } catch (portalErr) {
      // Portal bootstrap is best-effort; never break onboarding.
      logger.error('Portal bootstrap (onboarding) failed', {
        userId: sessionUserId,
        error: portalErr instanceof Error ? portalErr.message : String(portalErr),
      });
    }

    return NextResponse.json(success(result), { status: 201 });
  } catch (err) {
    logger.error('sync-entity-profile failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to sync entity profile'), { status: 500 });
  }
});