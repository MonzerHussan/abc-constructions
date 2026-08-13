import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/modules/inventory';
import { createTransactionSchema, transactionListQuerySchema } from '@/modules/inventory/validators/inventory-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = transactionListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await inventoryService.listTransactions(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching transactions'), { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = createTransactionSchema.parse(body);
    const result = await inventoryService.createTransaction(parsed, sessionUserId);
    return NextResponse.json(success(result.txRecord, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === InventoryErrors.STOCK_ITEM_NOT_FOUND) {
        return NextResponse.json(error(InventoryErrors.STOCK_ITEM_NOT_FOUND, 'Stock item not found'), { status: 404 });
      }
      if (err.message === InventoryErrors.INSUFFICIENT_AVAILABLE_STOCK || err.message === InventoryErrors.INSUFFICIENT_STOCK || err.message === InventoryErrors.NEGATIVE_QUANTITY_INVALID || err.message === InventoryErrors.INVALID_TRANSACTION_TYPE) {
        return NextResponse.json(error('VALIDATION_ERROR', 'Invalid transaction'), { status: 400 });
      }
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error creating transaction'), { status: 500 });
  }
});