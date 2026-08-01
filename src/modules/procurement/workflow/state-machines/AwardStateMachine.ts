import { BaseStateMachine, TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { ProcurementErrors } from '@/modules/shared/errors/procurement.errors';

export type AwardStatus = 'PENDING_ACCEPTANCE' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
export type AwardTransition = 'accept' | 'decline' | 'cancel';

export const AWARD_TRANSITIONS: TransitionMap = {
  PENDING_ACCEPTANCE: { accept: 'ACCEPTED', decline: 'DECLINED', cancel: 'CANCELLED' },
  ACCEPTED: {},
  DECLINED: {},
  CANCELLED: {},
};

export class AwardStateMachine extends BaseStateMachine {
  constructor(status: string = 'PENDING_ACCEPTANCE') {
    super(status, AWARD_TRANSITIONS);
  }

  transition(transition: string): string {
    try {
      return super.transition(transition);
    } catch {
      throw new Error(ProcurementErrors.PROCUREMENT_AWARD_INVALID_TRANSITION);
    }
  }
}

export function getAllowedAwardTransitions(status: string): string[] {
  return BaseStateMachine.getAllowedTransitions(AWARD_TRANSITIONS, status);
}

export function canTransitionAward(from: string, action: string): boolean {
  return BaseStateMachine.canTransition(AWARD_TRANSITIONS, from, action);
}

workflowEngine.register('Award', AwardStateMachine, AWARD_TRANSITIONS);
