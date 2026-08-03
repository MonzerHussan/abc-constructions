import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { entityRegistryService, syncEntityProfileSchema } from '@/modules/entity-registry';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { logger } from '@/modules/shared/utils/logger';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

/**
 * sync-entity-profile
 *
 * Creates an Entity + Profile atomically and bridges it to the authenticated user
 * via Profile.userId (plain string — no FK, preserving Architecture Isolation).
 * Data teams (P2) and AI (P4) consume only Entity + Profile tables.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = validate(syncEntityProfileSchema, body);
    if (!parsed.success) return Response.json(parsed.response, { status: 422 });

    // SECURITY: userId ALWAYS comes from the session — never from the body.
    // Accepting a client-supplied userId would allow identity spoofing (IDOR).
    const bodyProfile = parsed.data.profile ?? {};
    const profileWithoutUserId = Object.fromEntries(
      Object.entries(bodyProfile).filter(([key]) => key !== 'userId'),
    ) as Omit<NonNullable<typeof parsed.data.profile>, 'userId'>;
    const payload = {
      entity: parsed.data.entity,
      profile: { ...profileWithoutUserId, userId: session.user.id },
    };

    const result = await entityRegistryService.syncEntityProfile(payload);
    return Response.json(success(result), { status: 201 });
  } catch (err) {
    logger.error('sync-entity-profile failed', { error: err instanceof Error ? err.message : String(err) });
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to sync entity profile'), { status: 500 });
  }
}
