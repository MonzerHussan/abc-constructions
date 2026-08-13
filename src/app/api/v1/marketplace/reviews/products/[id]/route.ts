import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveOrgId } from '@/lib/rbac';
import { marketplaceService } from '@/modules/marketplace';
import { updateProductReviewSchema } from '@/modules/marketplace/validators/marketplace-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';
import { withAuth } from '@/lib/auth-guard';

export const PUT = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const orgId = await getEffectiveOrgId(sessionUserId);
    if (!orgId) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id } = params;
    const body = await request.json();
    const parsed = updateProductReviewSchema.parse(body);
    const review = await marketplaceService.updateProductReview(id, orgId, parsed);
    return NextResponse.json(success(review, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === MarketplaceErrors.MARKETPLACE_PRODUCT_REVIEW_NOT_FOUND) {
      return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_PRODUCT_REVIEW_NOT_FOUND, 'Review not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error updating review'), { status: 500 });
  }
});

export const DELETE = withAuth(async (_request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const orgId = await getEffectiveOrgId(sessionUserId);
    if (!orgId) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id } = params;
    const result = await marketplaceService.deleteProductReview(id, orgId);
    return NextResponse.json(success(result, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === MarketplaceErrors.MARKETPLACE_PRODUCT_REVIEW_NOT_FOUND) {
      return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_PRODUCT_REVIEW_NOT_FOUND, 'Review not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error deleting review'), { status: 500 });
  }
});