import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/modules/inventory';
import { updateImportStatusSchema } from '@/modules/inventory/validators/inventory-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const PATCH = withAuth(async (request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = updateImportStatusSchema.parse(body);
    const imp = await inventoryService.updateImportStatus(id, parsed);
    return NextResponse.json(success(imp, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === InventoryErrors.IMPORT_NOT_FOUND) {
      return NextResponse.json(error(InventoryErrors.IMPORT_NOT_FOUND, 'Import not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error updating import status'), { status: 500 });
  }
});