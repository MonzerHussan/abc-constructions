import { NextRequest, NextResponse } from 'next/server';
import { qualityService } from '@/modules/quality';
import { addInspectionItemSchema } from '@/modules/quality/validators/inspection-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = addInspectionItemSchema.parse(body);
    const item = await qualityService.addInspectionItem(id, parsed);
    return NextResponse.json(success(item, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.QUALITY_INSPECTION_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.QUALITY_INSPECTION_NOT_FOUND, 'Inspection not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error adding inspection item'), { status: 500 });
  }
});