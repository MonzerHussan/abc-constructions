import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { evaluationService } from '@/modules/procurement';
import { submitScoresSchema } from '@/modules/procurement/validators/evaluation-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = submitScoresSchema.parse(body);
    const result = await evaluationService.submitScores(id, parsed, session.user.id);
    return NextResponse.json(success(result, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_EVALUATION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_EVALUATION_NOT_FOUND, 'Evaluation not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_EVALUATION_ALREADY_COMPLETED) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_EVALUATION_ALREADY_COMPLETED, 'Evaluation already completed'), { status: 400 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_CRITERION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_CRITERION_NOT_FOUND, 'Criterion not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_SCORE_EXCEEDS_MAX) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_SCORE_EXCEEDS_MAX, 'Score exceeds maximum'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error submitting scores'), { status: 500 });
  }
}
