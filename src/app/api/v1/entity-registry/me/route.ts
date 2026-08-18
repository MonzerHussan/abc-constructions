import { NextRequest, NextResponse } from 'next/server';
import { entityRegistryService } from '@/modules/entity-registry';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { logger } from '@/modules/shared/utils/logger';
import { withAuth } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/v1/entity-registry/me
 *
 * Returns the Entity + Profile for the authenticated user.
 * A null profile means the user has not completed onboarding.
 */
export const GET = withAuth(async (_request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const [profile, user] = await Promise.all([
      entityRegistryService.findProfileByUserId(sessionUserId),
      prisma.user.findUnique({
        where: { id: sessionUserId },
        select: { roleConfirmed: true, password: true },
      }),
    ]);

    const roleConfirmed = user?.roleConfirmed ?? Boolean(user?.password);

    return NextResponse.json(success({
      isOnboarded: !!profile,
      roleConfirmed,
      profile: profile ?? null,
      entity: profile?.entity ?? null,
    }));
  } catch (err) {
    logger.error('entity-registry/me failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch user entity registry status'), { status: 500 });
  }
});