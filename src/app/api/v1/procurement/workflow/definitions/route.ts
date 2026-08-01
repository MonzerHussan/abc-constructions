import { auth } from '@/lib/auth';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(error(ErrorCodes.CORE_USER_UNAUTHORIZED, 'Authentication required'), { status: 401 });
    }
    const definitions = workflowEngine.listDefinitions().map((d) => ({
      name: d.name,
      entityType: d.entityType,
      initialState: d.initialState,
      states: d.states,
      transitions: d.transitions,
      terminalStates: d.terminalStates,
      guards: d.guards,
    }));
    return Response.json(success(definitions));
  } catch {
    return Response.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to list workflow definitions'), { status: 500 });
  }
}
