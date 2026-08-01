import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { procurementWorkflowOrchestrator } from '@/modules/procurement/services/ProcurementWorkflowOrchestrator';
import { workflowTransitionSchema } from '@/modules/procurement/validators/workflow-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

const BLOCKED_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const CONFLICT_STATUS = 409;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const body = await request.json();
    const parsed = validate(workflowTransitionSchema, body);
    if (!parsed.success) return Response.json(parsed.response, { status: 422 });

    const { entityType, entityId, action, reason, metadata } = parsed.data;
    const result = await procurementWorkflowOrchestrator.execute(entityType, action, {
      entityId,
      actorId: session.user.id,
      actorRole: (session.user as { role?: string }).role,
      reason,
      metadata,
    });

    if (result.result === 'BLOCKED_BY_GUARD') {
      return Response.json(
        error(ErrorCodes.CORE_USER_FORBIDDEN, `Transition blocked by guard${result.blockedBy ? `: ${result.blockedBy}` : ''}`, { reason: result.reason }),
        { status: BLOCKED_STATUS },
      );
    }
    if (result.result === 'INVALID_TRANSITION') {
      return Response.json(error(ErrorCodes.WORKFLOW_INVALID_TRANSITION, `Invalid transition: ${action}`), { status: CONFLICT_STATUS });
    }

    return Response.json(success(result));
  } catch (err) {
    if (err instanceof Error && err.message === 'WORKFLOW_INSTANCE_NOT_FOUND') {
      return Response.json(error(ErrorCodes.WORKFLOW_INSTANCE_NOT_FOUND, 'Workflow instance not found'), { status: NOT_FOUND_STATUS });
    }
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to execute workflow transition'), { status: 500 });
  }
}
