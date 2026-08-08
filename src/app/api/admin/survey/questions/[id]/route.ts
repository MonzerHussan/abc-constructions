import { NextRequest, NextResponse } from 'next/server';
import { surveyQuestionService } from '@/modules/survey';
import { updateSurveyQuestionSchema } from '@/modules/survey/validators/question-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withPermission } from '@/lib/auth-guard';

export const GET = withPermission('research.survey.view', async (_request: NextRequest, ctx) => {
  try {
    const { id } = ctx.params;
    const question = await surveyQuestionService.get(id);
    return NextResponse.json(success(question, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.SURVEY_QUESTION_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.SURVEY_QUESTION_NOT_FOUND, 'Survey question not found', undefined, createRequestId()), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching survey question', undefined, createRequestId()), { status: 500 });
  }
});

export const PUT = withPermission('research.survey.edit', async (request: NextRequest, ctx) => {
  try {
    const { id } = ctx.params;
    const body = await request.json();
    const parsed = updateSurveyQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        error(ErrorCodes.VALIDATION_ERROR, 'Invalid question payload', parsed.error.flatten().fieldErrors, createRequestId()),
        { status: 400 }
      );
    }
    const question = await surveyQuestionService.update(id, parsed.data);
    return NextResponse.json(success(question, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.SURVEY_QUESTION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.SURVEY_QUESTION_NOT_FOUND, 'Survey question not found', undefined, createRequestId()), { status: 404 });
      }
      if (err.message === ErrorCodes.SURVEY_SECTION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.SURVEY_SECTION_NOT_FOUND, 'Survey section not found', undefined, createRequestId()), { status: 404 });
      }
      if (err.message === ErrorCodes.SURVEY_QUESTION_VALIDATION) {
        return NextResponse.json(error(ErrorCodes.SURVEY_QUESTION_VALIDATION, 'Choice questions require at least 2 options', undefined, createRequestId()), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error updating survey question', undefined, createRequestId()), { status: 500 });
  }
});

export const DELETE = withPermission('research.survey.edit', async (_request: NextRequest, ctx) => {
  try {
    const { id } = ctx.params;
    await surveyQuestionService.delete(id);
    return NextResponse.json(success({ message: 'Survey question deleted', id }, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.SURVEY_QUESTION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.SURVEY_QUESTION_NOT_FOUND, 'Survey question not found', undefined, createRequestId()), { status: 404 });
      }
      if (err.message === ErrorCodes.SURVEY_QUESTION_HAS_RESPONSES) {
        return NextResponse.json(error(ErrorCodes.SURVEY_QUESTION_HAS_RESPONSES, 'Cannot delete question with existing responses', undefined, createRequestId()), { status: 409 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error deleting survey question', undefined, createRequestId()), { status: 500 });
  }
});
