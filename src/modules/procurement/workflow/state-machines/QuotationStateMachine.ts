import { BaseStateMachine, TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export type QuotationStatus = 'DRAFT' | 'SUBMITTED' | 'WITHDRAWN' | 'ACCEPTED' | 'REJECTED';
export type QuotationTransition = 'submit' | 'withdraw' | 'accept' | 'reject';

const QUOTATION_TRANSITIONS: TransitionMap = {
  DRAFT: { submit: 'SUBMITTED' },
  SUBMITTED: { withdraw: 'WITHDRAWN', accept: 'ACCEPTED', reject: 'REJECTED' },
  WITHDRAWN: {},
  ACCEPTED: {},
  REJECTED: {},
};

export class QuotationStateMachine extends BaseStateMachine {
  constructor(status: string = 'DRAFT') {
    super(status, QUOTATION_TRANSITIONS);
  }

  transition(transition: string): string {
    try {
      return super.transition(transition);
    } catch {
      throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION);
    }
  }
}

export function getAllowedQuotationTransitions(status: string): string[] {
  return BaseStateMachine.getAllowedTransitions(QUOTATION_TRANSITIONS, status);
}

export function canTransitionQuotation(from: string, action: string): boolean {
  return BaseStateMachine.canTransition(QUOTATION_TRANSITIONS, from, action);
}

workflowEngine.register('Quotation', QuotationStateMachine, QUOTATION_TRANSITIONS);
