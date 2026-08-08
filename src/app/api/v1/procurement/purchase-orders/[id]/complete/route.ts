import { NextRequest, NextResponse } from 'next/server';
import { purchaseOrderService } from '@/modules/procurement';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (_request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const po = await purchaseOrderService.complete(id, sessionUserId);
    return NextResponse.json(success(po, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_PO_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND, 'Purchase order not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION, 'Cannot complete PO in current status'), { status: 400 });
      }
      if (err.message === 'PROCUREMENT_PO_NOT_FULLY_DELIVERED') {
        return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Cannot complete PO with undelivered items'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error completing purchase order'), { status: 500 });
  }
});