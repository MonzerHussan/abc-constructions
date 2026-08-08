import { NextRequest, NextResponse } from 'next/server';
import { supplierNetworkService } from '@/modules/supplier-network';
import { addCapabilitySchema } from '@/modules/supplier-network/validators/supplier-network-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { SupplierNetworkErrors } from '@/modules/shared/errors/supplier-network.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = addCapabilitySchema.parse(body);
    const capability = await supplierNetworkService.addCapability(parsed);
    return NextResponse.json(success(capability, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND) {
        return NextResponse.json(error(SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND, 'Supplier profile not found'), { status: 404 });
      }
      if (err.message === SupplierNetworkErrors.SUPPLIER_CAPABILITY_ALREADY_EXISTS) {
        return NextResponse.json(error(SupplierNetworkErrors.SUPPLIER_CAPABILITY_ALREADY_EXISTS, 'Capability already exists for this category'), { status: 409 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error adding capability'), { status: 500 });
  }
});