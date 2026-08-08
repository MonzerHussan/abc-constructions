import { NextRequest, NextResponse } from 'next/server';
import { rfqService } from '@/modules/procurement';
import { inviteSupplierSchema } from '@/modules/procurement/validators/rfq-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = inviteSupplierSchema.parse(body);
    const supplier = await rfqService.inviteSupplier(id, parsed.supplierId, sessionUserId);
    return NextResponse.json(success(supplier, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND, 'RFQ not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_CANNOT_MODIFY) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_CANNOT_MODIFY, 'Cannot invite suppliers after RFQ is sent'), { status: 400 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_SUPPLIER_ALREADY_INVITED) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_SUPPLIER_ALREADY_INVITED, 'Supplier already invited'), { status: 409 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error inviting supplier'), { status: 500 });
  }
});