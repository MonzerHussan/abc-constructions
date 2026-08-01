import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { invoicingService } from '@/modules/invoicing';
import { updateInvoiceSchema } from '@/modules/invoicing/validators/invoice-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const invoice = await invoicingService.findInvoiceById(id);
    return NextResponse.json(success(invoice, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INVOICING_INVOICE_NOT_FOUND, 'Invoice not found'), { status: 404 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const parsed = updateInvoiceSchema.parse(body);
    const result = await invoicingService.updateInvoice(id, parsed, session.user.id);
    return NextResponse.json(success(result, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error updating invoice'), { status: 500 });
  }
}