import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { entityRegistryService } from '@/modules/entity-registry';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { logger } from '@/modules/shared/utils/logger';

/**
 * GET /api/v1/entity-registry/me
 *
 * Returns the Entity + Profile for the authenticated user.
 * A null profile means the user has not completed onboarding.
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }

    const profile = await entityRegistryService.findProfileByUserId(session.user.id);

    return Response.json(success({
      isOnboarded: !!profile,
      profile: profile ?? null,
      entity: profile?.entity ?? null,
    }));
  } catch (err) {
    logger.error('entity-registry/me failed', { error: err instanceof Error ? err.message : String(err) });
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch user entity registry status'), { status: 500 });
  }
}
