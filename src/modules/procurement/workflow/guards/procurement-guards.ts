import { registerGuard, createAuthorizationGuard } from '@/modules/shared/workflow/WorkflowGuards';

const ALLOWED_APPROVER_ROLES = ['BUYER', 'ADMIN', 'SUPER_ADMIN'];

export function registerProcurementGuards(): void {
  registerGuard('pr.submit.owner', async (ctx) => {
    const requesterId = ctx.metadata?.requesterId;
    if (!requesterId) return { allowed: false, reason: 'MISSING_REQUESTER' };
    if (ctx.actorId !== requesterId) return { allowed: false, reason: 'NOT_REQUESTER' };
    return { allowed: true };
  });

  registerGuard('pr.approve.rbac', createAuthorizationGuard(ALLOWED_APPROVER_ROLES));
  registerGuard('pr.reject.rbac', createAuthorizationGuard(ALLOWED_APPROVER_ROLES));
  registerGuard('pr.order.rbac', createAuthorizationGuard(ALLOWED_APPROVER_ROLES));

  registerGuard('eval.complete.completeness', async (ctx) => {
    const scoreCount = ctx.metadata?.scoreCount;
    if (typeof scoreCount !== 'number' || scoreCount < 1) {
      return { allowed: false, reason: 'NO_SCORES' };
    }
    return { allowed: true };
  });

  registerGuard('award.accept.rbac', async (ctx) => {
    const supplierId = ctx.metadata?.supplierId;
    if (!supplierId) return { allowed: false, reason: 'MISSING_SUPPLIER' };
    if (ctx.actorId !== supplierId) return { allowed: false, reason: 'NOT_SUPPLIER' };
    return { allowed: true };
  });

  registerGuard('award.decline.rbac', async (ctx) => {
    const supplierId = ctx.metadata?.supplierId;
    if (!supplierId) return { allowed: false, reason: 'MISSING_SUPPLIER' };
    if (ctx.actorId !== supplierId) return { allowed: false, reason: 'NOT_SUPPLIER' };
    return { allowed: true };
  });

  registerGuard('award.cancel.rbac', createAuthorizationGuard(ALLOWED_APPROVER_ROLES));

  registerGuard('rfq.deadline', async (ctx) => {
    const deadline = ctx.metadata?.deadlineDate;
    if (!deadline) return { allowed: true };
    const deadlineMs = deadline instanceof Date ? deadline.getTime() : new Date(String(deadline)).getTime();
    if (Number.isNaN(deadlineMs)) return { allowed: true };
    if (Date.now() > deadlineMs) return { allowed: false, reason: 'DEADLINE_PASSED' };
    return { allowed: true };
  });
}
