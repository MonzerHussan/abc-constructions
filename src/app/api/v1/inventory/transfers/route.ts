import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/modules/inventory';
import { transferStockSchema } from '@/modules/inventory/validators/inventory-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = transferStockSchema.parse(body);
    const result = await inventoryService.transferStock(parsed, sessionUserId);
    return NextResponse.json(success(result, createRequestId()), { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === InventoryErrors.STOCK_ITEM_NOT_FOUND || err.message === InventoryErrors.WAREHOUSE_NOT_FOUND) {
        return NextResponse.json(error('VALIDATION_ERROR', 'Stock or warehouse not found'), { status: 404 });
      }
      if (err.message === InventoryErrors.INSUFFICIENT_AVAILABLE_STOCK || err.message === InventoryErrors.INVALID_TRANSACTION_TYPE) {
        return NextResponse.json(error(InventoryErrors.INSUFFICIENT_AVAILABLE_STOCK, 'Insufficient available stock or invalid transfer'), { status: 400 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error transferring stock'), { status: 500 });
  }
});