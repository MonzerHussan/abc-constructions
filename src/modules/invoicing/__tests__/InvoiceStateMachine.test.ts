import { describe, it, expect } from 'vitest';
import { InvoiceStateMachine, getAllowedInvoiceTransitions, canTransitionInvoice } from '@/modules/invoicing/workflow/state-machines/InvoiceStateMachine';
import { InvoicingErrors } from '@/modules/shared/errors/invoicing.errors';

describe('InvoiceStateMachine', () => {
  describe('DRAFT state', () => {
    it('should allow submit and cancel', () => {
      const sm = new InvoiceStateMachine('DRAFT');
      expect(sm.can('submit')).toBe(true);
      expect(sm.can('cancel')).toBe(true);
    });

    it('should transition to SUBMITTED on submit', () => {
      const sm = new InvoiceStateMachine('DRAFT');
      expect(sm.transition('submit')).toBe('SUBMITTED');
    });

    it('should transition to CANCELLED on cancel', () => {
      const sm = new InvoiceStateMachine('DRAFT');
      expect(sm.transition('cancel')).toBe('CANCELLED');
    });

    it('should not allow verify, match, approve, authorize, reject', () => {
      const sm = new InvoiceStateMachine('DRAFT');
      expect(sm.can('verify')).toBe(false);
      expect(sm.can('match')).toBe(false);
      expect(sm.can('approve')).toBe(false);
      expect(sm.can('authorize')).toBe(false);
      expect(sm.can('reject')).toBe(false);
    });
  });

  describe('SUBMITTED state', () => {
    it('should allow verify, reject, and cancel', () => {
      const sm = new InvoiceStateMachine('SUBMITTED');
      expect(sm.can('verify')).toBe(true);
      expect(sm.can('reject')).toBe(true);
      expect(sm.can('cancel')).toBe(true);
    });

    it('should not allow submit, match, approve, authorize', () => {
      const sm = new InvoiceStateMachine('SUBMITTED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('match')).toBe(false);
      expect(sm.can('approve')).toBe(false);
      expect(sm.can('authorize')).toBe(false);
    });
  });

  describe('VERIFIED state', () => {
    it('should allow match, reject, and cancel', () => {
      const sm = new InvoiceStateMachine('VERIFIED');
      expect(sm.can('match')).toBe(true);
      expect(sm.can('reject')).toBe(true);
      expect(sm.can('cancel')).toBe(true);
    });

    it('should not allow submit, verify, approve, authorize', () => {
      const sm = new InvoiceStateMachine('VERIFIED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('verify')).toBe(false);
      expect(sm.can('approve')).toBe(false);
      expect(sm.can('authorize')).toBe(false);
    });
  });

  describe('MATCHED state', () => {
    it('should allow approve, markPartiallyMatched, and reject', () => {
      const sm = new InvoiceStateMachine('MATCHED');
      expect(sm.can('approve')).toBe(true);
      expect(sm.can('markPartiallyMatched')).toBe(true);
      expect(sm.can('reject')).toBe(true);
    });

    it('should not allow submit, verify, match, authorize', () => {
      const sm = new InvoiceStateMachine('MATCHED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('verify')).toBe(false);
      expect(sm.can('match')).toBe(false);
      expect(sm.can('authorize')).toBe(false);
    });
  });

  describe('PARTIALLY_MATCHED state', () => {
    it('should allow match and reject', () => {
      const sm = new InvoiceStateMachine('PARTIALLY_MATCHED');
      expect(sm.can('match')).toBe(true);
      expect(sm.can('reject')).toBe(true);
    });

    it('should not allow approve or authorize', () => {
      const sm = new InvoiceStateMachine('PARTIALLY_MATCHED');
      expect(sm.can('approve')).toBe(false);
      expect(sm.can('authorize')).toBe(false);
    });
  });

  describe('APPROVED state', () => {
    it('should allow authorize and reject', () => {
      const sm = new InvoiceStateMachine('APPROVED');
      expect(sm.can('authorize')).toBe(true);
      expect(sm.can('reject')).toBe(true);
    });

    it('should not allow submit, verify, match, approve', () => {
      const sm = new InvoiceStateMachine('APPROVED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('verify')).toBe(false);
      expect(sm.can('match')).toBe(false);
      expect(sm.can('approve')).toBe(false);
    });
  });

  describe('AUTHORIZED state', () => {
    it('should not allow any transition', () => {
      const sm = new InvoiceStateMachine('AUTHORIZED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('verify')).toBe(false);
      expect(sm.can('match')).toBe(false);
      expect(sm.can('approve')).toBe(false);
      expect(sm.can('authorize')).toBe(false);
      expect(sm.can('reject')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('REJECTED state', () => {
    it('should not allow any transition', () => {
      const sm = new InvoiceStateMachine('REJECTED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('verify')).toBe(false);
      expect(sm.can('match')).toBe(false);
      expect(sm.can('approve')).toBe(false);
      expect(sm.can('authorize')).toBe(false);
      expect(sm.can('reject')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('CANCELLED state', () => {
    it('should not allow any transition', () => {
      const sm = new InvoiceStateMachine('CANCELLED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('verify')).toBe(false);
      expect(sm.can('match')).toBe(false);
      expect(sm.can('approve')).toBe(false);
      expect(sm.can('authorize')).toBe(false);
      expect(sm.can('reject')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('invalid transitions', () => {
    it('should throw INVOICE_INVALID_TRANSITION', () => {
      const sm = new InvoiceStateMachine('DRAFT');
      expect(() => sm.transition('verify')).toThrow(InvoicingErrors.INVOICING_INVOICE_INVALID_TRANSITION);
    });
  });

  describe('status getter', () => {
    it('should return current status', () => {
      const sm = new InvoiceStateMachine('DRAFT');
      expect(sm.status).toBe('DRAFT');
    });
  });

  describe('static helpers', () => {
    it('should list allowed transitions for DRAFT', () => {
      expect(getAllowedInvoiceTransitions('DRAFT')).toEqual(['submit', 'cancel']);
    });

    it('should list allowed transitions for SUBMITTED', () => {
      expect(getAllowedInvoiceTransitions('SUBMITTED')).toEqual(['verify', 'reject', 'cancel']);
    });

    it('should list allowed transitions for VERIFIED', () => {
      expect(getAllowedInvoiceTransitions('VERIFIED')).toEqual(['match', 'reject', 'cancel']);
    });

    it('should list allowed transitions for MATCHED', () => {
      expect(getAllowedInvoiceTransitions('MATCHED')).toEqual(['approve', 'markPartiallyMatched', 'reject']);
    });

    it('should list allowed transitions for APPROVED', () => {
      expect(getAllowedInvoiceTransitions('APPROVED')).toEqual(['authorize', 'reject']);
    });

    it('should return empty for AUTHORIZED', () => {
      expect(getAllowedInvoiceTransitions('AUTHORIZED')).toEqual([]);
    });

    it('should check transition validity', () => {
      expect(canTransitionInvoice('DRAFT', 'submit')).toBe(true);
      expect(canTransitionInvoice('DRAFT', 'verify')).toBe(false);
      expect(canTransitionInvoice('SUBMITTED', 'verify')).toBe(true);
      expect(canTransitionInvoice('SUBMITTED', 'match')).toBe(false);
      expect(canTransitionInvoice('VERIFIED', 'match')).toBe(true);
      expect(canTransitionInvoice('MATCHED', 'approve')).toBe(true);
      expect(canTransitionInvoice('APPROVED', 'authorize')).toBe(true);
    });
  });

  describe('full lifecycle', () => {
    it('should go through complete happy path: DRAFT → SUBMITTED → VERIFIED → MATCHED → APPROVED → AUTHORIZED', () => {
      const sm = new InvoiceStateMachine('DRAFT');
      expect(sm.transition('submit')).toBe('SUBMITTED');
      expect(sm.transition('verify')).toBe('VERIFIED');
      expect(sm.transition('match')).toBe('MATCHED');
      expect(sm.transition('approve')).toBe('APPROVED');
      expect(sm.transition('authorize')).toBe('AUTHORIZED');
    });

    it('should handle rejection at various stages', () => {
      const sm = new InvoiceStateMachine('DRAFT');
      sm.transition('submit');
      expect(sm.transition('reject')).toBe('REJECTED');
    });

    it('should handle cancel from DRAFT', () => {
      const sm = new InvoiceStateMachine('DRAFT');
      expect(sm.transition('cancel')).toBe('CANCELLED');
    });
  });
});