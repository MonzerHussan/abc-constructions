import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { inventoryService } from '@/modules/inventory';
import { createWarehouseSchema, warehouseListQuerySchema } from '@/modules/inventory/validators/inventory-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = warehouseListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await inventoryService.listWarehouses(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching warehouses'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = createWarehouseSchema.parse(body);
    const warehouse = await inventoryService.createWarehouse(parsed, session.user.id);
    return NextResponse.json(success(warehouse, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === InventoryErrors.WAREHOUSE_NAME_DUPLICATE) {
        return NextResponse.json(error(InventoryErrors.WAREHOUSE_NAME_DUPLICATE, 'Warehouse name already exists'), { status: 409 });
      }
      if (err.message === InventoryErrors.WAREHOUSE_SUPPLIER_MISMATCH) {
        return NextResponse.json(error(InventoryErrors.WAREHOUSE_SUPPLIER_MISMATCH, 'Supplier not found'), { status: 404 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error creating warehouse'), { status: 500 });
  }
}
