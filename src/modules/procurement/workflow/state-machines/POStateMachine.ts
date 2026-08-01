import { BaseStateMachine, TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export type POStatus = 'DRAFT' | 'ISSUED' | 'ACKNOWLEDGED' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
export type POTransition = 'issue' | 'acknowledge' | 'receive' | 'complete' | 'cancel';

const PO_TRANSITIONS: TransitionMap = {
  DRAFT: { issue: 'ISSUED' },
  ISSUED: { acknowledge: 'ACKNOWLEDGED', cancel: 'CANCELLED' },
  ACKNOWLEDGED: { receive: 'PARTIALLY_RECEIVED', complete: 'COMPLETED', cancel: 'CANCELLED' },
  PARTIALLY_RECEIVED: { complete: 'COMPLETED' },
  COMPLETED: {},
  CANCELLED: {},
};

export class POStateMachine extends BaseStateMachine {
  constructor(status: string = 'DRAFT') {
    super(status, PO_TRANSITIONS);
  }

  transition(transition: string): string {
    try {
      return super.transition(transition);
    } catch {
      throw new Error(ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION);
    }
  }
}

export function getAllowedPOTransitions(status: string): string[] {
  return BaseStateMachine.getAllowedTransitions(PO_TRANSITIONS, status);
}

export function canTransitionPO(from: string, action: string): boolean {
  return BaseStateMachine.canTransition(PO_TRANSITIONS, from, action);
}

workflowEngine.register('PO', POStateMachine, PO_TRANSITIONS);
