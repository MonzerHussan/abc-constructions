import { NextResponse } from 'next/server';
import { surveyConfigService } from '@/modules/survey-config';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

/** Public read-only survey categories for onboarding (no auth). */
export async function GET() {
  try {
    const config = await surveyConfigService.getPublicConfig();
    return NextResponse.json(success(config, createRequestId()));
  } catch {
    return NextResponse.json(
      error(ErrorCodes.INTERNAL_ERROR, 'Error fetching survey config', undefined, createRequestId()),
      { status: 500 },
    );
  }
}
