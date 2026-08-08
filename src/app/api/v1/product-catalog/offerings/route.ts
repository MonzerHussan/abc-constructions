import { NextRequest, NextResponse } from 'next/server';
import { productCatalogService } from '@/modules/product-catalog';
import { createOfferingSchema, offeringListQuerySchema } from '@/modules/product-catalog/validators/product-catalog-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = offeringListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await productCatalogService.listOfferings(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching offerings'), { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = createOfferingSchema.parse(body);
    const offering = await productCatalogService.createOffering(parsed, sessionUserId);
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
});