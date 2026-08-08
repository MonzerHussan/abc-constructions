import { NextRequest, NextResponse } from 'next/server';
import { supplierNetworkService } from '@/modules/supplier-network';
import { createProfileSchema, profileListQuerySchema } from '@/modules/supplier-network/validators/supplier-network-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { SupplierNetworkErrors } from '@/modules/shared/errors/supplier-network.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = profileListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await supplierNetworkService.listProfiles(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching supplier profiles'), { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = createProfileSchema.parse(body);
    const profile = await supplierNetworkService.createProfile(parsed, sessionUserId);
    return NextResponse.json(success(profile, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === SupplierNetworkErrors.SUPPLIER_PROFILE_ALREADY_EXISTS) {
        return NextResponse.json(error(SupplierNetworkErrors.SUPPLIER_PROFILE_ALREADY_EXISTS, 'Profile already exists'), { status: 409 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error creating supplier profile'), { status: 500 });
  }
});