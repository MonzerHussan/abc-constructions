import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { evaluationService } from '@/modules/procurement';
import { createCriteriaSchema, updateCriterionSchema } from '@/modules/procurement/validators/evaluation-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rfqId = searchParams.get('rfqId') || undefined;
    const criteria = await evaluationService.listCriteria(rfqId);
    return NextResponse.json(success(criteria, createRequestId()));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error fetching criteria'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = createCriteriaSchema.parse(body);
    const criteria = await evaluationService.createCriteria(parsed);
    return NextResponse.json(success(criteria, createRequestId()), { status: 201 });
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error creating criteria'), { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Criterion ID is required'), { status: 400 });
    }
    const body = await request.json();
    const parsed = updateCriterionSchema.parse(body);
    const criterion = await evaluationService.updateCriterion(id, parsed);
    return NextResponse.json(success(criterion, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.PROCUREMENT_CRITERION_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.PROCUREMENT_CRITERION_NOT_FOUND, 'Criterion not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error updating criterion'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Criterion ID is required'), { status: 400 });
    }
    await evaluationService.deleteCriterion(id);
    return NextResponse.json(success({ message: 'Criterion deleted' }, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ErrorCodes.PROCUREMENT_CRITERION_NOT_FOUND) {
      return NextResponse.json(error(ErrorCodes.PROCUREMENT_CRITERION_NOT_FOUND, 'Criterion not found'), { status: 404 });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Error deleting criterion'), { status: 500 });
  }
}
