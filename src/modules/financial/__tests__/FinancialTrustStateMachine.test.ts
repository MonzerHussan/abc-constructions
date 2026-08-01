import { describe, it, expect } from 'vitest';
import { FinancialTrustStateMachine, getAllowedPaymentTransitions, canTransitionPayment } from '@/modules/financial/workflow/state-machines/FinancialTrustStateMachine';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

describe('FinancialTrustStateMachine', () => {
  describe('RESERVED state', () => {
    it('should allow hold and cancel', () => {
      const sm = new FinancialTrustStateMachine('RESERVED');
      expect(sm.can('hold')).toBe(true);
      expect(sm.can('cancel')).toBe(true);
    });

    it('should transition to HELD on hold', () => {
      const sm = new FinancialTrustStateMachine('RESERVED');
      expect(sm.transition('hold')).toBe('HELD');
    });

    it('should transition to CANCELLED on cancel', () => {
      const sm = new FinancialTrustStateMachine('RESERVED');
      expect(sm.transition('cancel')).toBe('CANCELLED');
    });

    it('should not allow release or refund', () => {
      const sm = new FinancialTrustStateMachine('RESERVED');
      expect(sm.can('release')).toBe(false);
      expect(sm.can('refund')).toBe(false);
    });
  });

  describe('HELD state', () => {
    it('should allow release, refund, and cancel', () => {
      const sm = new FinancialTrustStateMachine('HELD');
      expect(sm.can('release')).toBe(true);
      expect(sm.can('refund')).toBe(true);
      expect(sm.can('cancel')).toBe(true);
    });

    it('should not allow hold', () => {
      const sm = new FinancialTrustStateMachine('HELD');
      expect(sm.can('hold')).toBe(false);
    });
  });

  describe('PARTIALLY_RELEASED state', () => {
    it('should allow release, refund, and cancel', () => {
      const sm = new FinancialTrustStateMachine('PARTIALLY_RELEASED');
      expect(sm.can('release')).toBe(true);
      expect(sm.can('refund')).toBe(true);
      expect(sm.can('cancel')).toBe(true);
    });

    it('should not allow hold', () => {
      const sm = new FinancialTrustStateMachine('PARTIALLY_RELEASED');
      expect(sm.can('hold')).toBe(false);
    });
  });

  describe('RELEASED state', () => {
    it('should not allow any transition', () => {
      const sm = new FinancialTrustStateMachine('RELEASED');
      expect(sm.can('hold')).toBe(false);
      expect(sm.can('release')).toBe(false);
      expect(sm.can('refund')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('REFUNDED state', () => {
    it('should not allow any transition', () => {
      const sm = new FinancialTrustStateMachine('REFUNDED');
      expect(sm.can('hold')).toBe(false);
      expect(sm.can('release')).toBe(false);
      expect(sm.can('refund')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('CANCELLED state', () => {
    it('should not allow any transition', () => {
      const sm = new FinancialTrustStateMachine('CANCELLED');
      expect(sm.can('hold')).toBe(false);
      expect(sm.can('release')).toBe(false);
      expect(sm.can('refund')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('invalid transitions', () => {
    it('should throw INVALID_TRANSITION', () => {
      const sm = new FinancialTrustStateMachine('RESERVED');
      expect(() => sm.transition('release')).toThrow(ErrorCodes.FINANCIAL_RESERVATION_INVALID_TRANSITION);
    });
  });

  describe('static helpers', () => {
    it('should list allowed transitions for RESERVED', () => {
      expect(getAllowedPaymentTransitions('RESERVED')).toEqual(['hold', 'cancel']);
    });

    it('should list allowed transitions for HELD', () => {
      expect(getAllowedPaymentTransitions('HELD')).toEqual(['release', 'refund', 'cancel']);
    });

    it('should return empty for RELEASED', () => {
      expect(getAllowedPaymentTransitions('RELEASED')).toEqual([]);
    });

    it('should check transition validity', () => {
      expect(canTransitionPayment('RESERVED', 'hold')).toBe(true);
      expect(canTransitionPayment('RESERVED', 'release')).toBe(false);
      expect(canTransitionPayment('HELD', 'release')).toBe(true);
      expect(canTransitionPayment('HELD', 'refund')).toBe(true);
    });
  });
});
