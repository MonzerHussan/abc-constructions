import { NextRequest, NextResponse } from 'next/server';
import { evaluationService } from '@/modules/procurement';
import { createApprovalSchema, approveDecisionSchema } from '@/modules/procurement/validators/evaluation-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();

    if (body.action) {
      const parsed = approveDecisionSchema.parse(body);
      const approval = await evaluationService.decideApproval(id, sessionUserId, parsed);
      return NextResponse.json(success(approval, createRequestId()));
    }

    const parsed = createApprovalSchema.parse(body);
    const approval = await evaluationService.requestApproval(id, sessionUserId, parsed);
    return NextResponse.json(success(approval, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_EVALUATION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_EVALUATION_NOT_FOUND, 'Evaluation not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_EVALUATION_INVALID_TRANSITION) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_EVALUATION_INVALID_TRANSITION, 'Evaluation must be completed before approval'), { status: 400 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_APPROVAL_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_APPROVAL_NOT_FOUND, 'Approval request not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_APPROVAL_ALREADY_PROCESSED) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_APPROVAL_ALREADY_PROCESSED, 'Approval already processed'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error processing approval'), { status: 500 });
  }
});