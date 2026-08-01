import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEffectiveOrgId } from '@/lib/rbac';
import { marketplaceService } from '@/modules/marketplace';
import { updateSupplierReviewSchema } from '@/modules/marketplace/validators/marketplace-schemas';
import { success, error, createRequestId } from '@/modules/shared/utils/response-envelope';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const orgId = session?.user?.id ? await getEffectiveOrgId(session.user.id) : null;
    if (!orgId) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSupplierReviewSchema.parse(body);
    const review = await marketplaceService.updateSupplierReview(id, orgId, parsed);
    return NextResponse.json(success(review, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === MarketplaceErrors.MARKETPLACE_SUPPLIER_REVIEW_NOT_FOUND) {
      return NextResponse.json(error(MarketplaceErrors.MARKETPLACE_SUPPLIER_REVIEW_NOT_FOUND, 'Review not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error updating review'), { status: 500 });
  }
}
