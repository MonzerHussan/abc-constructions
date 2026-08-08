import { NextRequest, NextResponse } from 'next/server';
import { supplierNetworkService } from '@/modules/supplier-network';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { SupplierNetworkErrors } from '@/modules/shared/errors/supplier-network.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { z } from 'zod';
import { withAuth } from '@/lib/auth-guard';

const verificationActionSchema = z.object({
  action: z.enum(['submitBasic', 'verify', 'elevateTrusted', 'elevateFlagship', 'downgrade', 'suspend']),
});

export const POST = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { action } = verificationActionSchema.parse(body);
    const result = await supplierNetworkService.transitionVerification(id, action, sessionUserId);
    return NextResponse.json(success(result, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND) {
        return NextResponse.json(error(SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND, 'Supplier profile not found'), { status: 404 });
      }
      if (err.message === SupplierNetworkErrors.SUPPLIER_PROFILE_INVALID_TRANSITION) {
        return NextResponse.json(error(SupplierNetworkErrors.SUPPLIER_PROFILE_INVALID_TRANSITION, 'Cannot perform this verification action in current state'), { status: 400 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error updating verification status'), { status: 500 });
  }
});