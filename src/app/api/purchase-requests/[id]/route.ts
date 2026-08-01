import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { purchaseRequestService } from '@/modules/procurement';
import { updatePRSchema } from '@/modules/procurement/validators/purchase-request-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pr = await purchaseRequestService.findById(id);
    return Response.json(success(pr));
  } catch (err) {
    if (err instanceof Error && err.message === 'PROCUREMENT_PR_NOT_FOUND') {
      return Response.json(error(ErrorCodes.PROCUREMENT_PR_NOT_FOUND, 'طلب الشراء غير موجود'), { status: 404 });
    }
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'حدث خطأ أثناء جلب طلب الشراء'), { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'يجب تسجيل الدخول أولاً'), { status: 401 });
    }
    const body = await request.json();
    const parsed = validate(updatePRSchema, body);
    if (!parsed.success) return Response.json(parsed.response, { status: 422 });
    const updated = await purchaseRequestService.update(id, parsed.data, session.user.id);
    return Response.json(success(updated));
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'PROCUREMENT_PR_NOT_FOUND') {
        return Response.json(error(ErrorCodes.PROCUREMENT_PR_NOT_FOUND, 'طلب الشراء غير موجود'), { status: 404 });
      }
      if (err.message === 'CORE_USER_FORBIDDEN') {
        return Response.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'غير مصرح لك بتعديل طلب الشراء هذا'), { status: 403 });
      }
    }
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'حدث خطأ أثناء تحديث طلب الشراء'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'يجب تسجيل الدخول أولاً'), { status: 401 });
    }
    await purchaseRequestService.delete(id, session.user.id);
    return Response.json(success({ message: 'تم حذف طلب الشراء بنجاح' }));
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'PROCUREMENT_PR_NOT_FOUND') {
        return Response.json(error(ErrorCodes.PROCUREMENT_PR_NOT_FOUND, 'طلب الشراء غير موجود'), { status: 404 });
      }
      if (err.message === 'CORE_USER_FORBIDDEN') {
        return Response.json(error(ErrorCodes.CORE_USER_FORBIDDEN, 'غير مصرح لك بحذف طلب الشراء هذا'), { status: 403 });
      }
    }
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'حدث خطأ أثناء حذف طلب الشراء'), { status: 500 });
  }
}
