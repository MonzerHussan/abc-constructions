import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEffectiveOrgId } from '@/lib/rbac';
import { marketplaceService } from '@/modules/marketplace';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ supplierId: string }> }) {
  try {
    const session = await auth();
    const orgId = session?.user?.id ? await getEffectiveOrgId(session.user.id) : null;
    if (!orgId) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { supplierId } = await params;
    const result = await marketplaceService.removeFavoriteSupplier(orgId, supplierId);
    return NextResponse.json(success(result, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === MarketplaceErrors.MARKETPLACE_FAVORITE_SUPPLIER_NOT_FOUND) {
      return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_FAVORITE_SUPPLIER_NOT_FOUND, 'Favorite not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error removing favorite supplier'), { status: 500 });
  }
}
