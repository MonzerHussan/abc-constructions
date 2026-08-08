import { NextRequest, NextResponse } from 'next/server';
import { surveyQuestionService } from '@/modules/survey';
import { reorderQuestionSchema } from '@/modules/survey/validators/question-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withPermission } from '@/lib/auth-guard';

export const PATCH = withPermission('research.survey.edit', async (request: NextRequest, ctx) => {
  try {
    const { id } = ctx.params;
    const body = await request.json();
    const parsed = reorderQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        error(ErrorCodes.VALIDATION_ERROR, 'Invalid order payload', parsed.error.flatten().fieldErrors, createRequestId()),
        { status: 400 }
      );
    }
    const question = await surveyQuestionService.reorder(id, parsed.data);
    return NextResponse.json(success(question, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.SURVEY_QUESTION_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.SURVEY_QUESTION_NOT_FOUND, 'Survey question not found', undefined, createRequestId()), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error reordering survey question', undefined, createRequestId()), { status: 500 });
  }
});
