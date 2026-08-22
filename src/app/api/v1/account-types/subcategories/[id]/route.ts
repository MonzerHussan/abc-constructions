import { NextRequest, NextResponse } from 'next/server';
import {
  accountTypeSubcategoryService,
  updateAccountSubcategorySchema,
} from '@/modules/account-types';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withPermission } from '@/lib/auth-guard';

export const PATCH = withPermission('research.survey.edit', async (request: NextRequest, { params }) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateAccountSubcategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        error(ErrorCodes.VALIDATION_ERROR, 'Invalid payload', parsed.error.flatten().fieldErrors, createRequestId()),
        { status: 400 },
      );
    }
    const item = await accountTypeSubcategoryService.update(id, parsed.data);
    return NextResponse.json(success(item, createRequestId()));
  } catch {
    return NextResponse.json(
      error(ErrorCodes.INTERNAL_ERROR, 'Failed to update subcategory', undefined, createRequestId()),
      { status: 500 },
    );
  }
});

export const DELETE = withPermission('research.survey.edit', async (_request: NextRequest, { params }) => {
  try {
    const { id } = await params;
    await accountTypeSubcategoryService.delete(id);
    return NextResponse.json(success({ ok: true }, createRequestId()));
  } catch {
    return NextResponse.json(
      error(ErrorCodes.INTERNAL_ERROR, 'Failed to delete subcategory', undefined, createRequestId()),
      { status: 500 },
    );
  }
});
