import { NextRequest, NextResponse } from 'next/server';
import { supplierNetworkService } from '@/modules/supplier-network';
import { updateCapabilitySchema } from '@/modules/supplier-network/validators/supplier-network-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { SupplierNetworkErrors } from '@/modules/shared/errors/supplier-network.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const PUT = withAuth(async (request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = updateCapabilitySchema.parse(body);
    const capability = await supplierNetworkService.updateCapability(id, parsed);
    return NextResponse.json(success(capability, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === SupplierNetworkErrors.SUPPLIER_CAPABILITY_NOT_FOUND) {
      return NextResponse.json(error(SupplierNetworkErrors.SUPPLIER_CAPABILITY_NOT_FOUND, 'Capability not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error updating capability'), { status: 500 });
  }
});