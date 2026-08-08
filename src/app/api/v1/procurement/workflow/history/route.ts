import { NextRequest, NextResponse } from 'next/server';
import { procurementWorkflowOrchestrator } from '@/modules/procurement/services/ProcurementWorkflowOrchestrator';
import { workflowHistoryQuerySchema } from '@/modules/procurement/validators/workflow-schemas';
import { successPaginated, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      entityType: searchParams.get('entityType') ?? undefined,
      entityId: searchParams.get('entityId') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    };
    const parsed = validate(workflowHistoryQuerySchema, query);
    if (!parsed.success) return NextResponse.json(parsed.response, { status: 422 });

    const { entityType, entityId, page, limit } = parsed.data;
    const historyService = procurementWorkflowOrchestrator.getHistoryService();
    const { items, total } = await historyService.list({ entityType, entityId, page, limit });

    return NextResponse.json(successPaginated(items, { page, limit, total }));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to list workflow history'), { status: 500 });
  }
});