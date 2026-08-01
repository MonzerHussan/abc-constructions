import type { WorkflowContext } from './WorkflowContext';

export interface WorkflowGuardContext {
  entityId: string;
  entityType: string;
  action: string;
  fromStatus: string;
  toStatus: string;
  actorId?: string;
  actorRole?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowGuardResult {
  allowed: boolean;
  reason?: string;
}

export type WorkflowGuard = (ctx: WorkflowGuardContext) => WorkflowGuardResult | Promise<WorkflowGuardResult>;
