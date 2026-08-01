import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { productCatalogService } from '@/modules/product-catalog';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; sheetId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { sheetId } = await params;
    await productCatalogService.deleteDataSheet(sheetId);
    return NextResponse.json(success({ deleted: true }, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ProductCatalogErrors.DATA_SHEET_NOT_FOUND) {
      return NextResponse.json(error(ProductCatalogErrors.DATA_SHEET_NOT_FOUND, 'Data sheet not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error deleting data sheet'), { status: 500 });
  }
}
