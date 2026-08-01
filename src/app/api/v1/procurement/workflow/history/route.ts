import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { procurementWorkflowOrchestrator } from '@/modules/procurement/services/ProcurementWorkflowOrchestrator';
import { workflowHistoryQuerySchema } from '@/modules/procurement/validators/workflow-schemas';
import { successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const query = {
      entityType: searchParams.get('entityType') ?? undefined,
      entityId: searchParams.get('entityId') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    };
    const parsed = validate(workflowHistoryQuerySchema, query);
    if (!parsed.success) return Response.json(parsed.response, { status: 422 });

    const { entityType, entityId, page, limit } = parsed.data;
    const historyService = procurementWorkflowOrchestrator.getHistoryService();
    const { items, total } = await historyService.list({ entityType, entityId, page, limit });

    return Response.json(successPaginated(items, { page, limit, total }));
  } catch {
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to list workflow history'), { status: 500 });
  }
}
