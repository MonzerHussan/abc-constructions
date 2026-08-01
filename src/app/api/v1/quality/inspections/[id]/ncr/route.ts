import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { qualityService } from '@/modules/quality';
import { createNCRSchema } from '@/modules/quality/validators/inspection-schemas';
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
    const body = await request.json();
    const parsed = createNCRSchema.parse(body);
    const ncr = await qualityService.createNCR(id, parsed, session.user.id);
    return NextResponse.json(success(ncr, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.QUALITY_INSPECTION_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.QUALITY_INSPECTION_NOT_FOUND, 'Inspection not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error creating NCR'), { status: 500 });
  }
}
