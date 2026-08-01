import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { purchaseRequestService, approvePRSchema } from '@/modules/procurement';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = validate(approvePRSchema, body);
    if (!parsed.success) return Response.json(parsed.response, { status: 422 });
    const updated = await purchaseRequestService.approve(id, parsed.data, session.user.id);
    return Response.json(success(updated));
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'PROCUREMENT_PR_NOT_FOUND') {
        return Response.json(error(ErrorCodes.PROCUREMENT_PR_NOT_FOUND, 'Purchase request not found'), { status: 404 });
      }
      if (err.message === 'PROCUREMENT_PR_ALREADY_APPROVED') {
        return Response.json(error(ErrorCodes.PROCUREMENT_PR_ALREADY_APPROVED, 'Already approved'), { status: 409 });
      }
      if (err.message === 'PROCUREMENT_PR_ALREADY_REJECTED') {
        return Response.json(error(ErrorCodes.PROCUREMENT_PR_ALREADY_REJECTED, 'Already rejected'), { status: 409 });
      }
    }
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to approve purchase request'), { status: 500 });
  }
}
