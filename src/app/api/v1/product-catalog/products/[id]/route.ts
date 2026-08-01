import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { productCatalogService } from '@/modules/product-catalog';
import { updateProductSchema } from '@/modules/product-catalog/validators/product-catalog-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await productCatalogService.findProductById(id);
    return NextResponse.json(success(product, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ProductCatalogErrors.PRODUCT_NOT_FOUND) {
      return NextResponse.json(error(ProductCatalogErrors.PRODUCT_NOT_FOUND, 'Product not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching product'), { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProductSchema.parse(body);
    const product = await productCatalogService.updateProduct(id, parsed);
    return NextResponse.json(success(product, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ProductCatalogErrors.PRODUCT_NOT_FOUND) {
      return NextResponse.json(error(ProductCatalogErrors.PRODUCT_NOT_FOUND, 'Product not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error updating product'), { status: 500 });
  }
}
