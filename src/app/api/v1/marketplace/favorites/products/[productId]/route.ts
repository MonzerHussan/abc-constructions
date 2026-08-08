import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveOrgId } from '@/lib/rbac';
import { marketplaceService } from '@/modules/marketplace';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';
import { withAuth } from '@/lib/auth-guard';

export const DELETE = withAuth(async (_request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const orgId = await getEffectiveOrgId(sessionUserId);
    if (!orgId) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { productId } = params;
    const result = await marketplaceService.removeFavoriteProduct(orgId, productId);
    return NextResponse.json(success(result, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === MarketplaceErrors.MARKETPLACE_FAVORITE_PRODUCT_NOT_FOUND) {
      return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_FAVORITE_PRODUCT_NOT_FOUND, 'Favorite not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error removing favorite'), { status: 500 });
  }
});