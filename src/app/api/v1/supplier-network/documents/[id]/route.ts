import { NextRequest, NextResponse } from 'next/server';
import { supplierNetworkService } from '@/modules/supplier-network';
import { verifyDocumentSchema } from '@/modules/supplier-network/validators/supplier-network-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { SupplierNetworkErrors } from '@/modules/shared/errors/supplier-network.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const PUT = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = verifyDocumentSchema.parse(body);
    const doc = await supplierNetworkService.verifyDocument(id, parsed, sessionUserId);
    return NextResponse.json(success(doc, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === SupplierNetworkErrors.SUPPLIER_DOCUMENT_NOT_FOUND) {
      return NextResponse.json(error(SupplierNetworkErrors.SUPPLIER_DOCUMENT_NOT_FOUND, 'Document not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error verifying document'), { status: 500 });
  }
});

export const DELETE = withAuth(async (_request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    await supplierNetworkService.deleteDocument(id);
    return NextResponse.json(success({ deleted: true }, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === SupplierNetworkErrors.SUPPLIER_DOCUMENT_NOT_FOUND) {
      return NextResponse.json(error(SupplierNetworkErrors.SUPPLIER_DOCUMENT_NOT_FOUND, 'Document not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error deleting document'), { status: 500 });
  }
});