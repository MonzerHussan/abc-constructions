import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { financialTrustService } from '@/modules/financial';
import { holdReservationSchema } from '@/modules/financial/validators/financial-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = holdReservationSchema.parse(body);
    const result = await financialTrustService.holdReservation(id, parsed, session.user.id);
    return NextResponse.json(success(result, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.FINANCIAL_RESERVATION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.FINANCIAL_RESERVATION_NOT_FOUND, 'Reservation not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.FINANCIAL_RESERVATION_INVALID_TRANSITION) {
        return NextResponse.json(error(ErrorCodes.FINANCIAL_RESERVATION_INVALID_TRANSITION, 'Cannot hold reservation in current status'), { status: 400 });
      }
      if (err.message === ErrorCodes.FINANCIAL_RESERVATION_EXCEEDS_TOTAL) {
        return NextResponse.json(error(ErrorCodes.FINANCIAL_RESERVATION_EXCEEDS_TOTAL, 'Hold amount exceeds total'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error holding reservation'), { status: 500 });
  }
}
