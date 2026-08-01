import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deliveryService } from '@/modules/procurement';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const delivery = await deliveryService.dispatch(id);
    return NextResponse.json(success(delivery, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND, 'Delivery not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_DELIVERY_INVALID_TRANSITION) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_DELIVERY_INVALID_TRANSITION, 'Cannot dispatch delivery in current status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error dispatching delivery'), { status: 500 });
  }
}
