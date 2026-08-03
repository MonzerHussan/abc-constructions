import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { entityRegistryService, upsertProfileSchema } from '@/modules/entity-registry';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { logger } from '@/modules/shared/utils/logger';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = validate(upsertProfileSchema, body);
    if (!parsed.success) return Response.json(parsed.response, { status: 422 });

    // SECURITY: userId ALWAYS comes from the session — never from the body.
    const bodyProfile = parsed.data as Record<string, unknown>;
    const profileWithoutUserId = Object.fromEntries(
      Object.entries(bodyProfile).filter(([key]) => key !== 'userId'),
    ) as Omit<typeof parsed.data, 'userId'>;
    const profile = await entityRegistryService.upsertProfile({ ...profileWithoutUserId, userId: session.user.id });
    return Response.json(success(profile));
  } catch (err) {
    if (err instanceof Error && err.message === 'ENTITY_NOT_FOUND') {
      return Response.json(error(ErrorCodes.ENTITY_NOT_FOUND, 'Entity not found'), { status: 404 });
    }
    logger.error('upsert-profile failed', { error: err instanceof Error ? err.message : String(err) });
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to upsert profile'), { status: 500 });
  }
}
