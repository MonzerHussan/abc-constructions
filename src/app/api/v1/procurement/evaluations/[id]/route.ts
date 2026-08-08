import { NextRequest, NextResponse } from 'next/server';
import { evaluationService } from '@/modules/procurement';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (_request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const evaluation = await evaluationService.findById(id);
    return NextResponse.json(success(evaluation, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.PROCUREMENT_EVALUATION_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.PROCUREMENT_EVALUATION_NOT_FOUND, 'Evaluation not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching evaluation'), { status: 500 });
  }
});