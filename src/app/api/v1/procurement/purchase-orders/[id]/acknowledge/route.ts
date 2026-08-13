import { NextRequest, NextResponse } from 'next/server';
import { purchaseOrderService } from '@/modules/procurement';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (_request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const po = await purchaseOrderService.acknowledge(id, sessionUserId);
    return NextResponse.json(success(po, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_PO_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND, 'Purchase order not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Only the supplier can acknowledge'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION, 'Cannot acknowledge PO in current status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error acknowledging purchase order'), { status: 500 });
  }
});