import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { inventoryService } from '@/modules/inventory';
import { z } from 'zod';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

const countSchema = z.object({
  physicalQty: z.number().nonnegative(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const parsed = countSchema.parse(body);
    const stockItem = await inventoryService.countStock(id, parsed.physicalQty, session.user.id);
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
}
