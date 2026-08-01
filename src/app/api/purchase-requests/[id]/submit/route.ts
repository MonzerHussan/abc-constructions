import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { purchaseRequestService } from '@/modules/procurement';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'يجب تسجيل الدخول أولاً'), { status: 401 });
    }
    const updated = await purchaseRequestService.submit(id, session.user.id);
    return Response.json(success(updated));
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'PROCUREMENT_PR_NOT_FOUND') {
        return Response.json(error(ErrorCodes.PROCUREMENT_PR_NOT_FOUND, 'طلب الشراء غير موجود'), { status: 404 });
      }
      if (err.message === 'CORE_USER_FORBIDDEN') {
        return Response.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'غير مصرح لك بتقديم طلب الشراء هذا'), { status: 403 });
      }
      if (err.message === 'PROCUREMENT_PR_ALREADY_SUBMITTED') {
        return Response.json(error(ErrorCodes.PROCUREMENT_PR_ALREADY_SUBMITTED, 'تم تقديم الطلب مسبقاً'), { status: 409 });
      }
    }
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'حدث خطأ أثناء تقديم طلب الشراء'), { status: 500 });
  }
}
