import { describe, it, expect } from 'vitest';
import { QualityStateMachine, getAllowedInspectionTransitions, canTransitionInspection } from '@/modules/quality/workflow/state-machines/QualityStateMachine';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

describe('QualityStateMachine', () => {
  describe('PENDING state', () => {
    it('should allow start', () => {
      const sm = new QualityStateMachine('PENDING');
      expect(sm.can('start')).toBe(true);
    });

    it('should transition to IN_PROGRESS on start', () => {
      const sm = new QualityStateMachine('PENDING');
      expect(sm.transition('start')).toBe('IN_PROGRESS');
      expect(sm.status).toBe('IN_PROGRESS');
    });

    it('should not allow pass, fail, partial, createNcr, reinspect, or accept', () => {
      const sm = new QualityStateMachine('PENDING');
      expect(sm.can('pass')).toBe(false);
      expect(sm.can('fail')).toBe(false);
      expect(sm.can('partial')).toBe(false);
      expect(sm.can('createNcr')).toBe(false);
      expect(sm.can('reinspect')).toBe(false);
      expect(sm.can('accept')).toBe(false);
    });
  });

  describe('IN_PROGRESS state', () => {
    it('should allow pass, fail, and partial', () => {
      const sm = new QualityStateMachine('IN_PROGRESS');
      expect(sm.can('pass')).toBe(true);
      expect(sm.can('fail')).toBe(true);
      expect(sm.can('partial')).toBe(true);
    });

    it('should transition to PASSED on pass', () => {
      const sm = new QualityStateMachine('IN_PROGRESS');
      expect(sm.transition('pass')).toBe('PASSED');
    });

    it('should transition to FAILED on fail', () => {
      const sm = new QualityStateMachine('IN_PROGRESS');
      expect(sm.transition('fail')).toBe('FAILED');
    });

    it('should transition to PARTIAL on partial', () => {
      const sm = new QualityStateMachine('IN_PROGRESS');
      expect(sm.transition('partial')).toBe('PARTIAL');
    });

    it('should not allow start, createNcr, reinspect, or accept', () => {
      const sm = new QualityStateMachine('IN_PROGRESS');
      expect(sm.can('start')).toBe(false);
      expect(sm.can('createNcr')).toBe(false);
      expect(sm.can('reinspect')).toBe(false);
      expect(sm.can('accept')).toBe(false);
    });
  });

  describe('PASSED state', () => {
    it('should allow accept', () => {
      const sm = new QualityStateMachine('PASSED');
      expect(sm.can('accept')).toBe(true);
    });

    it('should transition to ACCEPTED on accept', () => {
      const sm = new QualityStateMachine('PASSED');
      expect(sm.transition('accept')).toBe('ACCEPTED');
    });

    it('should not allow start, pass, fail, partial, createNcr, or reinspect', () => {
      const sm = new QualityStateMachine('PASSED');
      expect(sm.can('start')).toBe(false);
      expect(sm.can('pass')).toBe(false);
      expect(sm.can('fail')).toBe(false);
      expect(sm.can('partial')).toBe(false);
      expect(sm.can('createNcr')).toBe(false);
      expect(sm.can('reinspect')).toBe(false);
    });
  });

  describe('FAILED state', () => {
    it('should allow createNcr', () => {
      const sm = new QualityStateMachine('FAILED');
      expect(sm.can('createNcr')).toBe(true);
    });

    it('should transition to NCR_CREATED on createNcr', () => {
      const sm = new QualityStateMachine('FAILED');
      expect(sm.transition('createNcr')).toBe('NCR_CREATED');
    });

    it('should not allow start, pass, fail, partial, reinspect, or accept', () => {
      const sm = new QualityStateMachine('FAILED');
      expect(sm.can('start')).toBe(false);
      expect(sm.can('pass')).toBe(false);
      expect(sm.can('fail')).toBe(false);
      expect(sm.can('partial')).toBe(false);
      expect(sm.can('reinspect')).toBe(false);
      expect(sm.can('accept')).toBe(false);
    });
  });

  describe('NCR_CREATED state', () => {
    it('should allow reinspect and accept', () => {
      const sm = new QualityStateMachine('NCR_CREATED');
      expect(sm.can('reinspect')).toBe(true);
      expect(sm.can('accept')).toBe(true);
    });

    it('should transition to IN_PROGRESS on reinspect', () => {
      const sm = new QualityStateMachine('NCR_CREATED');
      expect(sm.transition('reinspect')).toBe('IN_PROGRESS');
    });

    it('should transition to ACCEPTED on accept', () => {
      const sm = new QualityStateMachine('NCR_CREATED');
      expect(sm.transition('accept')).toBe('ACCEPTED');
    });

    it('should not allow start, pass, fail, partial, or createNcr', () => {
      const sm = new QualityStateMachine('NCR_CREATED');
      expect(sm.can('start')).toBe(false);
      expect(sm.can('pass')).toBe(false);
      expect(sm.can('fail')).toBe(false);
      expect(sm.can('partial')).toBe(false);
      expect(sm.can('createNcr')).toBe(false);
    });
  });

  describe('PARTIAL state', () => {
    it('should allow accept and createNcr', () => {
      const sm = new QualityStateMachine('PARTIAL');
      expect(sm.can('accept')).toBe(true);
      expect(sm.can('createNcr')).toBe(true);
    });

    it('should transition to ACCEPTED on accept', () => {
      const sm = new QualityStateMachine('PARTIAL');
      expect(sm.transition('accept')).toBe('ACCEPTED');
    });

    it('should not allow start, pass, fail, partial, or reinspect', () => {
      const sm = new QualityStateMachine('PARTIAL');
      expect(sm.can('start')).toBe(false);
      expect(sm.can('pass')).toBe(false);
      expect(sm.can('fail')).toBe(false);
      expect(sm.can('partial')).toBe(false);
      expect(sm.can('reinspect')).toBe(false);
    });
  });

  describe('ACCEPTED state', () => {
    it('should not allow any transition', () => {
      const sm = new QualityStateMachine('ACCEPTED');
      expect(sm.can('start')).toBe(false);
      expect(sm.can('pass')).toBe(false);
      expect(sm.can('fail')).toBe(false);
      expect(sm.can('partial')).toBe(false);
      expect(sm.can('createNcr')).toBe(false);
      expect(sm.can('reinspect')).toBe(false);
      expect(sm.can('accept')).toBe(false);
    });
  });

  describe('invalid transitions', () => {
    it('should throw INVALID_TRANSITION on invalid transition', () => {
      const sm = new QualityStateMachine('PENDING');
      expect(() => sm.transition('accept')).toThrow(ErrorCodes.QUALITY_INSPECTION_INVALID_TRANSITION);
    });

    it('should throw INVALID_TRANSITION for terminal state transition', () => {
      const sm = new QualityStateMachine('ACCEPTED');
      expect(() => sm.transition('start')).toThrow(ErrorCodes.QUALITY_INSPECTION_INVALID_TRANSITION);
    });
  });

  describe('static helpers', () => {
    it('should list allowed transitions for PENDING', () => {
      expect(getAllowedInspectionTransitions('PENDING')).toEqual(['start']);
    });

    it('should list allowed transitions for IN_PROGRESS', () => {
      expect(getAllowedInspectionTransitions('IN_PROGRESS')).toEqual(['pass', 'fail', 'partial']);
    });

    it('should list allowed transitions for PASSED', () => {
      expect(getAllowedInspectionTransitions('PASSED')).toEqual(['accept']);
    });

    it('should list allowed transitions for FAILED', () => {
      expect(getAllowedInspectionTransitions('FAILED')).toEqual(['createNcr']);
    });

    it('should list allowed transitions for NCR_CREATED', () => {
      expect(getAllowedInspectionTransitions('NCR_CREATED')).toEqual(['reinspect', 'accept']);
    });

    it('should list allowed transitions for PARTIAL', () => {
      expect(getAllowedInspectionTransitions('PARTIAL')).toEqual(['accept', 'createNcr']);
    });

    it('should return empty array for ACCEPTED', () => {
      expect(getAllowedInspectionTransitions('ACCEPTED')).toEqual([]);
    });

    it('should check if transition is valid with static method', () => {
      expect(canTransitionInspection('PENDING', 'start')).toBe(true);
      expect(canTransitionInspection('PENDING', 'accept')).toBe(false);
      expect(canTransitionInspection('IN_PROGRESS', 'pass')).toBe(true);
      expect(canTransitionInspection('IN_PROGRESS', 'fail')).toBe(true);
      expect(canTransitionInspection('PASSED', 'accept')).toBe(true);
      expect(canTransitionInspection('FAILED', 'createNcr')).toBe(true);
      expect(canTransitionInspection('NCR_CREATED', 'reinspect')).toBe(true);
    });
  });
});
