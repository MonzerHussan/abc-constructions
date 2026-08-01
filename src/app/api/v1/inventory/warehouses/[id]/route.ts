import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { inventoryService } from '@/modules/inventory';
import { updateWarehouseSchema } from '@/modules/inventory/validators/inventory-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const warehouse = await inventoryService.findWarehouseById(id);
    return NextResponse.json(success(warehouse, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === InventoryErrors.WAREHOUSE_NOT_FOUND) {
      return NextResponse.json(error(InventoryErrors.WAREHOUSE_NOT_FOUND, 'Warehouse not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching warehouse'), { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id } = await params;
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
}
