import { describe, it, expect } from 'vitest';
import { RFQStateMachine, getAllowedRFQTransitions, canTransitionRFQ } from '@/modules/procurement/workflow/state-machines/RFQStateMachine';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

describe('RFQStateMachine', () => {
  describe('DRAFT state', () => {
    it('should allow submit', () => {
      const sm = new RFQStateMachine('DRAFT');
      expect(sm.can('submit')).toBe(true);
    });

    it('should allow cancel', () => {
      const sm = new RFQStateMachine('DRAFT');
      expect(sm.can('cancel')).toBe(true);
    });

    it('should transition to SENT on submit', () => {
      const sm = new RFQStateMachine('DRAFT');
      expect(sm.transition('submit')).toBe('SENT');
      expect(sm.status).toBe('SENT');
    });

    it('should transition to CANCELLED on cancel', () => {
      const sm = new RFQStateMachine('DRAFT');
      expect(sm.transition('cancel')).toBe('CANCELLED');
    });

    it('should not allow send, award, or close', () => {
      const sm = new RFQStateMachine('DRAFT');
      expect(sm.can('send')).toBe(false);
      expect(sm.can('award')).toBe(false);
      expect(sm.can('close')).toBe(false);
    });
  });

  describe('SENT state', () => {
    it('should allow send and cancel', () => {
      const sm = new RFQStateMachine('SENT');
      expect(sm.can('send')).toBe(true);
      expect(sm.can('cancel')).toBe(true);
    });

    it('should transition to OPEN on send', () => {
      const sm = new RFQStateMachine('SENT');
      expect(sm.transition('send')).toBe('OPEN');
    });

    it('should transition to CANCELLED on cancel', () => {
      const sm = new RFQStateMachine('SENT');
      expect(sm.transition('cancel')).toBe('CANCELLED');
    });

    it('should not allow submit or award', () => {
      const sm = new RFQStateMachine('SENT');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('award')).toBe(false);
    });
  });

  describe('OPEN state', () => {
    it('should allow award and cancel', () => {
      const sm = new RFQStateMachine('OPEN');
      expect(sm.can('award')).toBe(true);
      expect(sm.can('cancel')).toBe(true);
    });

    it('should transition to AWARDED on award', () => {
      const sm = new RFQStateMachine('OPEN');
      expect(sm.transition('award')).toBe('AWARDED');
    });

    it('should transition to CANCELLED on cancel', () => {
      const sm = new RFQStateMachine('OPEN');
      expect(sm.transition('cancel')).toBe('CANCELLED');
    });

    it('should not allow submit or send', () => {
      const sm = new RFQStateMachine('OPEN');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('send')).toBe(false);
    });
  });

  describe('AWARDED state', () => {
    it('should allow close', () => {
      const sm = new RFQStateMachine('AWARDED');
      expect(sm.can('close')).toBe(true);
    });

    it('should transition to CLOSED on close', () => {
      const sm = new RFQStateMachine('AWARDED');
      expect(sm.transition('close')).toBe('CLOSED');
    });

    it('should not allow submit, send, award, or cancel', () => {
      const sm = new RFQStateMachine('AWARDED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('send')).toBe(false);
      expect(sm.can('award')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('CLOSED state', () => {
    it('should not allow any transition', () => {
      const sm = new RFQStateMachine('CLOSED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('send')).toBe(false);
      expect(sm.can('award')).toBe(false);
      expect(sm.can('close')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('CANCELLED state', () => {
    it('should not allow any transition', () => {
      const sm = new RFQStateMachine('CANCELLED');
      expect(sm.can('submit')).toBe(false);
      expect(sm.can('send')).toBe(false);
      expect(sm.can('award')).toBe(false);
      expect(sm.can('close')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('invalid transitions', () => {
    it('should throw INVALID_TRANSITION on invalid transition', () => {
      const sm = new RFQStateMachine('CLOSED');
      expect(() => sm.transition('submit')).toThrow(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION);
    });
  });

  describe('static helpers', () => {
    it('should list allowed transitions for a status', () => {
      const allowed = getAllowedRFQTransitions('DRAFT');
      expect(allowed).toEqual(['submit', 'cancel']);
    });

    it('should return empty array for terminal states', () => {
      expect(getAllowedRFQTransitions('CLOSED')).toEqual([]);
    });

    it('should check if transition is valid with static method', () => {
      expect(canTransitionRFQ('DRAFT', 'submit')).toBe(true);
      expect(canTransitionRFQ('DRAFT', 'award')).toBe(false);
    });
  });
});
