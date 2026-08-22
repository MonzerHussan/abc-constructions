import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { onboardingSurveyService } from '@/modules/onboarding-survey';
import { isPlatformAccountType } from '@/lib/account-types';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withAuth } from '@/lib/auth-guard';

const progressSchema = z.object({
  accountType: z.string(),
  currentSectionCode: z.string().nullable().optional(),
  answers: z.record(z.string(), z.unknown()).default({}),
  skippedSections: z.array(z.string()).optional(),
  completedSections: z.array(z.string()).optional(),
  isComplete: z.boolean().optional(),
});

export const GET = withAuth(async (_req, { sessionUserId }) => {
  try {
    const progress = await onboardingSurveyService.getProgress(sessionUserId);
    return NextResponse.json(success(progress));
  } catch (err) {
    return NextResponse.json(
      error(ErrorCodes.INTERNAL_ERROR, err instanceof Error ? err.message : 'Failed to load progress'),
      { status: 500 },
    );
  }
});

export const PUT = withAuth(async (request: NextRequest, { sessionUserId }) => {
  try {
    const body = await request.json();
    const parsed = progressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        error(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
        { status: 422 },
      );
    }

    if (!isPlatformAccountType(parsed.data.accountType)) {
      return NextResponse.json(error(ErrorCodes.VALIDATION_ERROR, 'Invalid accountType'), { status: 400 });
    }

    const saved = await onboardingSurveyService.saveProgress(sessionUserId, {
      accountType: parsed.data.accountType,
      currentSectionCode: parsed.data.currentSectionCode ?? null,
      answers: parsed.data.answers,
      skippedSections: parsed.data.skippedSections,
      completedSections: parsed.data.completedSections,
      isComplete: parsed.data.isComplete,
    });

    return NextResponse.json(success(saved));
  } catch (err) {
    return NextResponse.json(
      error(ErrorCodes.INTERNAL_ERROR, err instanceof Error ? err.message : 'Failed to save progress'),
      { status: 500 },
    );
  }
});
