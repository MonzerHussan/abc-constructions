import { NextRequest, NextResponse } from 'next/server';
import { entityRegistryService, updateEntitySchema } from '@/modules/entity-registry';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { logger } from '@/modules/shared/utils/logger';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withAuth } from '@/lib/auth-guard';

export const PATCH = withAuth(async (request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { entityId } = params;
    const body = await request.json();
    const parsed = validate(updateEntitySchema, body);
    if (!parsed.success) return NextResponse.json(parsed.response, { status: 422 });

    const updated = await entityRegistryService.updateEntity(entityId, parsed.data);
    return NextResponse.json(success(updated));
  } catch (err) {
    if (err instanceof Error && err.message === 'ENTITY_NOT_FOUND') {
      return NextResponse.json(error(ErrorCodes.ENTITY_NOT_FOUND, 'Entity not found'), { status: 404 });
    }
    logger.error('update-entity failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to update entity'), { status: 500 });
  }
});

export const GET = withAuth(async (_request: NextRequest, { params }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const { entityId } = params;
    const entity = await entityRegistryService.findEntityById(entityId);
    return NextResponse.json(success(entity));
  } catch (err) {
    if (err instanceof Error && err.message === 'ENTITY_NOT_FOUND') {
      return NextResponse.json(error(ErrorCodes.ENTITY_NOT_FOUND, 'Entity not found'), { status: 404 });
    }
    logger.error('fetch-entity failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch entity'), { status: 500 });
  }
});