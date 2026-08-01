import { NextRequest, NextResponse } from 'next/server';
import { marketplaceService } from '@/modules/marketplace';
import { compareProductsQuerySchema } from '@/modules/marketplace/validators/marketplace-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = compareProductsQuerySchema.safeParse({
      productIds: searchParams.get('productIds') ?? '',
    });
    if (!parsed.success) {
      return NextResponse.json(error('VALIDATION_ERROR', 'Provide 2-4 productIds'), { status: 400 });
    }
    const products = parsed.data.productIds;
    if (products.length < 2 || products.length > 4) {
      return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_COMPARE_LIMIT_EXCEEDED, 'Compare 2 to 4 products'), { status: 400 });
    }
    const result = await marketplaceService.compareProducts({ productIds: products });
    return NextResponse.json(success(result, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error comparing products'), { status: 500 });
  }
}
