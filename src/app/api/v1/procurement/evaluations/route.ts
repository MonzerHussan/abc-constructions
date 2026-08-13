import { NextRequest, NextResponse } from 'next/server';
import { evaluationService } from '@/modules/procurement';
import { evaluationListQuerySchema, startEvaluationSchema } from '@/modules/procurement/validators/evaluation-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = evaluationListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await evaluationService.list(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching evaluations'), { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = startEvaluationSchema.parse(body);
    const evaluation = await evaluationService.start(parsed.quotationId, sessionUserId, parsed.note);
    return NextResponse.json(success(evaluation, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND, 'Quotation not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION, 'Only submitted quotations can be evaluated'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error starting evaluation'), { status: 500 });
  }
});