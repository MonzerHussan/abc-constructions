import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deliveryService } from '@/modules/procurement';
import { createDeliverySchema, deliveryListQuerySchema } from '@/modules/procurement/validators/delivery-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = deliveryListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await deliveryService.list(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching deliveries'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = createDeliverySchema.parse(body);
    const delivery = await deliveryService.create(parsed, session.user.id);
    return NextResponse.json(success(delivery, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_PO_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND, 'Purchase order not found'), { status: 404 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error creating delivery'), { status: 500 });
  }
}
