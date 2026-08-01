import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { productCatalogService } from '@/modules/product-catalog';
import { createVariantSchema } from '@/modules/product-catalog/validators/product-catalog-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const parsed = createVariantSchema.parse({ ...body, productId: id });
    const variant = await productCatalogService.createVariant(parsed);
    return NextResponse.json(success(variant, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ProductCatalogErrors.PRODUCT_NOT_FOUND) {
        return NextResponse.json(error(ProductCatalogErrors.PRODUCT_NOT_FOUND, 'Product not found'), { status: 404 });
      }
      if (err.message === ProductCatalogErrors.VARIANT_SKU_DUPLICATE) {
        return NextResponse.json(error(ProductCatalogErrors.VARIANT_SKU_DUPLICATE, 'Variant SKU already exists'), { status: 409 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error creating variant'), { status: 500 });
  }
}
