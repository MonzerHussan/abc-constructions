import { BaseStateMachine, TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export type RFQStatus = 'DRAFT' | 'SENT' | 'OPEN' | 'AWARDED' | 'CLOSED' | 'CANCELLED';
export type RFQTransition = 'submit' | 'send' | 'award' | 'close' | 'cancel';

const RFQ_TRANSITIONS: TransitionMap = {
  DRAFT: { submit: 'SENT', cancel: 'CANCELLED' },
  SENT: { send: 'OPEN', cancel: 'CANCELLED' },
  OPEN: { award: 'AWARDED', cancel: 'CANCELLED' },
  AWARDED: { close: 'CLOSED' },
  CLOSED: {},
  CANCELLED: {},
};

export class RFQStateMachine extends BaseStateMachine {
  constructor(status: string = 'DRAFT') {
    super(status, RFQ_TRANSITIONS);
  }

  transition(transition: string): string {
    try {
      return super.transition(transition);
    } catch {
      throw new Error(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION);
    }
  }
}

export function getAllowedRFQTransitions(status: string): string[] {
  return BaseStateMachine.getAllowedTransitions(RFQ_TRANSITIONS, status);
}

export function canTransitionRFQ(from: string, action: string): boolean {
  return BaseStateMachine.canTransition(RFQ_TRANSITIONS, from, action);
}

workflowEngine.register('RFQ', RFQStateMachine, RFQ_TRANSITIONS);
