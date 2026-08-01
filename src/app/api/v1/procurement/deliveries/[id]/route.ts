import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deliveryService } from '@/modules/procurement';
import { updateDeliverySchema } from '@/modules/procurement/validators/delivery-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const delivery = await deliveryService.findById(id);
    return NextResponse.json(success(delivery, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND, 'Delivery not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching delivery'), { status: 500 });
  }
}

export async function PUT(
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
    const parsed = updateDeliverySchema.parse(body);
    const delivery = await deliveryService.update(id, parsed);
    return NextResponse.json(success(delivery, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND, 'Delivery not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_DELIVERY_CANNOT_MODIFY) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_DELIVERY_CANNOT_MODIFY, 'Can only modify delivery in SCHEDULED status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error updating delivery'), { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    await deliveryService.delete(id);
    return NextResponse.json(success({ message: 'Delivery deleted' }, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND, 'Delivery not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_DELIVERY_CANNOT_DELETE) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_DELIVERY_CANNOT_DELETE, 'Can only delete delivery in SCHEDULED status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error deleting delivery'), { status: 500 });
  }
}
