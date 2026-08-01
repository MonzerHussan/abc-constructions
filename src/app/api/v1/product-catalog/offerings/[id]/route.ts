import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { productCatalogService } from '@/modules/product-catalog';
import { updateOfferingSchema } from '@/modules/product-catalog/validators/product-catalog-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const offering = await productCatalogService.findOfferingById(id);
    return NextResponse.json(success(offering, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ProductCatalogErrors.OFFERING_NOT_FOUND) {
      return NextResponse.json(error(ProductCatalogErrors.OFFERING_NOT_FOUND, 'Offering not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching offering'), { status: 500 });
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
    const parsed = updateOfferingSchema.parse(body);
    const offering = await productCatalogService.updateOffering(id, parsed);
    return NextResponse.json(success(offering, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === ProductCatalogErrors.OFFERING_NOT_FOUND) {
        return NextResponse.json(error(ProductCatalogErrors.OFFERING_NOT_FOUND, 'Offering not found'), { status: 404 });
      }
      if (err.message === ProductCatalogErrors.OFFERING_PRICE_INVALID) {
        return NextResponse.json(error(ProductCatalogErrors.OFFERING_PRICE_INVALID, 'Invalid price'), { status: 400 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error updating offering'), { status: 500 });
  }
}
