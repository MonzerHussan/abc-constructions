import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { invoicingService } from '@/modules/invoicing';
import { createInvoiceSchema, invoiceListQuerySchema } from '@/modules/invoicing/validators/invoice-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = invoiceListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await invoicingService.listInvoices(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching invoices'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = createInvoiceSchema.parse(body);
    const invoice = await invoicingService.createInvoice(parsed, session.user.id);
    return NextResponse.json(success(invoice, createRequestId()), { status: 201 });
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error creating invoice'), { status: 500 });
  }
}