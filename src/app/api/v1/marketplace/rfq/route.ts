import { NextRequest, NextResponse } from 'next/server';
import { marketplaceService } from '@/modules/marketplace';
import { createRfqFromMarketplaceSchema } from '@/modules/marketplace/validators/marketplace-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = createRfqFromMarketplaceSchema.parse(body);
    const rfq = await marketplaceService.createRfqFromMarketplace(parsed, sessionUserId);
    return NextResponse.json(success(rfq, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND) {
        return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND, 'Product not found'), { status: 404 });
      }
      if (err.message === MarketplaceErrors.MARKETPLACE_PRODUCT_OUT_OF_STOCK) {
        return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_PRODUCT_OUT_OF_STOCK, 'Product has no active offerings'), { status: 400 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error creating RFQ'), { status: 500 });
  }
});