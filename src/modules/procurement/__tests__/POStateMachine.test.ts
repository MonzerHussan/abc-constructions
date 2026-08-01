import { describe, it, expect } from 'vitest';
import { POStateMachine, getAllowedPOTransitions, canTransitionPO } from '@/modules/procurement/workflow/state-machines/POStateMachine';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

describe('POStateMachine', () => {
  describe('DRAFT state', () => {
    it('should allow issue', () => {
      const sm = new POStateMachine('DRAFT');
      expect(sm.can('issue')).toBe(true);
    });

    it('should transition to ISSUED on issue', () => {
      const sm = new POStateMachine('DRAFT');
      expect(sm.transition('issue')).toBe('ISSUED');
      expect(sm.status).toBe('ISSUED');
    });

    it('should not allow acknowledge, receive, complete, or cancel', () => {
      const sm = new POStateMachine('DRAFT');
      expect(sm.can('acknowledge')).toBe(false);
      expect(sm.can('receive')).toBe(false);
      expect(sm.can('complete')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('ISSUED state', () => {
    it('should allow acknowledge and cancel', () => {
      const sm = new POStateMachine('ISSUED');
      expect(sm.can('acknowledge')).toBe(true);
      expect(sm.can('cancel')).toBe(true);
    });

    it('should transition to ACKNOWLEDGED on acknowledge', () => {
      const sm = new POStateMachine('ISSUED');
      expect(sm.transition('acknowledge')).toBe('ACKNOWLEDGED');
    });

    it('should transition to CANCELLED on cancel', () => {
      const sm = new POStateMachine('ISSUED');
      expect(sm.transition('cancel')).toBe('CANCELLED');
    });

    it('should not allow issue, receive, or complete', () => {
      const sm = new POStateMachine('ISSUED');
      expect(sm.can('issue')).toBe(false);
      expect(sm.can('receive')).toBe(false);
      expect(sm.can('complete')).toBe(false);
    });
  });

  describe('ACKNOWLEDGED state', () => {
    it('should allow receive, complete, and cancel', () => {
      const sm = new POStateMachine('ACKNOWLEDGED');
      expect(sm.can('receive')).toBe(true);
      expect(sm.can('complete')).toBe(true);
      expect(sm.can('cancel')).toBe(true);
    });

    it('should transition to PARTIALLY_RECEIVED on receive', () => {
      const sm = new POStateMachine('ACKNOWLEDGED');
      expect(sm.transition('receive')).toBe('PARTIALLY_RECEIVED');
    });

    it('should transition to COMPLETED on complete', () => {
      const sm = new POStateMachine('ACKNOWLEDGED');
      expect(sm.transition('complete')).toBe('COMPLETED');
    });

    it('should not allow issue or acknowledge', () => {
      const sm = new POStateMachine('ACKNOWLEDGED');
      expect(sm.can('issue')).toBe(false);
      expect(sm.can('acknowledge')).toBe(false);
    });
  });

  describe('PARTIALLY_RECEIVED state', () => {
    it('should allow complete', () => {
      const sm = new POStateMachine('PARTIALLY_RECEIVED');
      expect(sm.can('complete')).toBe(true);
    });

    it('should transition to COMPLETED on complete', () => {
      const sm = new POStateMachine('PARTIALLY_RECEIVED');
      expect(sm.transition('complete')).toBe('COMPLETED');
    });

    it('should not allow issue, acknowledge, receive, or cancel', () => {
      const sm = new POStateMachine('PARTIALLY_RECEIVED');
      expect(sm.can('issue')).toBe(false);
      expect(sm.can('acknowledge')).toBe(false);
      expect(sm.can('receive')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('COMPLETED state', () => {
    it('should not allow any transition', () => {
      const sm = new POStateMachine('COMPLETED');
      expect(sm.can('issue')).toBe(false);
      expect(sm.can('acknowledge')).toBe(false);
      expect(sm.can('receive')).toBe(false);
      expect(sm.can('complete')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('CANCELLED state', () => {
    it('should not allow any transition', () => {
      const sm = new POStateMachine('CANCELLED');
      expect(sm.can('issue')).toBe(false);
      expect(sm.can('acknowledge')).toBe(false);
      expect(sm.can('receive')).toBe(false);
      expect(sm.can('complete')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('invalid transitions', () => {
    it('should throw INVALID_TRANSITION on invalid transition', () => {
      const sm = new POStateMachine('DRAFT');
      expect(() => sm.transition('complete')).toThrow(ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION);
    });

    it('should throw INVALID_TRANSITION for terminal state transition', () => {
      const sm = new POStateMachine('COMPLETED');
      expect(() => sm.transition('issue')).toThrow(ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION);
    });
  });

  describe('static helpers', () => {
    it('should list allowed transitions for DRAFT', () => {
      expect(getAllowedPOTransitions('DRAFT')).toEqual(['issue']);
    });

    it('should list allowed transitions for ISSUED', () => {
      expect(getAllowedPOTransitions('ISSUED')).toEqual(['acknowledge', 'cancel']);
    });

    it('should return empty array for COMPLETED', () => {
      expect(getAllowedPOTransitions('COMPLETED')).toEqual([]);
    });

    it('should check if transition is valid with static method', () => {
      expect(canTransitionPO('DRAFT', 'issue')).toBe(true);
      expect(canTransitionPO('DRAFT', 'acknowledge')).toBe(false);
      expect(canTransitionPO('ISSUED', 'acknowledge')).toBe(true);
      expect(canTransitionPO('ISSUED', 'cancel')).toBe(true);
    });
  });
});
