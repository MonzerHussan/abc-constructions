import { NextRequest, NextResponse } from 'next/server';
import { purchaseRequestService } from '@/modules/procurement';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const updated = await purchaseRequestService.submit(id, sessionUserId);
    return NextResponse.json(success(updated));
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'PROCUREMENT_PR_NOT_FOUND') {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PR_NOT_FOUND, 'Purchase request not found'), { status: 404 });
      }
      if (err.message === 'CORE_USER_FORBIDDEN') {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized'), { status: 403 });
      }
      if (err.message === 'PROCUREMENT_PR_ALREADY_SUBMITTED') {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PR_ALREADY_SUBMITTED, 'Already submitted'), { status: 409 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to submit purchase request'), { status: 500 });
  }
});