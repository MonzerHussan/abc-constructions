import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { purchaseOrderService } from '@/modules/procurement';
import { updatePOSchema } from '@/modules/procurement/validators/po-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const po = await purchaseOrderService.findById(id);
    return NextResponse.json(success(po, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.PROCUREMENT_PO_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND, 'Purchase order not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching purchase order'), { status: 500 });
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
    const parsed = updatePOSchema.parse(body);
    const po = await purchaseOrderService.update(id, parsed, session.user.id);
    return NextResponse.json(success(po, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_PO_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND, 'Purchase order not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_PO_CANNOT_MODIFY) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PO_CANNOT_MODIFY, 'Can only modify PO in DRAFT status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error updating purchase order'), { status: 500 });
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
    await purchaseOrderService.delete(id, session.user.id);
    return NextResponse.json(success({ message: 'Purchase order deleted' }, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_PO_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND, 'Purchase order not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_PO_CANNOT_DELETE) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PO_CANNOT_DELETE, 'Can only delete PO in DRAFT status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error deleting purchase order'), { status: 500 });
  }
}
