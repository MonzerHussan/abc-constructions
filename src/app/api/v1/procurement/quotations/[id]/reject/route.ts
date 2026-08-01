import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { quotationService } from '@/modules/procurement';
import { rejectQuotationSchema } from '@/modules/procurement/validators/quotation-schemas';
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
    const body = await request.json();
    const parsed = rejectQuotationSchema.parse(body);
    const quotation = await quotationService.reject(id, session.user.id, parsed);
    return NextResponse.json(success(quotation, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND, 'Quotation not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized to reject quotations for this RFQ'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION, 'Cannot reject quotation in current status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error rejecting quotation'), { status: 500 });
  }
}
