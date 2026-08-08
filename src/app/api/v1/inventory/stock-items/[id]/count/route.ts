import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/modules/inventory';
import { z } from 'zod';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

const countSchema = z.object({
  physicalQty: z.number().nonnegative(),
});

export const POST = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = countSchema.parse(body);
    const stockItem = await inventoryService.countStock(id, parsed.physicalQty, sessionUserId);
    return NextResponse.json(success(stockItem, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === InventoryErrors.STOCK_ITEM_NOT_FOUND) {
        return NextResponse.json(error(InventoryErrors.STOCK_ITEM_NOT_FOUND, 'Stock item not found'), { status: 404 });
      }
      if (err.message === InventoryErrors.NEGATIVE_QUANTITY_INVALID) {
        return NextResponse.json(error('VALIDATION_ERROR', 'Invalid quantity'), { status: 400 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error counting stock'), { status: 500 });
  }
});