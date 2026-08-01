import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { productCatalogService } from '@/modules/product-catalog';
import { updateVariantSchema } from '@/modules/product-catalog/validators/product-catalog-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; variantId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { variantId } = await params;
    const body = await request.json();
    const parsed = updateVariantSchema.parse(body);
    const variant = await productCatalogService.updateVariant(variantId, parsed);
    return NextResponse.json(success(variant, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ProductCatalogErrors.VARIANT_NOT_FOUND) {
      return NextResponse.json(error(ProductCatalogErrors.VARIANT_NOT_FOUND, 'Variant not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error updating variant'), { status: 500 });
  }
}
