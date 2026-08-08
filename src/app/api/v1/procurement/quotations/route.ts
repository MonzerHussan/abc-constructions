import { NextRequest, NextResponse } from 'next/server';
import { quotationService } from '@/modules/procurement';
import { createQuotationSchema, quotationListQuerySchema } from '@/modules/procurement/validators/quotation-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = quotationListQuerySchema.parse(Object.fromEntries(searchParams));
    // VULN-02 fix: scope to user's quotations by default
    if (!query.supplierId) {
      (query as Record<string, unknown>).supplierId = sessionUserId;
    }
    const result = await quotationService.list(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching quotations'), { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = createQuotationSchema.parse(body);
    const quotation = await quotationService.create(parsed, sessionUserId);
    return NextResponse.json(success(quotation, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND, 'RFQ not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION, 'RFQ is not open for quotations'), { status: 400 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_DEADLINE_PASSED) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_DEADLINE_PASSED, 'RFQ deadline has passed'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error creating quotation'), { status: 500 });
  }
});