import { describe, it, expect } from 'vitest';
import {
  AwardStateMachine,
  getAllowedAwardTransitions,
  canTransitionAward,
} from '@/modules/procurement/workflow/state-machines/AwardStateMachine';
import { ProcurementErrors } from '@/modules/shared/errors/procurement.errors';

describe('AwardStateMachine', () => {
  describe('PENDING_ACCEPTANCE state', () => {
    it('should allow accept, decline, and cancel', () => {
      const sm = new AwardStateMachine('PENDING_ACCEPTANCE');
      expect(sm.can('accept')).toBe(true);
      expect(sm.can('decline')).toBe(true);
      expect(sm.can('cancel')).toBe(true);
    });

    it('should transition to ACCEPTED on accept', () => {
      const sm = new AwardStateMachine('PENDING_ACCEPTANCE');
      expect(sm.transition('accept')).toBe('ACCEPTED');
      expect(sm.status).toBe('ACCEPTED');
    });

    it('should transition to DECLINED on decline', () => {
      const sm = new AwardStateMachine('PENDING_ACCEPTANCE');
      expect(sm.transition('decline')).toBe('DECLINED');
    });

    it('should transition to CANCELLED on cancel', () => {
      const sm = new AwardStateMachine('PENDING_ACCEPTANCE');
      expect(sm.transition('cancel')).toBe('CANCELLED');
    });

    it('should list allowed transitions', () => {
      const sm = new AwardStateMachine('PENDING_ACCEPTANCE');
      expect(sm.allowedTransitions()).toEqual(['accept', 'decline', 'cancel']);
    });
  });

  describe('ACCEPTED state', () => {
    it('should not allow any transition', () => {
      const sm = new AwardStateMachine('ACCEPTED');
      expect(sm.can('accept')).toBe(false);
      expect(sm.can('decline')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('DECLINED state', () => {
    it('should not allow any transition', () => {
      const sm = new AwardStateMachine('DECLINED');
      expect(sm.can('accept')).toBe(false);
      expect(sm.can('decline')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('CANCELLED state', () => {
    it('should not allow any transition', () => {
      const sm = new AwardStateMachine('CANCELLED');
      expect(sm.can('accept')).toBe(false);
      expect(sm.can('decline')).toBe(false);
      expect(sm.can('cancel')).toBe(false);
    });
  });

  describe('invalid transitions', () => {
    it('should throw AWARD_INVALID_TRANSITION on invalid transition', () => {
      const sm = new AwardStateMachine('ACCEPTED');
      expect(() => sm.transition('accept')).toThrow(ProcurementErrors.PROCUREMENT_AWARD_INVALID_TRANSITION);
    });

    it('should throw on unknown action', () => {
      const sm = new AwardStateMachine('PENDING_ACCEPTANCE');
      expect(() => sm.transition('unknown' as string)).toThrow(ProcurementErrors.PROCUREMENT_AWARD_INVALID_TRANSITION);
    });
  });

  describe('static helpers', () => {
    it('should list allowed transitions for a status', () => {
      expect(getAllowedAwardTransitions('PENDING_ACCEPTANCE')).toEqual(['accept', 'decline', 'cancel']);
    });

    it('should return empty array for terminal states', () => {
      expect(getAllowedAwardTransitions('ACCEPTED')).toEqual([]);
      expect(getAllowedAwardTransitions('DECLINED')).toEqual([]);
      expect(getAllowedAwardTransitions('CANCELLED')).toEqual([]);
    });

    it('should check transition validity', () => {
      expect(canTransitionAward('PENDING_ACCEPTANCE', 'accept')).toBe(true);
      expect(canTransitionAward('PENDING_ACCEPTANCE', 'decline')).toBe(true);
      expect(canTransitionAward('ACCEPTED', 'accept')).toBe(false);
    });

    it('should construct with default PENDING_ACCEPTANCE status', () => {
      const sm = new AwardStateMachine();
      expect(sm.status).toBe('PENDING_ACCEPTANCE');
    });
  });
});
