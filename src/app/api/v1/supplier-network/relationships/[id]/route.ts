import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supplierNetworkService } from '@/modules/supplier-network';
import { updateRelationshipSchema } from '@/modules/supplier-network/validators/supplier-network-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { SupplierNetworkErrors } from '@/modules/shared/errors/supplier-network.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const parsed = updateRelationshipSchema.parse(body);
    const relationship = await supplierNetworkService.updateRelationship(id, parsed);
    return NextResponse.json(success(relationship, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === SupplierNetworkErrors.SUPPLIER_RELATIONSHIP_NOT_FOUND) {
      return NextResponse.json(error(SupplierNetworkErrors.SUPPLIER_RELATIONSHIP_NOT_FOUND, 'Relationship not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error updating relationship'), { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id } = await params;
    await supplierNetworkService.deleteRelationship(id);
    return NextResponse.json(success({ deleted: true }, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === SupplierNetworkErrors.SUPPLIER_RELATIONSHIP_NOT_FOUND) {
      return NextResponse.json(error(SupplierNetworkErrors.SUPPLIER_RELATIONSHIP_NOT_FOUND, 'Relationship not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error deleting relationship'), { status: 500 });
  }
}
