import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { entityRegistryService, updateEntitySchema } from '@/modules/entity-registry';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ entityId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const { entityId } = await params;
    const body = await request.json();
    const parsed = validate(updateEntitySchema, body);
    if (!parsed.success) return Response.json(parsed.response, { status: 422 });

    const updated = await entityRegistryService.updateEntity(entityId, parsed.data);
    return Response.json(success(updated));
  } catch (err) {
    if (err instanceof Error && err.message === 'ENTITY_NOT_FOUND') {
      return Response.json(error(ErrorCodes.ENTITY_NOT_FOUND, 'Entity not found'), { status: 404 });
    }
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to update entity'), { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ entityId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const { entityId } = await params;
    const entity = await entityRegistryService.findEntityById(entityId);
    return Response.json(success(entity));
  } catch (err) {
    if (err instanceof Error && err.message === 'ENTITY_NOT_FOUND') {
      return Response.json(error(ErrorCodes.ENTITY_NOT_FOUND, 'Entity not found'), { status: 404 });
    }
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch entity'), { status: 500 });
  }
}
