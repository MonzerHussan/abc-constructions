import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { purchaseOrderService } from '@/modules/procurement';
import { createPOSchema, poListQuerySchema } from '@/modules/procurement/validators/po-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = poListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await purchaseOrderService.list(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching purchase orders'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = createPOSchema.parse(body);
    const po = await purchaseOrderService.create(parsed, session.user.id);
    return NextResponse.json(success(po, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND, 'Quotation not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Supplier mismatch with quotation'), { status: 403 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error creating purchase order'), { status: 500 });
  }
}
