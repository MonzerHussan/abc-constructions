import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { productCatalogService } from '@/modules/product-catalog';
import { updateSpecificationSchema } from '@/modules/product-catalog/validators/product-catalog-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; specId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id, specId } = await params;
    const body = await request.json();
    const parsed = updateSpecificationSchema.parse(body);
    const spec = await productCatalogService.updateSpecification(id, specId, parsed);
    return NextResponse.json(success(spec, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ProductCatalogErrors.SPECIFICATION_NOT_FOUND) {
      return NextResponse.json(error(ProductCatalogErrors.SPECIFICATION_NOT_FOUND, 'Specification not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error updating specification'), { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; specId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id, specId } = await params;
    await productCatalogService.deleteSpecification(id, specId);
    return NextResponse.json(success({ deleted: true }, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ProductCatalogErrors.SPECIFICATION_NOT_FOUND) {
      return NextResponse.json(error(ProductCatalogErrors.SPECIFICATION_NOT_FOUND, 'Specification not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error deleting specification'), { status: 500 });
  }
}
