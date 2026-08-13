import { NextRequest, NextResponse } from 'next/server';
import { quotationService } from '@/modules/procurement';
import { acceptQuotationSchema } from '@/modules/procurement/validators/quotation-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const parsed = acceptQuotationSchema.parse(body);
    const quotation = await quotationService.accept(id, sessionUserId, parsed);
    return NextResponse.json(success(quotation, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND, 'Quotation not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized to accept quotations for this RFQ'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION, 'Cannot accept quotation in current status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error accepting quotation'), { status: 500 });
  }
});