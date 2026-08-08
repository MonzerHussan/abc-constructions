import { NextResponse } from 'next/server';
import { surveyConfigService } from '@/modules/survey-config';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withPermission } from '@/lib/auth-guard';

export const GET = withPermission('research.survey.view', async () => {
  try {
    const analytics = await surveyConfigService.getAnalytics();
    return NextResponse.json(success(analytics, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching survey analytics', undefined, createRequestId()), { status: 500 });
  }
});
