import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/modules/inventory';
import { updateWarehouseSchema } from '@/modules/inventory/validators/inventory-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (_request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const warehouse = await inventoryService.findWarehouseById(id);
    return NextResponse.json(success(warehouse, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === InventoryErrors.WAREHOUSE_NOT_FOUND) {
      return NextResponse.json(error(InventoryErrors.WAREHOUSE_NOT_FOUND, 'Warehouse not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching warehouse'), { status: 500 });
  }
});

export const PUT = withAuth(async (request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = updateWarehouseSchema.parse(body);
    const warehouse = await inventoryService.updateWarehouse(id, parsed);
    return NextResponse.json(success(warehouse, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === InventoryErrors.WAREHOUSE_NOT_FOUND) {
      return NextResponse.json(error(InventoryErrors.WAREHOUSE_NOT_FOUND, 'Warehouse not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error updating warehouse'), { status: 500 });
  }
});