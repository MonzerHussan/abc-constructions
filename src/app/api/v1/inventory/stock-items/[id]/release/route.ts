import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { inventoryService } from '@/modules/inventory';
import { z } from 'zod';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

const releaseSchema = z.object({
  quantity: z.number().positive(),
  referenceId: z.string().min(1),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const parsed = releaseSchema.parse(body);
    const stockItem = await inventoryService.releaseReservation(id, parsed.quantity, parsed.referenceId, session.user.id);
    return NextResponse.json(success(stockItem, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === InventoryErrors.STOCK_ITEM_NOT_FOUND) {
        return NextResponse.json(error(InventoryErrors.STOCK_ITEM_NOT_FOUND, 'Stock item not found'), { status: 404 });
      }
      if (err.message === InventoryErrors.INSUFFICIENT_STOCK || err.message === InventoryErrors.NEGATIVE_QUANTITY_INVALID) {
        return NextResponse.json(error(InventoryErrors.INSUFFICIENT_STOCK, 'Insufficient reserved stock'), { status: 400 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error releasing reservation'), { status: 500 });
  }
}
