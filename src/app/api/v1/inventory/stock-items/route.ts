import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { inventoryService } from '@/modules/inventory';
import { createStockItemSchema, stockItemListQuerySchema } from '@/modules/inventory/validators/inventory-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = stockItemListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await inventoryService.listStockItems(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching stock items'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = createStockItemSchema.parse(body);
    const stockItem = await inventoryService.createStockItem(parsed, session.user.id);
    return NextResponse.json(success(stockItem, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === InventoryErrors.STOCK_ITEM_DUPLICATE) {
        return NextResponse.json(error(InventoryErrors.STOCK_ITEM_DUPLICATE, 'Stock item already exists'), { status: 409 });
      }
      if (err.message === InventoryErrors.WAREHOUSE_NOT_FOUND || err.message === ProductCatalogErrors.OFFERING_NOT_FOUND || err.message === InventoryErrors.WAREHOUSE_SUPPLIER_MISMATCH) {
        return NextResponse.json(error('VALIDATION_ERROR', 'Warehouse or offering not found or mismatch'), { status: 400 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error creating stock item'), { status: 500 });
  }
}
