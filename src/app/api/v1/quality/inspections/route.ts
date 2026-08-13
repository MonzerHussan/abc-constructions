import { NextRequest, NextResponse } from 'next/server';
import { qualityService } from '@/modules/quality';
import { createInspectionSchema, inspectionListQuerySchema } from '@/modules/quality/validators/inspection-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = inspectionListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await qualityService.listInspections(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching inspections'), { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = createInspectionSchema.parse(body);
    const inspection = await qualityService.createInspection(parsed, sessionUserId);
    return NextResponse.json(success(inspection, createRequestId()), { status: 201 });
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error creating inspection'), { status: 500 });
  }
});