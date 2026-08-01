import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { productCatalogService } from '@/modules/product-catalog';
import { createProductSchema, productListQuerySchema } from '@/modules/product-catalog/validators/product-catalog-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = productListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await productCatalogService.listProducts(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching products'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = createProductSchema.parse(body);
    const product = await productCatalogService.createProduct(parsed, session.user.id);
    return NextResponse.json(success(product, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ProductCatalogErrors.PRODUCT_SKU_DUPLICATE) {
        return NextResponse.json(error(ProductCatalogErrors.PRODUCT_SKU_DUPLICATE, 'SKU already exists'), { status: 409 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error creating product'), { status: 500 });
  }
}
