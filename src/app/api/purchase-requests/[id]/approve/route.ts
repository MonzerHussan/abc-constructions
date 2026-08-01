import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { purchaseRequestService } from '@/modules/procurement';
import { approvePRSchema } from '@/modules/procurement/validators/purchase-request-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'يجب تسجيل الدخول أولاً'), { status: 401 });
    }
    const body = await request.json();
    const parsed = validate(approvePRSchema, body);
    if (!parsed.success) return Response.json(parsed.response, { status: 422 });
    const updated = await purchaseRequestService.approve(id, parsed.data, session.user.id);
    return Response.json(success(updated));
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'PROCUREMENT_PR_NOT_FOUND') {
        return Response.json(error(ErrorCodes.PROCUREMENT_PR_NOT_FOUND, 'طلب الشراء غير موجود'), { status: 404 });
      }
      if (err.message === 'PROCUREMENT_PR_ALREADY_APPROVED') {
        return Response.json(error(ErrorCodes.PROCUREMENT_PR_ALREADY_APPROVED, 'تمت الموافقة مسبقاً'), { status: 409 });
      }
      if (err.message === 'PROCUREMENT_PR_ALREADY_REJECTED') {
        return Response.json(error(ErrorCodes.PROCUREMENT_PR_ALREADY_REJECTED, 'تم الرفض مسبقاً'), { status: 409 });
      }
    }
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'حدث خطأ أثناء الموافقة على طلب الشراء'), { status: 500 });
  }
}
