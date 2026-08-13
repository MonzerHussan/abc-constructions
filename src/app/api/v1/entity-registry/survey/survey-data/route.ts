import { NextRequest, NextResponse } from 'next/server';
import { entityRegistryService, saveSurveyDataSchema } from '@/modules/entity-registry';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { logger } from '@/modules/shared/utils/logger';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withAuth } from '@/lib/auth-guard';

/**
 * POST /api/v1/entity-registry/survey/survey-data
 *
 * Persists the full onboarding/market-survey answers on the authenticated
 * user's Profile (Profile.surveyData Json). The profile is resolved via
 * Profile.userId (the auth bridge) — never from the body (IDOR protection).
 */
export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = validate(saveSurveyDataSchema, body);
    if (!parsed.success) return NextResponse.json(parsed.response, { status: 422 });

    const profile = await entityRegistryService.saveSurveyData(sessionUserId, parsed.data.surveyData);
    return NextResponse.json(success({ profileId: profile.profileId, surveyData: profile.surveyData }));
  } catch (err) {
    if (err instanceof Error && err.message === 'PROFILE_NOT_FOUND') {
      return NextResponse.json(error(ErrorCodes.ENTITY_NOT_FOUND, 'Profile not found — complete onboarding first'), { status: 404 });
    }
    logger.error('save-survey-data failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to save survey data'), { status: 500 });
  }
});
