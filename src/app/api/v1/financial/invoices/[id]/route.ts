import { NextRequest, NextResponse } from 'next/server';
import { invoicingService } from '@/modules/invoicing';
import { updateInvoiceSchema } from '@/modules/invoicing/validators/invoice-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (_request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const invoice = await invoicingService.findInvoiceById(id);
    return NextResponse.json(success(invoice, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INVOICING_INVOICE_NOT_FOUND, 'Invoice not found'), { status: 404 });
  }
});

export const PUT = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = updateInvoiceSchema.parse(body);
    const result = await invoicingService.updateInvoice(id, parsed, sessionUserId);
    return NextResponse.json(success(result, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error updating invoice'), { status: 500 });
  }
});