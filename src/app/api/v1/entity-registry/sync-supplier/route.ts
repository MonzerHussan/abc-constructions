import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { entityRegistryService, syncSupplierSchema } from '@/modules/entity-registry';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

/**
 * sync-supplier
 *
 * Bridges an existing SupplierProfile (Marketplace layer) to a new Entity+Profile
 * in the isolated Entity Registry via SupplierProfile.entityId (plain string, no FK).
 * Enables Data/AI analysis of suppliers through Entity/Profile only.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = validate(syncSupplierSchema, body);
    if (!parsed.success) return Response.json(parsed.response, { status: 422 });

    const result = await entityRegistryService.syncSupplier(parsed.data);
    return Response.json(success(result), { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'ENTITY_NOT_FOUND') {
      return Response.json(error(ErrorCodes.ENTITY_NOT_FOUND, 'Supplier profile not found'), { status: 404 });
    }
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to sync supplier'), { status: 500 });
  }
}
