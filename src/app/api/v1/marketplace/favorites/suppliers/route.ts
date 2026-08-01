import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEffectiveOrgId } from '@/lib/rbac';
import { marketplaceService } from '@/modules/marketplace';
import { addFavoriteSupplierSchema, favoriteListQuerySchema } from '@/modules/marketplace/validators/marketplace-schemas';
import { success, successPaginated, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const orgId = session?.user?.id ? await getEffectiveOrgId(session.user.id) : null;
    if (!orgId) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Organization required'), { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const query = favoriteListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await marketplaceService.listFavoriteSuppliers(orgId, query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching favorite suppliers'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const orgId = session?.user?.id ? await getEffectiveOrgId(session.user.id) : null;
    if (!orgId) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = addFavoriteSupplierSchema.parse(body);
    const favorite = await marketplaceService.addFavoriteSupplier(orgId, parsed);
    return NextResponse.json(success(favorite, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === MarketplaceErrors.MARKETPLACE_SUPPLIER_NOT_FOUND) {
        return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_SUPPLIER_NOT_FOUND, 'Supplier not found'), { status: 404 });
      }
      if (err.message === MarketplaceErrors.MARKETPLACE_FAVORITE_SUPPLIER_EXISTS) {
        return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_FAVORITE_SUPPLIER_EXISTS, 'Supplier already in favorites'), { status: 409 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error adding favorite supplier'), { status: 500 });
  }
}
