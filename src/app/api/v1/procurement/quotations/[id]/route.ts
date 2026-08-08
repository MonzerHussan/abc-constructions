import { NextRequest, NextResponse } from 'next/server';
import { quotationService } from '@/modules/procurement';
import { updateQuotationSchema } from '@/modules/procurement/validators/quotation-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (_request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const quotation = await quotationService.findById(id);
    // VULN-02 fix: restrict read to the quotation owner
    if (quotation.supplierId !== sessionUserId) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized to view this quotation'), { status: 403 });
    }
    return NextResponse.json(success(quotation, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND, 'Quotation not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching quotation'), { status: 500 });
  }
});

export const PUT = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = updateQuotationSchema.parse(body);
    const quotation = await quotationService.update(id, parsed, sessionUserId);
    return NextResponse.json(success(quotation, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND, 'Quotation not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized to update this quotation'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_QUOTATION_CANNOT_MODIFY) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_QUOTATION_CANNOT_MODIFY, 'Can only modify quotation in DRAFT status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error updating quotation'), { status: 500 });
  }
});

export const DELETE = withAuth(async (_request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    await quotationService.delete(id, sessionUserId);
    return NextResponse.json(success({ message: 'Quotation deleted' }, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND, 'Quotation not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized to delete this quotation'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_QUOTATION_CANNOT_DELETE) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_QUOTATION_CANNOT_DELETE, 'Can only delete quotation in DRAFT status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error deleting quotation'), { status: 500 });
  }
});