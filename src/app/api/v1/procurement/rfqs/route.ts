import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rfqService } from '@/modules/procurement';
import { createRFQSchema, rfqListQuerySchema } from '@/modules/procurement/validators/rfq-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = rfqListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await rfqService.list(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND, 'RFQ not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching RFQs'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = createRFQSchema.parse(body);
    const rfq = await rfqService.create(parsed, session.user.id);
    return NextResponse.json(success(rfq, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND, 'Referenced entity not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error creating RFQ'), { status: 500 });
  }
}
