import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { productCatalogService } from '@/modules/product-catalog';
import { createOfferingSchema, offeringListQuerySchema } from '@/modules/product-catalog/validators/product-catalog-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = offeringListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await productCatalogService.listOfferings(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching offerings'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = createOfferingSchema.parse(body);
    const offering = await productCatalogService.createOffering(parsed, session.user.id);
    return NextResponse.json(success(offering, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ProductCatalogErrors.PRODUCT_NOT_FOUND) {
        return NextResponse.json(error(ProductCatalogErrors.PRODUCT_NOT_FOUND, 'Product not found'), { status: 404 });
      }
      if (err.message === ProductCatalogErrors.OFFERING_DUPLICATE) {
        return NextResponse.json(error(ProductCatalogErrors.OFFERING_DUPLICATE, 'Offering already exists for this product and supplier'), { status: 409 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error creating offering'), { status: 500 });
  }
}
