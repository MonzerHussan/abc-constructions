import { NextRequest, NextResponse } from 'next/server';
import { entityRegistryService, updateOnboardingQuestionSchema } from '@/modules/entity-registry';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { logger } from '@/modules/shared/utils/logger';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (_request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const question = await entityRegistryService.getOnboardingQuestion(id);
    return NextResponse.json(success(question));
  } catch (err) {
    if (err instanceof Error && err.message === 'ONBOARDING_QUESTION_NOT_FOUND') {
      return NextResponse.json(error(ErrorCodes.ENTITY_NOT_FOUND, 'Onboarding question not found'), { status: 404 });
    }
    logger.error('fetch-onboarding-question failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch onboarding question'), { status: 500 });
  }
});

export const PATCH = withAuth(async (request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = validate(updateOnboardingQuestionSchema, body);
    if (!parsed.success) return NextResponse.json(parsed.response, { status: 422 });

    const question = await entityRegistryService.updateOnboardingQuestion(id, parsed.data);
    return NextResponse.json(success(question));
  } catch (err) {
    if (err instanceof Error && err.message === 'ONBOARDING_QUESTION_NOT_FOUND') {
      return NextResponse.json(error(ErrorCodes.ENTITY_NOT_FOUND, 'Onboarding question not found'), { status: 404 });
    }
    logger.error('update-onboarding-question failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to update onboarding question'), { status: 500 });
  }
});

export const DELETE = withAuth(async (_request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const result = await entityRegistryService.deleteOnboardingQuestion(id);
    return NextResponse.json(success(result));
  } catch (err) {
    if (err instanceof Error && err.message === 'ONBOARDING_QUESTION_NOT_FOUND') {
      return NextResponse.json(error(ErrorCodes.ENTITY_NOT_FOUND, 'Onboarding question not found'), { status: 404 });
    }
    logger.error('delete-onboarding-question failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to delete onboarding question'), { status: 500 });
  }
});
