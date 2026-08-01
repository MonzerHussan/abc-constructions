import { describe, it, expect } from 'vitest';
import {
  PurchaseRequestStateMachine,
  getAllowedPRTransitions,
  canTransitionPR,
  type PRStatus,
} from '@/modules/procurement/workflow/state-machines/PurchaseRequestStateMachine';
import { ProcurementErrors } from '@/modules/shared/errors/procurement.errors';

describe('PurchaseRequestStateMachine', () => {
  describe('DRAFT state', () => {
    it('should allow submit', () => {
      const sm = new PurchaseRequestStateMachine('DRAFT');
      expect(sm.can('submit')).toBe(true);
    });

    it('should not allow approve, reject, or order', () => {
      const sm = new PurchaseRequestStateMachine('DRAFT');
      expect(sm.can('approve')).toBe(false);
      expect(sm.can('reject')).toBe(false);
      expect(sm.can('order')).toBe(false);
    });

    it('should transition to PENDING_APPROVAL on submit', () => {
      const sm = new PurchaseRequestStateMachine('DRAFT');
      expect(sm.transition('submit')).toBe('PENDING_APPROVAL');
      expect(sm.status).toBe('PENDING_APPROVAL');
    });

    it('should list allowed transitions', () => {
      const sm = new PurchaseRequestStateMachine('DRAFT');
      expect(sm.allowedTransitions()).toEqual(['submit']);
    });
  });

  describe('PENDING_APPROVAL state', () => {
    it('should allow approve and reject', () => {
      const sm = new PurchaseRequestStateMachine('PENDING_APPROVAL');
      expect(sm.can('approve')).toBe(true);
      expect(sm.can('reject')).toBe(true);
    });

    it('should not allow submit or order', () => {
      const sm = new PurchaseRequestStateMachine('PENDING_APPROVAL');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('order')).toBe(false);
    });

    it('should transition to APPROVED on approve', () => {
      const sm = new PurchaseRequestStateMachine('PENDING_APPROVAL');
      expect(sm.transition('approve')).toBe('APPROVED');
    });

    it('should transition to REJECTED on reject', () => {
      const sm = new PurchaseRequestStateMachine('PENDING_APPROVAL');
      expect(sm.transition('reject')).toBe('REJECTED');
    });
  });

  describe('APPROVED state', () => {
    it('should allow order', () => {
      const sm = new PurchaseRequestStateMachine('APPROVED');
      expect(sm.can('order')).toBe(true);
    });

    it('should transition to ORDERED on order', () => {
      const sm = new PurchaseRequestStateMachine('APPROVED');
      expect(sm.transition('order')).toBe('ORDERED');
    });

    it('should not allow submit, approve, or reject', () => {
      const sm = new PurchaseRequestStateMachine('APPROVED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('approve')).toBe(false);
      expect(sm.can('reject')).toBe(false);
    });
  });

  describe('REJECTED state', () => {
    it('should not allow any transition', () => {
      const sm = new PurchaseRequestStateMachine('REJECTED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('approve')).toBe(false);
      expect(sm.can('reject')).toBe(false);
      expect(sm.can('order')).toBe(false);
    });
  });

  describe('ORDERED state', () => {
    it('should not allow any transition', () => {
      const sm = new PurchaseRequestStateMachine('ORDERED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('approve')).toBe(false);
      expect(sm.can('order')).toBe(false);
    });
  });

  describe('full lifecycle', () => {
    it('should walk DRAFT → PENDING_APPROVAL → APPROVED → ORDERED', () => {
      const sm = new PurchaseRequestStateMachine('DRAFT');
      expect(sm.transition('submit')).toBe('PENDING_APPROVAL');
      expect(sm.transition('approve')).toBe('APPROVED');
      expect(sm.transition('order')).toBe('ORDERED');
    });

    it('should walk DRAFT → PENDING_APPROVAL → REJECTED', () => {
      const sm = new PurchaseRequestStateMachine('DRAFT');
      sm.transition('submit');
      expect(sm.transition('reject')).toBe('REJECTED');
    });
  });

  describe('invalid transitions', () => {
    it('should throw PR_INVALID_TRANSITION on invalid transition', () => {
      const sm = new PurchaseRequestStateMachine('DRAFT');
      expect(() => sm.transition('approve')).toThrow(ProcurementErrors.PROCUREMENT_PR_INVALID_TRANSITION);
    });

    it('should throw on transition from terminal state', () => {
      const sm = new PurchaseRequestStateMachine('ORDERED');
      expect(() => sm.transition('order')).toThrow(ProcurementErrors.PROCUREMENT_PR_INVALID_TRANSITION);
    });
  });

  describe('static helpers', () => {
    it('should list allowed transitions for a status', () => {
      expect(getAllowedPRTransitions('DRAFT')).toEqual(['submit']);
      expect(getAllowedPRTransitions('PENDING_APPROVAL')).toEqual(['approve', 'reject']);
    });

    it('should return empty array for terminal states', () => {
      expect(getAllowedPRTransitions('REJECTED')).toEqual([]);
      expect(getAllowedPRTransitions('ORDERED')).toEqual([]);
    });

    it('should check transition validity', () => {
      expect(canTransitionPR('DRAFT', 'submit')).toBe(true);
      expect(canTransitionPR('PENDING_APPROVAL', 'approve')).toBe(true);
      expect(canTransitionPR('DRAFT', 'order')).toBe(false);
    });

    it('should construct with default DRAFT status', () => {
      const sm = new PurchaseRequestStateMachine();
      expect(sm.status).toBe('DRAFT');
    });
  });
});
