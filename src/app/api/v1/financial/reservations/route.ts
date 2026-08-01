import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { financialTrustService } from '@/modules/financial';
import { createReservationSchema, reservationListQuerySchema } from '@/modules/financial/validators/financial-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = reservationListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await financialTrustService.listReservations(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching reservations'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = createReservationSchema.parse(body);
    const reservation = await financialTrustService.createReservation(parsed, session.user.id);
    return NextResponse.json(success(reservation, createRequestId()), { status: 201 });
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error creating reservation'), { status: 500 });
  }
}
