import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supplierNetworkService } from '@/modules/supplier-network';
import { uploadDocumentSchema } from '@/modules/supplier-network/validators/supplier-network-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { SupplierNetworkErrors } from '@/modules/shared/errors/supplier-network.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = uploadDocumentSchema.parse(body);
    const doc = await supplierNetworkService.uploadDocument(parsed, session.user.id);
    return NextResponse.json(success(doc, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND) {
      return NextResponse.json(error(SupplierNetworkErrors.SUPPLIER_PROFILE_NOT_FOUND, 'Supplier profile not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error uploading document'), { status: 500 });
  }
}
