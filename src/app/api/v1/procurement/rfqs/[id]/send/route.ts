import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rfqService } from '@/modules/procurement';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const rfq = await rfqService.send(id, session.user.id);
    return NextResponse.json(success(rfq, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND, 'RFQ not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION, 'Cannot send RFQ in current status'), { status: 400 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_SUPPLIER_NOT_INVITED) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_SUPPLIER_NOT_INVITED, 'Cannot send RFQ without invited suppliers'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error sending RFQ'), { status: 500 });
  }
}
