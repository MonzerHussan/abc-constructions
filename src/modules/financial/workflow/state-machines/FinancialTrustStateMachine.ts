import { BaseStateMachine, TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export type PaymentStatus = 'RESERVED' | 'HELD' | 'PARTIALLY_RELEASED' | 'RELEASED' | 'REFUNDED' | 'CANCELLED';
export type PaymentTransition = 'hold' | 'release' | 'refund' | 'cancel';

const PAYMENT_TRANSITIONS: TransitionMap = {
  RESERVED: { hold: 'HELD', cancel: 'CANCELLED' },
  HELD: { release: 'PARTIALLY_RELEASED', refund: 'REFUNDED', cancel: 'CANCELLED' },
  PARTIALLY_RELEASED: { release: 'PARTIALLY_RELEASED', refund: 'REFUNDED', cancel: 'CANCELLED' },
  RELEASED: {},
  REFUNDED: {},
  CANCELLED: {},
};

export class FinancialTrustStateMachine extends BaseStateMachine {
  constructor(status: string = 'RESERVED') {
    super(status, PAYMENT_TRANSITIONS);
  }

  transition(transition: string): string {
    try {
      return super.transition(transition);
    } catch {
      throw new Error(ErrorCodes.FINANCIAL_RESERVATION_INVALID_TRANSITION);
    }
  }
}

export function getAllowedPaymentTransitions(status: string): string[] {
  return BaseStateMachine.getAllowedTransitions(PAYMENT_TRANSITIONS, status);
}

export function canTransitionPayment(from: string, action: string): boolean {
  return BaseStateMachine.canTransition(PAYMENT_TRANSITIONS, from, action);
}

workflowEngine.register('Payment', FinancialTrustStateMachine, PAYMENT_TRANSITIONS);
