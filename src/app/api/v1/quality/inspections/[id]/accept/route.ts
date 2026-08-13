import { NextRequest, NextResponse } from 'next/server';
import { qualityService } from '@/modules/quality';
import { createCertificateSchema } from '@/modules/quality/validators/inspection-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const parsed = createCertificateSchema.parse(body);
    const result = await qualityService.acceptInspection(id, parsed, sessionUserId);
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
});