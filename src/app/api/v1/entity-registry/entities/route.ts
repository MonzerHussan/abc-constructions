import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { entityRegistryService, createEntitySchema, entityListQuerySchema } from '@/modules/entity-registry';
import { success, successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { logger } from '@/modules/shared/utils/logger';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = validate(createEntitySchema, body);
    if (!parsed.success) return Response.json(parsed.response, { status: 422 });

    const entity = await entityRegistryService.createEntity(parsed.data);
    return Response.json(success(entity), { status: 201 });
  } catch (err) {
    logger.error('create-entity failed', { error: err instanceof Error ? err.message : String(err) });
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to create entity'), { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
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
    if (!parsed.success) return Response.json(parsed.response, { status: 422 });

    const { items, total, page, limit } = await entityRegistryService.listEntities(parsed.data);
    return Response.json(successPaginated(items, { page, limit, total }));
  } catch (err) {
    logger.error('list-entities failed', { error: err instanceof Error ? err.message : String(err) });
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to list entities'), { status: 500 });
  }
}
