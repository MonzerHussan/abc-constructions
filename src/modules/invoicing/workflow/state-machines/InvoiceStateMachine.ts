import { BaseStateMachine, TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { InvoicingErrors } from '@/modules/shared/errors/invoicing.errors';

export type InvoiceStatusType = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'MATCHED' | 'PARTIALLY_MATCHED' | 'APPROVED' | 'AUTHORIZED' | 'REJECTED' | 'CANCELLED';
export type InvoiceTransition = 'submit' | 'verify' | 'match' | 'approve' | 'authorize' | 'reject' | 'cancel' | 'markPartiallyMatched';

const INVOICE_TRANSITIONS: TransitionMap = {
  DRAFT: { submit: 'SUBMITTED', cancel: 'CANCELLED' },
  SUBMITTED: { verify: 'VERIFIED', reject: 'REJECTED', cancel: 'CANCELLED' },
  VERIFIED: { match: 'MATCHED', reject: 'REJECTED', cancel: 'CANCELLED' },
  MATCHED: { approve: 'APPROVED', markPartiallyMatched: 'PARTIALLY_MATCHED', reject: 'REJECTED' },
  PARTIALLY_MATCHED: { match: 'MATCHED', reject: 'REJECTED' },
  APPROVED: { authorize: 'AUTHORIZED', reject: 'REJECTED' },
  AUTHORIZED: {},
  REJECTED: {},
  CANCELLED: {},
};

export class InvoiceStateMachine extends BaseStateMachine {
  constructor(status: string = 'DRAFT') {
    super(status, INVOICE_TRANSITIONS);
  }

  transition(transition: string): string {
    try {
      return super.transition(transition);
    } catch {
      throw new Error(InvoicingErrors.INVOICING_INVOICE_INVALID_TRANSITION);
    }
  }
}

export function getAllowedInvoiceTransitions(status: string): string[] {
  return BaseStateMachine.getAllowedTransitions(INVOICE_TRANSITIONS, status);
}

export function canTransitionInvoice(from: string, action: string): boolean {
  return BaseStateMachine.canTransition(INVOICE_TRANSITIONS, from, action);
}

workflowEngine.register('Invoice', InvoiceStateMachine, INVOICE_TRANSITIONS);