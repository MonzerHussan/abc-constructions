import type { WorkflowContext } from './WorkflowContext';
import type { WorkflowGuard, WorkflowGuardContext, WorkflowGuardResult } from './WorkflowGuard';

export interface WorkflowGuardContextWithEntity extends WorkflowGuardContext {
  entityId: string;
  entityType: string;
  action: string;
  fromStatus: string;
  toStatus: string;
  actorId?: string;
  actorRole?: string;
  metadata?: Record<string, unknown>;
}

const guards = new Map<string, WorkflowGuard>();

export function registerGuard(name: string, guard: WorkflowGuard): void {
  guards.set(name, guard);
}

export function getGuard(name: string): WorkflowGuard | undefined {
  return guards.get(name);
}

export function hasGuard(name: string): boolean {
  return guards.has(name);
}

export function listGuards(): string[] {
  return [...guards.keys()];
}

export async function runGuards(names: string[], ctx: WorkflowGuardContextWithEntity): Promise<WorkflowGuardResult[]> {
  const results: WorkflowGuardResult[] = [];
  for (const name of names) {
    const guard = guards.get(name);
    if (!guard) {
      results.push({ allowed: false, reason: `UNKNOWN_GUARD:${name}` });
      continue;
    }
    results.push(await guard(ctx));
  }
  return results;
}

export function createAuthorizationGuard(allowedRoles: string[]): (ctx: WorkflowGuardContext) => WorkflowGuardResult {
  return (ctx) => {
    if (!ctx.actorRole) return { allowed: false, reason: 'MISSING_ACTOR_ROLE' };
    if (!allowedRoles.includes(ctx.actorRole)) {
      return { allowed: false, reason: `ROLE_NOT_ALLOWED:${ctx.actorRole}` };
    }
    return { allowed: true };
  };
}

export function createDeadlineGuard(
  deadlineProvider: (ctx: WorkflowGuardContext) => Date | null,
): (ctx: WorkflowGuardContext) => WorkflowGuardResult {
  return (ctx) => {
    const deadline = deadlineProvider(ctx);
    if (!deadline) return { allowed: true };
    if (Date.now() > deadline.getTime()) {
      return { allowed: false, reason: 'DEADLINE_PASSED' };
    }
    return { allowed: true };
  };
}

export function createCompletenessGuard(
  requiredFields: string[],
  fieldProvider: (ctx: WorkflowGuardContext) => Record<string, unknown>,
): (ctx: WorkflowGuardContext) => WorkflowGuardResult {
  return (ctx) => {
    const data = fieldProvider(ctx);
    const missing = requiredFields.filter((field) => data[field] == null);
    if (missing.length > 0) {
      return { allowed: false, reason: `MISSING_FIELDS:${missing.join(',')}` };
    }
    return { allowed: true };
  };
}

export function buildGuardContext(
  ctx: WorkflowContext,
  action: string,
  fromStatus: string,
  toStatus: string,
): WorkflowGuardContextWithEntity {
  return {
    entityId: ctx.entityId,
    entityType: ctx.entityType ?? 'UNKNOWN',
    action,
    fromStatus,
    toStatus,
    actorId: ctx.userId,
    actorRole: ctx.actorRole,
    metadata: ctx.metadata,
  };
}
