import { NextRequest, NextResponse } from 'next/server';
import { surveyConfigService } from '@/modules/survey-config';
import {
  createSurveyConfigItemSchema,
  surveyConfigSchema,
} from '@/modules/survey-config/validators/survey-config-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withPermission } from '@/lib/auth-guard';

export const GET = withPermission('research.survey.view', async () => {
  try {
    const config = await surveyConfigService.getConfig();
    return NextResponse.json(success(config, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching survey config', undefined, createRequestId()), { status: 500 });
  }
});

export const PUT = withPermission('research.survey.edit', async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = surveyConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        error(ErrorCodes.VALIDATION_ERROR, 'Invalid survey config payload', parsed.error.flatten().fieldErrors, createRequestId()),
        { status: 400 }
      );
    }
    await surveyConfigService.saveConfig(parsed.data);
    return NextResponse.json(success({ ok: true }, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error saving survey config', undefined, createRequestId()), { status: 500 });
  }
});

export const POST = withPermission('research.survey.edit', async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = createSurveyConfigItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        error(ErrorCodes.VALIDATION_ERROR, 'Invalid question payload', parsed.error.flatten().fieldErrors, createRequestId()),
        { status: 400 }
      );
    }
    const item = await surveyConfigService.createItem(parsed.data);
    return NextResponse.json(success(item, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.SURVEY_SECTION_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.SURVEY_SECTION_NOT_FOUND, 'Parent category not found', undefined, createRequestId()), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error creating survey question', undefined, createRequestId()), { status: 500 });
  }
});
