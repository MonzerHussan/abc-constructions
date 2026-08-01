import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { inventoryService } from '@/modules/inventory';
import { updateStockItemSchema } from '@/modules/inventory/validators/inventory-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const stockItem = await inventoryService.findStockItemById(id);
    return NextResponse.json(success(stockItem, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === InventoryErrors.STOCK_ITEM_NOT_FOUND) {
      return NextResponse.json(error(InventoryErrors.STOCK_ITEM_NOT_FOUND, 'Stock item not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching stock item'), { status: 500 });
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
    const parsed = updateStockItemSchema.parse(body);
    const stockItem = await inventoryService.updateStockItem(id, parsed);
    return NextResponse.json(success(stockItem, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === InventoryErrors.STOCK_ITEM_NOT_FOUND) {
      return NextResponse.json(error(InventoryErrors.STOCK_ITEM_NOT_FOUND, 'Stock item not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error updating stock item'), { status: 500 });
  }
}
