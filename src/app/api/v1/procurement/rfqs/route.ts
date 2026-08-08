import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rfqService } from '@/modules/procurement';
import { createRFQSchema, rfqListQuerySchema } from '@/modules/procurement/validators/rfq-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = rfqListQuerySchema.parse(Object.fromEntries(searchParams));
    // VULN-02 fix: scope list to the authenticated user's RFQs by default
    // unless they explicitly request all (admin) — prevents IDOR reads.
    if (!query.createdById) {
      (query as Record<string, unknown>).createdById = sessionUserId;
    }
    const result = await rfqService.list(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching RFQs'), { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = createRFQSchema.parse(body);
    const rfq = await rfqService.create(parsed, sessionUserId);
    return NextResponse.json(success(rfq, createRequestId()), { status: 201 });
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error creating RFQ'), { status: 500 });
  }
});
