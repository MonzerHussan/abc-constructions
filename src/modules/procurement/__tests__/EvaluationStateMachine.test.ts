import { describe, it, expect } from 'vitest';
import {
  EvaluationStateMachine,
  getAllowedEvaluationTransitions,
  canTransitionEvaluation,
} from '@/modules/procurement/workflow/state-machines/EvaluationStateMachine';
import { ProcurementErrors } from '@/modules/shared/errors/procurement.errors';

describe('EvaluationStateMachine', () => {
  describe('PENDING state', () => {
    it('should allow start', () => {
      const sm = new EvaluationStateMachine('PENDING');
      expect(sm.can('start')).toBe(true);
    });

    it('should not allow score or complete', () => {
      const sm = new EvaluationStateMachine('PENDING');
      expect(sm.can('score')).toBe(false);
      expect(sm.can('complete')).toBe(false);
    });

    it('should transition to IN_PROGRESS on start', () => {
      const sm = new EvaluationStateMachine('PENDING');
      expect(sm.transition('start')).toBe('IN_PROGRESS');
      expect(sm.status).toBe('IN_PROGRESS');
    });

    it('should list allowed transitions', () => {
      const sm = new EvaluationStateMachine('PENDING');
      expect(sm.allowedTransitions()).toEqual(['start']);
    });
  });

  describe('IN_PROGRESS state', () => {
    it('should allow score and complete', () => {
      const sm = new EvaluationStateMachine('IN_PROGRESS');
      expect(sm.can('score')).toBe(true);
      expect(sm.can('complete')).toBe(true);
    });

    it('should not allow start', () => {
      const sm = new EvaluationStateMachine('IN_PROGRESS');
      expect(sm.can('start')).toBe(false);
    });

    it('should transition to COMPLETED on complete', () => {
      const sm = new EvaluationStateMachine('IN_PROGRESS');
      expect(sm.transition('complete')).toBe('COMPLETED');
    });

    it('should stay IN_PROGRESS on score (self-transition)', () => {
      const sm = new EvaluationStateMachine('IN_PROGRESS');
      expect(sm.transition('score')).toBe('IN_PROGRESS');
      expect(sm.status).toBe('IN_PROGRESS');
    });
  });

  describe('COMPLETED state', () => {
    it('should not allow any transition', () => {
      const sm = new EvaluationStateMachine('COMPLETED');
      expect(sm.can('start')).toBe(false);
      expect(sm.can('score')).toBe(false);
      expect(sm.can('complete')).toBe(false);
    });
  });

  describe('full lifecycle', () => {
    it('should walk PENDING → IN_PROGRESS → COMPLETED', () => {
      const sm = new EvaluationStateMachine('PENDING');
      expect(sm.transition('start')).toBe('IN_PROGRESS');
      expect(sm.transition('complete')).toBe('COMPLETED');
    });
  });

  describe('invalid transitions', () => {
    it('should throw EVALUATION_INVALID_TRANSITION on invalid transition', () => {
      const sm = new EvaluationStateMachine('PENDING');
      expect(() => sm.transition('complete')).toThrow(ProcurementErrors.PROCUREMENT_EVALUATION_INVALID_TRANSITION);
    });

    it('should throw on transition from terminal state', () => {
      const sm = new EvaluationStateMachine('COMPLETED');
      expect(() => sm.transition('complete')).toThrow(ProcurementErrors.PROCUREMENT_EVALUATION_INVALID_TRANSITION);
    });
  });

  describe('static helpers', () => {
    it('should list allowed transitions for a status', () => {
      expect(getAllowedEvaluationTransitions('PENDING')).toEqual(['start']);
      expect(getAllowedEvaluationTransitions('IN_PROGRESS')).toEqual(['score', 'complete']);
    });

    it('should return empty array for terminal states', () => {
      expect(getAllowedEvaluationTransitions('COMPLETED')).toEqual([]);
    });

    it('should check transition validity', () => {
      expect(canTransitionEvaluation('PENDING', 'start')).toBe(true);
      expect(canTransitionEvaluation('IN_PROGRESS', 'complete')).toBe(true);
      expect(canTransitionEvaluation('PENDING', 'complete')).toBe(false);
    });

    it('should construct with default PENDING status', () => {
      const sm = new EvaluationStateMachine();
      expect(sm.status).toBe('PENDING');
    });
  });
});
