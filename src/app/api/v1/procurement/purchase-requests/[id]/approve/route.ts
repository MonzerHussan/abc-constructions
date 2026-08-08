import { NextRequest, NextResponse } from 'next/server';
import { purchaseRequestService, approvePRSchema } from '@/modules/procurement';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = validate(approvePRSchema, body);
    if (!parsed.success) return NextResponse.json(parsed.response, { status: 422 });
    const updated = await purchaseRequestService.approve(id, parsed.data, sessionUserId);
    return NextResponse.json(success(updated));
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'PROCUREMENT_PR_NOT_FOUND') {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PR_NOT_FOUND, 'Purchase request not found'), { status: 404 });
      }
      if (err.message === 'PROCUREMENT_PR_ALREADY_APPROVED') {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PR_ALREADY_APPROVED, 'Already approved'), { status: 409 });
      }
      if (err.message === 'PROCUREMENT_PR_ALREADY_REJECTED') {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PR_ALREADY_REJECTED, 'Already rejected'), { status: 409 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to approve purchase request'), { status: 500 });
  }
});