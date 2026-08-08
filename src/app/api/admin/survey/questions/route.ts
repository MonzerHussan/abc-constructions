import { NextRequest, NextResponse } from 'next/server';
import { surveyQuestionService } from '@/modules/survey';
import {
  createSurveyQuestionSchema,
  surveyQuestionListQuerySchema,
} from '@/modules/survey/validators/question-schemas';
import { success, successPaginated, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withPermission } from '@/lib/auth-guard';

export const GET = withPermission('research.survey.view', async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = surveyQuestionListQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json(
        error(ErrorCodes.VALIDATION_ERROR, 'Invalid query parameters', parsed.error.flatten().fieldErrors, createRequestId()),
        { status: 400 }
      );
    }
    const result = await surveyQuestionService.list(parsed.data);
    return NextResponse.json(
      successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId())
    );
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching survey questions', undefined, createRequestId()), { status: 500 });
  }
});

export const POST = withPermission('research.survey.edit', async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = createSurveyQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        error(ErrorCodes.VALIDATION_ERROR, 'Invalid question payload', parsed.error.flatten().fieldErrors, createRequestId()),
        { status: 400 }
      );
    }
    const question = await surveyQuestionService.create(parsed.data);
    return NextResponse.json(success(question, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.SURVEY_SECTION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.SURVEY_SECTION_NOT_FOUND, 'Survey section not found', undefined, createRequestId()), { status: 404 });
      }
      if (err.message === ErrorCodes.SURVEY_QUESTION_VALIDATION) {
        return NextResponse.json(error(ErrorCodes.SURVEY_QUESTION_VALIDATION, 'Choice questions require at least 2 options', undefined, createRequestId()), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error creating survey question', undefined, createRequestId()), { status: 500 });
  }
});
