import { NextRequest, NextResponse } from 'next/server';
import { marketplaceService } from '@/modules/marketplace';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await marketplaceService.getProductDetails(id);
    return NextResponse.json(success(product, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND) {
      return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND, 'Product not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching product'), { status: 500 });
  }
}
