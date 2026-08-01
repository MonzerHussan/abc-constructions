import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supplierNetworkService } from '@/modules/supplier-network';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { SupplierNetworkErrors } from '@/modules/shared/errors/supplier-network.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { z } from 'zod';

const verificationActionSchema = z.object({
  action: z.enum(['submitBasic', 'verify', 'elevateTrusted', 'elevateFlagship', 'downgrade', 'suspend']),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const { action } = verificationActionSchema.parse(body);
    const result = await supplierNetworkService.transitionVerification(id, action, session.user.id);
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
}
