import { NextRequest, NextResponse } from 'next/server';
import { surveyConfigService } from '@/modules/survey-config';
import { updateSurveyConfigItemSchema } from '@/modules/survey-config/validators/survey-config-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withPermission } from '@/lib/auth-guard';

export const PATCH = withPermission('research.survey.edit', async (request: NextRequest, ctx) => {
  try {
    const { id } = ctx.params;
    const body = await request.json();
    const parsed = updateSurveyConfigItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        error(ErrorCodes.VALIDATION_ERROR, 'Invalid question payload', parsed.error.flatten().fieldErrors, createRequestId()),
        { status: 400 }
      );
    }
    const item = await surveyConfigService.updateItem(id, parsed.data);
    return NextResponse.json(success(item, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.SURVEY_QUESTION_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.SURVEY_QUESTION_NOT_FOUND, 'Survey question not found', undefined, createRequestId()), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error updating survey question', undefined, createRequestId()), { status: 500 });
  }
});
