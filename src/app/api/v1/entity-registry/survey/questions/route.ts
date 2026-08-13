import { NextRequest, NextResponse } from 'next/server';
import { entityRegistryService, createOnboardingQuestionSchema, onboardingQuestionListQuerySchema } from '@/modules/entity-registry';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { logger } from '@/modules/shared/utils/logger';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withAuth, withPermission } from '@/lib/auth-guard';

export const POST = withPermission('research.survey.edit', async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = validate(createOnboardingQuestionSchema, body);
    if (!parsed.success) return NextResponse.json(parsed.response, { status: 422 });

    const question = await entityRegistryService.createOnboardingQuestion(parsed.data);
    return NextResponse.json(success(question), { status: 201 });
  } catch (err) {
    logger.error('create-onboarding-question failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to create onboarding question'), { status: 500 });
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = validate(onboardingQuestionListQuerySchema, {
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      answerType: searchParams.get('answerType') ?? undefined,
      isActive: searchParams.get('isActive') ?? undefined,
    });
    if (!parsed.success) return NextResponse.json(parsed.response, { status: 422 });

    const { items, total, page, limit } = await entityRegistryService.listOnboardingQuestions(parsed.data);
    return NextResponse.json(successPaginated(items, { page, limit, total }));
  } catch (err) {
    logger.error('list-onboarding-questions failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to list onboarding questions'), { status: 500 });
  }
});
