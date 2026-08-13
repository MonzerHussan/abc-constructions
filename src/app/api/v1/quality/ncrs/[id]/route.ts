import { NextRequest, NextResponse } from 'next/server';
import { qualityService } from '@/modules/quality';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (_request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const ncr = await qualityService.findNCRById(id);
    return NextResponse.json(success(ncr, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.QUALITY_NCR_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.QUALITY_NCR_NOT_FOUND, 'NCR not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching NCR'), { status: 500 });
  }
});