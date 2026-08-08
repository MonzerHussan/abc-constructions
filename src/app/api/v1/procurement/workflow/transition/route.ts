import { NextRequest, NextResponse } from 'next/server';
import { procurementWorkflowOrchestrator } from '@/modules/procurement/services/ProcurementWorkflowOrchestrator';
import { workflowTransitionSchema } from '@/modules/procurement/validators/workflow-schemas';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { validate } from '@/modules/shared/utils/validation';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withAuth } from '@/lib/auth-guard';

const BLOCKED_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const CONFLICT_STATUS = 409;

export const POST = withAuth(async (request: NextRequest, { sessionUserId }: { sessionUserId: string; params: Record<string, string> }) => {
  try {
    const body = await request.json();
    const parsed = validate(workflowTransitionSchema, body);
    if (!parsed.success) return NextResponse.json(parsed.response, { status: 422 });

    const { entityType, entityId, action, reason, metadata } = parsed.data;
    const result = await procurementWorkflowOrchestrator.execute(entityType, action, {
      entityId,
      actorId: sessionUserId,
      actorRole: undefined,
      reason,
      metadata,
    });

    if (result.result === 'BLOCKED_BY_GUARD') {
      return NextResponse.json(
        error(ErrorCodes.CORE_USER_FORBIDDEN, `Transition blocked by guard${result.blockedBy ? `: ${result.blockedBy}` : ''}`, { reason: result.reason }),
        { status: BLOCKED_STATUS },
      );
    }
    if (result.result === 'INVALID_TRANSITION') {
      return NextResponse.json(error(ErrorCodes.WORKFLOW_INVALID_TRANSITION, `Invalid transition: ${action}`), { status: CONFLICT_STATUS });
    }

    return NextResponse.json(success(result));
  } catch (err) {
    if (err instanceof Error && err.message === 'WORKFLOW_INSTANCE_NOT_FOUND') {
      return NextResponse.json(error(ErrorCodes.WORKFLOW_INSTANCE_NOT_FOUND, 'Workflow instance not found'), { status: NOT_FOUND_STATUS });
    }
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to execute workflow transition'), { status: 500 });
  }
});