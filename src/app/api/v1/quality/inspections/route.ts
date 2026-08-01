import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { qualityService } from '@/modules/quality';
import { createInspectionSchema, inspectionListQuerySchema } from '@/modules/quality/validators/inspection-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = inspectionListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await qualityService.listInspections(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching inspections'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = createInspectionSchema.parse(body);
    const inspection = await qualityService.createInspection(parsed, session.user.id);
    return NextResponse.json(success(inspection, createRequestId()), { status: 201 });
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error creating inspection'), { status: 500 });
  }
}
