import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/modules/inventory';
import { z } from 'zod';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

const actionSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'maintenance', 'close', 'reopen']),
});

export const POST = withAuth(async (request: NextRequest, { params, sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const parsed = actionSchema.parse(body);
    const warehouse = await inventoryService.transitionWarehouseStatus(id, parsed.action, sessionUserId);
    return NextResponse.json(success(warehouse, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === InventoryErrors.WAREHOUSE_NOT_FOUND) {
      return NextResponse.json(error(InventoryErrors.WAREHOUSE_NOT_FOUND, 'Warehouse not found'), { status: 404 });
    }
    if (err instanceof Error && err.message === InventoryErrors.WAREHOUSE_INVALID_TRANSITION) {
      return NextResponse.json(error(InventoryErrors.WAREHOUSE_INVALID_TRANSITION, 'Invalid status transition'), { status: 400 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error transitioning warehouse status'), { status: 500 });
  }
});