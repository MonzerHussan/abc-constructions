import { NextRequest, NextResponse } from 'next/server';
import { onboardingSurveyService } from '@/modules/onboarding-survey';
import { ensureOnboardingSurveyTemplatesSeeded } from '@/modules/onboarding-survey/seed/seed-templates';
import { isPlatformAccountType } from '@/lib/account-types';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

/** GET /api/v1/onboarding/survey/template?accountType=INDIVIDUAL&lang=ar */
export async function GET(request: NextRequest) {
  try {
    try {
      await ensureOnboardingSurveyTemplatesSeeded();
    } catch {
      /* seed is best-effort; existing templates still load */
    }

    const accountType = request.nextUrl.searchParams.get('accountType') ?? '';
    const langParam = request.nextUrl.searchParams.get('lang') ?? 'ar';
    const lang = langParam === 'en' || langParam === 'ur' ? langParam : 'ar';

    if (!isPlatformAccountType(accountType)) {
      return NextResponse.json(
        error(ErrorCodes.VALIDATION_ERROR, 'accountType is required', undefined, createRequestId()),
        { status: 400 },
      );
    }

    const template = await onboardingSurveyService.getTemplate(accountType, lang);
    if (!template) {
      return NextResponse.json(
        error(ErrorCodes.NOT_FOUND, 'Survey template not found', undefined, createRequestId()),
        { status: 404 },
      );
    }

    return NextResponse.json(success(template));
  } catch (err) {
    return NextResponse.json(
      error(ErrorCodes.INTERNAL_ERROR, err instanceof Error ? err.message : 'Failed to load template'),
      { status: 500 },
    );
  }
}
