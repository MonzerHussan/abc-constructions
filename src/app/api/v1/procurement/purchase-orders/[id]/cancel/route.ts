import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { purchaseOrderService } from '@/modules/procurement';
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
    const body = await request.json().catch(() => ({}));
    const po = await purchaseOrderService.cancel(id, session.user.id, body.reason);
    return NextResponse.json(success(po, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_PO_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND, 'Purchase order not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION, 'Cannot cancel PO in current status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error cancelling purchase order'), { status: 500 });
  }
}
