import { describe, it, expect } from 'vitest';
import { QuotationStateMachine, getAllowedQuotationTransitions, canTransitionQuotation } from '@/modules/procurement/workflow/state-machines/QuotationStateMachine';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

describe('QuotationStateMachine', () => {
  describe('DRAFT state', () => {
    it('should allow submit', () => {
      const sm = new QuotationStateMachine('DRAFT');
      expect(sm.can('submit')).toBe(true);
    });

    it('should transition to SUBMITTED on submit', () => {
      const sm = new QuotationStateMachine('DRAFT');
      expect(sm.transition('submit')).toBe('SUBMITTED');
      expect(sm.status).toBe('SUBMITTED');
    });

    it('should not allow withdraw, accept, or reject', () => {
      const sm = new QuotationStateMachine('DRAFT');
      expect(sm.can('withdraw')).toBe(false);
      expect(sm.can('accept')).toBe(false);
      expect(sm.can('reject')).toBe(false);
    });
  });

  describe('SUBMITTED state', () => {
    it('should allow withdraw, accept, and reject', () => {
      const sm = new QuotationStateMachine('SUBMITTED');
      expect(sm.can('withdraw')).toBe(true);
      expect(sm.can('accept')).toBe(true);
      expect(sm.can('reject')).toBe(true);
    });

    it('should transition to WITHDRAWN on withdraw', () => {
      const sm = new QuotationStateMachine('SUBMITTED');
      expect(sm.transition('withdraw')).toBe('WITHDRAWN');
    });

    it('should transition to ACCEPTED on accept', () => {
      const sm = new QuotationStateMachine('SUBMITTED');
      expect(sm.transition('accept')).toBe('ACCEPTED');
    });

    it('should transition to REJECTED on reject', () => {
      const sm = new QuotationStateMachine('SUBMITTED');
      expect(sm.transition('reject')).toBe('REJECTED');
    });

    it('should not allow submit', () => {
      const sm = new QuotationStateMachine('SUBMITTED');
      expect(sm.can('submit')).toBe(false);
    });
  });

  describe('WITHDRAWN state', () => {
    it('should not allow any transition', () => {
      const sm = new QuotationStateMachine('WITHDRAWN');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('withdraw')).toBe(false);
      expect(sm.can('accept')).toBe(false);
      expect(sm.can('reject')).toBe(false);
    });
  });

  describe('ACCEPTED state', () => {
    it('should not allow any transition', () => {
      const sm = new QuotationStateMachine('ACCEPTED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('withdraw')).toBe(false);
      expect(sm.can('accept')).toBe(false);
      expect(sm.can('reject')).toBe(false);
    });
  });

  describe('REJECTED state', () => {
    it('should not allow any transition', () => {
      const sm = new QuotationStateMachine('REJECTED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('withdraw')).toBe(false);
      expect(sm.can('accept')).toBe(false);
      expect(sm.can('reject')).toBe(false);
    });
  });

  describe('invalid transitions', () => {
    it('should throw INVALID_TRANSITION on invalid transition', () => {
      const sm = new QuotationStateMachine('DRAFT');
      expect(() => sm.transition('accept')).toThrow(ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION);
    });

    it('should throw INVALID_TRANSITION for terminal state transition', () => {
      const sm = new QuotationStateMachine('ACCEPTED');
      expect(() => sm.transition('submit')).toThrow(ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION);
    });
  });

  describe('static helpers', () => {
    it('should list allowed transitions for a status', () => {
      const allowed = getAllowedQuotationTransitions('SUBMITTED');
      expect(allowed).toEqual(['withdraw', 'accept', 'reject']);
    });

    it('should return single transition for DRAFT', () => {
      expect(getAllowedQuotationTransitions('DRAFT')).toEqual(['submit']);
    });

    it('should return empty array for terminal states', () => {
      expect(getAllowedQuotationTransitions('WITHDRAWN')).toEqual([]);
      expect(getAllowedQuotationTransitions('ACCEPTED')).toEqual([]);
      expect(getAllowedQuotationTransitions('REJECTED')).toEqual([]);
    });

    it('should check if transition is valid with static method', () => {
      expect(canTransitionQuotation('DRAFT', 'submit')).toBe(true);
      expect(canTransitionQuotation('DRAFT', 'accept')).toBe(false);
      expect(canTransitionQuotation('SUBMITTED', 'withdraw')).toBe(true);
      expect(canTransitionQuotation('SUBMITTED', 'accept')).toBe(true);
      expect(canTransitionQuotation('SUBMITTED', 'reject')).toBe(true);
    });
  });
});
