import { NextRequest, NextResponse } from 'next/server';
import { surveyConfigService } from '@/modules/survey-config';
import { reorderSurveyConfigSchema } from '@/modules/survey-config/validators/survey-config-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withPermission } from '@/lib/auth-guard';

export const PUT = withPermission('research.survey.edit', async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = reorderSurveyConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        error(ErrorCodes.VALIDATION_ERROR, 'Invalid reorder payload', parsed.error.flatten().fieldErrors, createRequestId()),
        { status: 400 }
      );
    }
    await surveyConfigService.reorder(parsed.data);
    return NextResponse.json(success({ ok: true }, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.SURVEY_QUESTION_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.SURVEY_QUESTION_NOT_FOUND, 'One or more questions not found', undefined, createRequestId()), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error reordering survey questions', undefined, createRequestId()), { status: 500 });
  }
});
