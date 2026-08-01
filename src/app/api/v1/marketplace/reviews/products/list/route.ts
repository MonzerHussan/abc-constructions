import { NextRequest, NextResponse } from 'next/server';
import { marketplaceService } from '@/modules/marketplace';
import { reviewListQuerySchema } from '@/modules/marketplace/validators/marketplace-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') ?? '';
    if (!productId) {
      return NextResponse.json(error('VALIDATION_ERROR', 'productId is required'), { status: 400 });
    }
    const query = reviewListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await marketplaceService.listProductReviews(productId, query);
    return NextResponse.json(success(result, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching reviews'), { status: 500 });
  }
}
