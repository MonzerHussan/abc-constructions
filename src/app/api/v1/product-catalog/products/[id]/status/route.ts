import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { productCatalogService } from '@/modules/product-catalog';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { z } from 'zod';

const actionSchema = z.object({
  action: z.enum(['publish', 'archive', 'draft']),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const { action } = actionSchema.parse(body);
    const result = await productCatalogService.transitionProduct(id, action, session.user.id);
    return NextResponse.json(success(result, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ProductCatalogErrors.PRODUCT_NOT_FOUND) {
        return NextResponse.json(error(ProductCatalogErrors.PRODUCT_NOT_FOUND, 'Product not found'), { status: 404 });
      }
      if (err.message === ProductCatalogErrors.PRODUCT_INVALID_TRANSITION) {
        return NextResponse.json(error(ProductCatalogErrors.PRODUCT_INVALID_TRANSITION, 'Cannot perform this action in current status'), { status: 400 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error updating product status'), { status: 500 });
  }
}
