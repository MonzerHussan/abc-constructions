import { NextRequest, NextResponse } from 'next/server';
import {
  accountTypeSubcategoryService,
  createAccountSubcategorySchema,
  platformAccountTypeSchema,
} from '@/modules/account-types';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withPermission } from '@/lib/auth-guard';
import type { PlatformAccountType } from '@/lib/account-types';

export const GET = withPermission('research.survey.view', async (request: NextRequest) => {
  try {
    const accountTypeParam = request.nextUrl.searchParams.get('accountType');
    const accountType = accountTypeParam
      ? platformAccountTypeSchema.safeParse(accountTypeParam)
      : null;

    const items = await accountTypeSubcategoryService.listAdmin(
      accountType?.success ? (accountType.data as PlatformAccountType) : undefined,
    );
    return NextResponse.json(success({ items }, createRequestId()));
  } catch {
    return NextResponse.json(
      error(ErrorCodes.INTERNAL_ERROR, 'Failed to load subcategories', undefined, createRequestId()),
      { status: 500 },
    );
  }
});

export const POST = withPermission('research.survey.edit', async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = createAccountSubcategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        error(ErrorCodes.VALIDATION_ERROR, 'Invalid payload', parsed.error.flatten().fieldErrors, createRequestId()),
        { status: 400 },
      );
    }
    const item = await accountTypeSubcategoryService.create(parsed.data);
    return NextResponse.json(success(item, createRequestId()), { status: 201 });
  } catch {
    return NextResponse.json(
      error(ErrorCodes.INTERNAL_ERROR, 'Failed to create subcategory', undefined, createRequestId()),
      { status: 500 },
    );
  }
});
