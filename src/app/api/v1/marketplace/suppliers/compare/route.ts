import { NextRequest, NextResponse } from 'next/server';
import { marketplaceService } from '@/modules/marketplace';
import { compareSuppliersQuerySchema } from '@/modules/marketplace/validators/marketplace-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = compareSuppliersQuerySchema.safeParse({
      productId: searchParams.get('productId') ?? '',
      supplierIds: searchParams.get('supplierIds') ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(error('VALIDATION_ERROR', 'productId is required'), { status: 400 });
    }
    const result = await marketplaceService.compareSuppliers(parsed.data.productId, parsed.data.supplierIds);
    return NextResponse.json(success(result, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === MarketplaceErrors.MARKETPLACE_OFFERING_NOT_FOUND) {
      return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_OFFERING_NOT_FOUND, 'No suppliers found for this product'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error comparing suppliers'), { status: 500 });
  }
}
