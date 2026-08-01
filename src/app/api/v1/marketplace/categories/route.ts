import { NextRequest, NextResponse } from 'next/server';
import { marketplaceService } from '@/modules/marketplace';
import { categoryNavigationQuerySchema } from '@/modules/marketplace/validators/marketplace-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = categoryNavigationQuerySchema.parse(Object.fromEntries(searchParams));
    const categories = await marketplaceService.getCategories(query);
    return NextResponse.json(success(categories, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching categories'), { status: 500 });
  }
}
