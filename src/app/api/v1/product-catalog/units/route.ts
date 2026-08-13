import { NextRequest, NextResponse } from 'next/server';
import { productCatalogService } from '@/modules/product-catalog';
import { createUnitSchema } from '@/modules/product-catalog/validators/product-catalog-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { createRequestId } from '@/modules/shared/utils/response-envelope';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async () => {
  try {
    const units = await productCatalogService.listUnits();
    return NextResponse.json(success(units, createRequestId()));
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error fetching units'), { status: 500 });
  }
});

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = createUnitSchema.parse(body);
    const unit = await productCatalogService.createUnit(parsed);
    return NextResponse.json(success(unit, createRequestId()), { status: 201 });
  } catch {
    return NextResponse.json(error('INTERNAL_ERROR', 'Error creating unit'), { status: 500 });
  }
});