import { NextRequest, NextResponse } from 'next/server';
import { deliveryService } from '@/modules/procurement';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (_request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const delivery = await deliveryService.markInTransit(id);
    return NextResponse.json(success(delivery, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND, 'Delivery not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_DELIVERY_INVALID_TRANSITION) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_DELIVERY_INVALID_TRANSITION, 'Cannot mark delivery in transit in current status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error marking delivery in transit'), { status: 500 });
  }
});