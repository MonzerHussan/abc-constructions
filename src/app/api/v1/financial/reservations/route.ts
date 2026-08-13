import { NextRequest, NextResponse } from 'next/server';
import { financialTrustService } from '@/modules/financial';
import { createReservationSchema, reservationListQuerySchema } from '@/modules/financial/validators/financial-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = reservationListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await financialTrustService.listReservations(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching reservations'), { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = createReservationSchema.parse(body);
    const reservation = await financialTrustService.createReservation(parsed, sessionUserId);
    return NextResponse.json(success(reservation, createRequestId()), { status: 201 });
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error creating reservation'), { status: 500 });
  }
});