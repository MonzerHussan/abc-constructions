import { NextRequest, NextResponse } from 'next/server';
import { marketplaceService } from '@/modules/marketplace';
import { marketplaceSearchQuerySchema } from '@/modules/marketplace/validators/marketplace-schemas';
import { successPaginated, error, createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = marketplaceSearchQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await marketplaceService.searchProducts(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error searching products'), { status: 500 });
  }
}
