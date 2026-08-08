import { NextRequest, NextResponse } from 'next/server';
import { entityRegistryService, createEntitySchema, entityListQuerySchema } from '@/modules/entity-registry';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { logger } from '@/modules/shared/utils/logger';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withAuth } from '@/lib/auth-guard';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const parsed = validate(createEntitySchema, body);
    if (!parsed.success) return NextResponse.json(parsed.response, { status: 422 });

    const entity = await entityRegistryService.createEntity(parsed.data);
    return NextResponse.json(success(entity), { status: 201 });
  } catch (err) {
    logger.error('create-entity failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to create entity'), { status: 500 });
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = validate(entityListQuerySchema, {
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      entityType: searchParams.get('entityType') ?? undefined,
      entitySubtype: searchParams.get('entitySubtype') ?? undefined,
      crmClassification: searchParams.get('crmClassification') ?? undefined,
      relationshipStatus: searchParams.get('relationshipStatus') ?? undefined,
      source: searchParams.get('source') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    });
    if (!parsed.success) return NextResponse.json(parsed.response, { status: 422 });

    const { items, total, page, limit } = await entityRegistryService.listEntities(parsed.data);
    return NextResponse.json(successPaginated(items, { page, limit, total }));
  } catch (err) {
    logger.error('list-entities failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to list entities'), { status: 500 });
  }
});