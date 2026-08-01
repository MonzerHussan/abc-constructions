import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { qualityService } from '@/modules/quality';
import { updateInspectionSchema } from '@/modules/quality/validators/inspection-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inspection = await qualityService.findInspectionById(id);
    return NextResponse.json(success(inspection, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.QUALITY_INSPECTION_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.QUALITY_INSPECTION_NOT_FOUND, 'Inspection not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching inspection'), { status: 500 });
  }
}

export async function PUT(
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
    const parsed = updateInspectionSchema.parse(body);
    const inspection = await qualityService.updateInspection(id, parsed);
    return NextResponse.json(success(inspection, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.QUALITY_INSPECTION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.QUALITY_INSPECTION_NOT_FOUND, 'Inspection not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.QUALITY_INSPECTION_CANNOT_MODIFY) {
        return NextResponse.json(error(ErrorCodes.QUALITY_INSPECTION_CANNOT_MODIFY, 'Can only modify inspection in PENDING status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error updating inspection'), { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    await qualityService.deleteInspection(id);
    return NextResponse.json(success({ message: 'Inspection deleted' }, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ErrorCodes.QUALITY_INSPECTION_NOT_FOUND) {
        return NextResponse.json(error(ErrorCodes.QUALITY_INSPECTION_NOT_FOUND, 'Inspection not found'), { status: 404 });
      }
      if (err.message === ErrorCodes.QUALITY_INSPECTION_CANNOT_DELETE) {
        return NextResponse.json(error(ErrorCodes.QUALITY_INSPECTION_CANNOT_DELETE, 'Can only delete inspection in PENDING status'), { status: 400 });
      }
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error deleting inspection'), { status: 500 });
  }
}
