import { BaseStateMachine, TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { ProcurementErrors } from '@/modules/shared/errors/procurement.errors';

export type EvalStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type EvalTransition = 'start' | 'score' | 'complete';

export const EVALUATION_TRANSITIONS: TransitionMap = {
  PENDING: { start: 'IN_PROGRESS' },
  IN_PROGRESS: { score: 'IN_PROGRESS', complete: 'COMPLETED' },
  COMPLETED: {},
};

export class EvaluationStateMachine extends BaseStateMachine {
  constructor(status: string = 'PENDING') {
    super(status, EVALUATION_TRANSITIONS);
  }

  transition(transition: string): string {
    try {
      return super.transition(transition);
    } catch {
      throw new Error(ProcurementErrors.PROCUREMENT_EVALUATION_INVALID_TRANSITION);
    }
  }
}

export function getAllowedEvaluationTransitions(status: string): string[] {
  return BaseStateMachine.getAllowedTransitions(EVALUATION_TRANSITIONS, status);
}

export function canTransitionEvaluation(from: string, action: string): boolean {
  return BaseStateMachine.canTransition(EVALUATION_TRANSITIONS, from, action);
}

workflowEngine.register('Evaluation', EvaluationStateMachine, EVALUATION_TRANSITIONS);
