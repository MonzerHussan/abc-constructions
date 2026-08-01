import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { invoicingService } from '@/modules/invoicing';
import { matchInvoiceSchema } from '@/modules/invoicing/validators/invoice-schemas';
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
    const parsed = matchInvoiceSchema.parse(body);
    const result = await invoicingService.matchInvoice(id, parsed, session.user.id);
    return NextResponse.json(success(result, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error matching invoice'), { status: 500 });
  }
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const matches = await invoicingService.getMatches(id);
    return NextResponse.json(success(matches, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching matches'), { status: 500 });
  }
}