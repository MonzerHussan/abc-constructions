import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/modules/inventory';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const imp = await inventoryService.findImportById(id);
    return NextResponse.json(success(imp, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === InventoryErrors.IMPORT_NOT_FOUND) {
      return NextResponse.json(error(InventoryErrors.IMPORT_NOT_FOUND, 'Import not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching import'), { status: 500 });
  }
}
