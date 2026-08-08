import { NextRequest, NextResponse } from 'next/server';
import { rfqService } from '@/modules/procurement';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (_request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const rfq = await rfqService.close(id, sessionUserId);
    return NextResponse.json(success(rfq, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND, 'RFQ not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION, 'Cannot close RFQ in current status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error closing RFQ'), { status: 500 });
  }
});