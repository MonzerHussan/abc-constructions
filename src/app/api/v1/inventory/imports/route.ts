import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { inventoryService } from '@/modules/inventory';
import { createImportSchema, importListQuerySchema } from '@/modules/inventory/validators/inventory-schemas';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = importListQuerySchema.parse(Object.fromEntries(searchParams));
    const result = await inventoryService.listImports(query);
    return NextResponse.json(successPaginated(result.items, { page: result.page, limit: result.limit, total: result.total }, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching imports'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = createImportSchema.parse(body);
    const imp = await inventoryService.createImport(parsed, session.user.id);
    return NextResponse.json(success(imp, createRequestId()), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === InventoryErrors.WAREHOUSE_SUPPLIER_MISMATCH) {
      return NextResponse.json(error(InventoryErrors.WAREHOUSE_SUPPLIER_MISMATCH, 'Supplier not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error creating import'), { status: 500 });
  }
}
