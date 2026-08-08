import { NextRequest, NextResponse } from 'next/server';
import { purchaseOrderService } from '@/modules/procurement';
import { createPOSchema, poListQuerySchema } from '@/modules/procurement/validators/po-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = poListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await purchaseOrderService.list(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching purchase orders'), { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = createPOSchema.parse(body);
    const po = await purchaseOrderService.create(parsed, sessionUserId);
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
});