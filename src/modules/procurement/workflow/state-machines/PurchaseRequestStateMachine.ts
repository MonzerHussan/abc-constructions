import { BaseStateMachine, TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { ProcurementErrors } from '@/modules/shared/errors/procurement.errors';

export type PRStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ORDERED';
export type PRTransition = 'submit' | 'approve' | 'reject' | 'order';

export const PR_TRANSITIONS: TransitionMap = {
  DRAFT: { submit: 'PENDING_APPROVAL' },
  PENDING_APPROVAL: { approve: 'APPROVED', reject: 'REJECTED' },
  APPROVED: { order: 'ORDERED' },
  REJECTED: {},
  ORDERED: {},
};

export class PurchaseRequestStateMachine extends BaseStateMachine {
  constructor(status: string = 'DRAFT') {
    super(status, PR_TRANSITIONS);
  }

  transition(transition: string): string {
    try {
      return super.transition(transition);
    } catch {
      throw new Error(ProcurementErrors.PROCUREMENT_PR_INVALID_TRANSITION);
    }
  }
}

export function getAllowedPRTransitions(status: string): string[] {
  return BaseStateMachine.getAllowedTransitions(PR_TRANSITIONS, status);
}

export function canTransitionPR(from: string, action: string): boolean {
  return BaseStateMachine.canTransition(PR_TRANSITIONS, from, action);
}

workflowEngine.register('PurchaseRequest', PurchaseRequestStateMachine, PR_TRANSITIONS);
