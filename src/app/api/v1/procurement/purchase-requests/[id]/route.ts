import { NextRequest, NextResponse } from 'next/server';
import { purchaseRequestService, updatePRSchema } from '@/modules/procurement';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const pr = await purchaseRequestService.findById(id);
    return NextResponse.json(success(pr));
  } catch (err) {
    if (err instanceof Error && err.message === 'PROCUREMENT_PR_NOT_FOUND') {
      return NextResponse.json(error(ErrorCodes.PROCUREMENT_PR_NOT_FOUND, 'Purchase request not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch purchase request'), { status: 500 });
  }
});

export const PUT = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = validate(updatePRSchema, body);
    if (!parsed.success) return NextResponse.json(parsed.response, { status: 422 });
    const updated = await purchaseRequestService.update(id, parsed.data, sessionUserId);
    return NextResponse.json(success(updated));
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'PROCUREMENT_PR_NOT_FOUND') {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PR_NOT_FOUND, 'Purchase request not found'), { status: 404 });
      }
      if (err.message === 'CORE_USER_FORBIDDEN') {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized to update this purchase request'), { status: 403 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to update purchase request'), { status: 500 });
  }
});

export const DELETE = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    await purchaseRequestService.delete(id, sessionUserId);
    return NextResponse.json(success({ message: 'Purchase request deleted' }));
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'PROCUREMENT_PR_NOT_FOUND') {
        return NextResponse.json(error(ErrorCodes.PROCUREMENT_PR_NOT_FOUND, 'Purchase request not found'), { status: 404 });
      }
      if (err.message === 'CORE_USER_FORBIDDEN') {
        return NextResponse.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'Not authorized to delete this purchase request'), { status: 403 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to delete purchase request'), { status: 500 });
  }
});