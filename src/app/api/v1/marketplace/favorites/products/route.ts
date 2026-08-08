import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveOrgId } from '@/lib/rbac';
import { marketplaceService } from '@/modules/marketplace';
import { addFavoriteProductSchema, favoriteListQuerySchema } from '@/modules/marketplace/validators/marketplace-schemas';
import { success, successPaginated, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const orgId = await getEffectiveOrgId(sessionUserId);
    if (!orgId) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Organization required'), { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const query = favoriteListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await marketplaceService.listFavoriteProducts(orgId, query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching favorite products'), { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const orgId = await getEffectiveOrgId(sessionUserId);
    if (!orgId) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = addFavoriteProductSchema.parse(body);
    const favorite = await marketplaceService.addFavoriteProduct(orgId, parsed);
    return NextResponse.json(success(favorite, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND) {
        return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND, 'Product not found'), { status: 404 });
      }
      if (err.message === MarketplaceErrors.MARKETPLACE_FAVORITE_PRODUCT_EXISTS) {
        return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_FAVORITE_PRODUCT_EXISTS, 'Product already in favorites'), { status: 409 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error adding favorite'), { status: 500 });
  }
});