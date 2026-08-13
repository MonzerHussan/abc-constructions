import { NextRequest, NextResponse } from 'next/server';
import { qualityService } from '@/modules/quality';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const inspectionId = searchParams.get('inspectionId') ?? undefined;
    const certificates = await qualityService.listCertificates(inspectionId);
    return NextResponse.json(success(certificates, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching certificates'), { status: 500 });
  }
});