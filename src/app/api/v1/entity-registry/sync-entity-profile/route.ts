import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { entityRegistryService, syncEntityProfileSchema } from '@/modules/entity-registry';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
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

    // Bridge: inject the authenticated user id into the profile link unless overridden
    const payload = {
      entity: parsed.data.entity,
      profile: { ...(parsed.data.profile ?? {}), userId: parsed.data.profile?.userId ?? session.user.id },
    };

    const result = await entityRegistryService.syncEntityProfile(payload);
    return Response.json(success(result), { status: 201 });
  } catch {
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to sync entity profile'), { status: 500 });
  }
}
