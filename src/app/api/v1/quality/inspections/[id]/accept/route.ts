import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { qualityService } from '@/modules/quality';
import { createCertificateSchema } from '@/modules/quality/validators/inspection-schemas';
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
    const body = await request.json().catch(() => ({}));
    const parsed = createCertificateSchema.parse(body);
    const result = await qualityService.acceptInspection(id, parsed, session.user.id);
    return NextResponse.json(success(result, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.QUALITY_INSPECTION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.QUALITY_INSPECTION_NOT_FOUND, 'Inspection not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.QUALITY_INSPECTION_INVALID_TRANSITION) {
        return NextResponse.json(error(ErrorCodes.QUALITY_INSPECTION_INVALID_TRANSITION, 'Cannot accept inspection in current status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error accepting inspection'), { status: 500 });
  }
}
