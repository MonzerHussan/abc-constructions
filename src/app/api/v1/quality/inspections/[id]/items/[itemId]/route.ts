import { NextRequest, NextResponse } from 'next/server';
import { qualityService } from '@/modules/quality';
import { updateInspectionItemSchema } from '@/modules/quality/validators/inspection-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const PUT = withAuth(async (request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id, itemId } = params;
    const body = await request.json();
    const parsed = updateInspectionItemSchema.parse(body);
    const item = await qualityService.updateInspectionItem(id, itemId, parsed);
    return NextResponse.json(success(item, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.QUALITY_INSPECTION_ITEM_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.QUALITY_INSPECTION_ITEM_NOT_FOUND, 'Inspection item not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error updating inspection item'), { status: 500 });
  }
});