import { NextRequest, NextResponse } from 'next/server';
import { marketplaceService } from '@/modules/marketplace';
import { supplierMatchQuerySchema } from '@/modules/marketplace/validators/marketplace-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = supplierMatchQuerySchema.safeParse({
      productId: searchParams.get('productId') ?? '',
      limit: searchParams.get('limit') ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(error('VALIDATION_ERROR', 'productId is required'), { status: 400 });
    }
    const result = await marketplaceService.matchSuppliersForProduct(parsed.data);
    return NextResponse.json(success(result, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND) {
      return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND, 'Product not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error matching suppliers'), { status: 500 });
  }
}
