import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { invoicingService } from '@/modules/invoicing';
import { rejectInvoiceSchema } from '@/modules/invoicing/validators/invoice-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const parsed = rejectInvoiceSchema.parse(body);
    const result = await invoicingService.rejectInvoice(id, parsed, session.user.id);
    return NextResponse.json(success(result, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error rejecting invoice'), { status: 500 });
  }
}