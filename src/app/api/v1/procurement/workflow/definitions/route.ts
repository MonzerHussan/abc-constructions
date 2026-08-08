import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { withAuth } from '@/lib/auth-guard';

export const GET = withAuth(async () => {
  try {
    const definitions = workflowEngine.listDefinitions().map((d) => ({
      name: d.name,
      entityType: d.entityType,
      initialState: d.initialState,
      states: d.states,
      transitions: d.transitions,
      terminalStates: d.terminalStates,
      guards: d.guards,
    }));
    return NextResponse.json(success(definitions));
  } catch {
    return NextResponse.json(error(ErrorCodes.INTERNAL_ERROR, 'Failed to list workflow definitions'), { status: 500 });
  }
});