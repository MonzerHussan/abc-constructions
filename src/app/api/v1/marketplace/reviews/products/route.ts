import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveOrgId } from '@/lib/rbac';
import { marketplaceService } from '@/modules/marketplace';
import { createProductReviewSchema } from '@/modules/marketplace/validators/marketplace-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const orgId = await getEffectiveOrgId(sessionUserId);
    if (!orgId) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = createProductReviewSchema.parse(body);
    const review = await marketplaceService.createProductReview(orgId, parsed);
    return NextResponse.json(success(review, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND) {
        return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND, 'Product not found'), { status: 404 });
      }
      if (err.message === MarketplaceErrors.MARKETPLACE_OFFERING_NOT_FOUND) {
        return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_OFFERING_NOT_FOUND, 'Offering not found'), { status: 404 });
      }
      if (err.message === MarketplaceErrors.MARKETPLACE_PRODUCT_REVIEW_DUPLICATE) {
        return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_PRODUCT_REVIEW_DUPLICATE, 'You already reviewed this product'), { status: 409 });
      }
      if (err.message === MarketplaceErrors.MARKETPLACE_REVIEW_INVALID_RATING) {
        return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_REVIEW_INVALID_RATING, 'Rating must be 1-5'), { status: 400 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error creating review'), { status: 500 });
  }
});