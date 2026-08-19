import { NextRequest, NextResponse } from 'next/server';
import { accountTypeSubcategoryService } from '@/modules/account-types';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { isPlatformAccountType } from '@/lib/account-types';
import type { PlatformAccountType } from '@/lib/account-types';

export async function GET(request: NextRequest) {
  try {
    const accountTypeParam = request.nextUrl.searchParams.get('accountType');
    if (!accountTypeParam || !isPlatformAccountType(accountTypeParam)) {
      return NextResponse.json(
        error(ErrorCodes.VALIDATION_ERROR, 'accountType query param is required', undefined, createRequestId()),
        { status: 400 },
      );
    }

    const items = await accountTypeSubcategoryService.listPublic(accountTypeParam as PlatformAccountType);
    return NextResponse.json(success({ items }, createRequestId()));
  } catch {
    return NextResponse.json(
      error(ErrorCodes.INTERNAL_ERROR, 'Failed to load subcategories', undefined, createRequestId()),
      { status: 500 },
    );
  }
}
