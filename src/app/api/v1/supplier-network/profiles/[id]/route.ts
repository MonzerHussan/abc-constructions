import { NextRequest, NextResponse } from 'next/server';
import { supplierNetworkService } from '@/modules/supplier-network';
import { updateProfileSchema } from '@/modules/supplier-network/validators/supplier-network-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { SupplierNetworkErrors } from '@/modules/shared/errors/supplier-network.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (_request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const profile = await supplierNetworkService.findProfileById(id);
    return NextResponse.json(success(profile, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND) {
      return NextResponse.json(error(SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND, 'Supplier profile not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching supplier profile'), { status: 500 });
  }
});

export const PUT = withAuth(async (request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = updateProfileSchema.parse(body);
    const profile = await supplierNetworkService.updateProfile(id, parsed);
    return NextResponse.json(success(profile, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND) {
        return NextResponse.json(error(SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND, 'Supplier profile not found'), { status: 404 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error updating supplier profile'), { status: 500 });
  }
});