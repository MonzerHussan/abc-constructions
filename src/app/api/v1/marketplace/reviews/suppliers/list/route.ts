import { NextRequest, NextResponse } from 'next/server';
import { marketplaceService } from '@/modules/marketplace';
import { reviewListQuerySchema } from '@/modules/marketplace/validators/marketplace-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId') ?? '';
    if (!supplierId) {
      return NextResponse.json(error('VALIDATION_ERROR', 'supplierId is required'), { status: 400 });
    }
    const query = reviewListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await marketplaceService.listSupplierReviews(supplierId, query);
    return NextResponse.json(success(result, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching reviews'), { status: 500 });
  }
}
