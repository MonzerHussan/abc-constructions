import { NextRequest, NextResponse } from 'next/server';
import { rfqService } from '@/modules/procurement';
import { updateRFQSchema } from '@/modules/procurement/validators/rfq-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (_request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const rfq = await rfqService.findById(id);
    // VULN-02 fix: restrict read to the owner; admin bypass handled in service if needed
    if (rfq.createdBy.id !== sessionUserId) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized to view this RFQ'), { status: 403 });
    }
    return NextResponse.json(success(rfq, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND, 'RFQ not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching RFQ'), { status: 500 });
  }
});

export const PUT = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = updateRFQSchema.parse(body);
    const rfq = await rfqService.update(id, parsed, sessionUserId);
    return NextResponse.json(success(rfq, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND, 'RFQ not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized to update this RFQ'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_CANNOT_MODIFY) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_CANNOT_MODIFY, 'Can only modify RFQ in DRAFT status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error updating RFQ'), { status: 500 });
  }
});

export const DELETE = withAuth(async (_request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    await rfqService.delete(id, sessionUserId);
    return NextResponse.json(success({ message: 'RFQ deleted' }, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND, 'RFQ not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.CORE_USER_FORBIDDEN) {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized to delete this RFQ'), { status: 403 });
      }
      if (err.message === ErrorCodes.PROCUREMENT_RFQ_CANNOT_DELETE) {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_RFQ_CANNOT_DELETE, 'Can only delete RFQ in DRAFT status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error deleting RFQ'), { status: 500 });
  }
});
