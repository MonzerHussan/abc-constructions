import { BaseStateMachine, TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

export type InspectionStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'PARTIAL' | 'NCR_CREATED' | 'ACCEPTED';
export type InspectionTransition = 'start' | 'pass' | 'fail' | 'partial' | 'createNcr' | 'reinspect' | 'accept';

const INSPECTION_TRANSITIONS: TransitionMap = {
  PENDING: { start: 'IN_PROGRESS' },
  IN_PROGRESS: { pass: 'PASSED', fail: 'FAILED', partial: 'PARTIAL' },
  PASSED: { accept: 'ACCEPTED' },
  FAILED: { createNcr: 'NCR_CREATED' },
  NCR_CREATED: { reinspect: 'IN_PROGRESS', accept: 'ACCEPTED' },
  PARTIAL: { accept: 'ACCEPTED', createNcr: 'NCR_CREATED' },
  ACCEPTED: {},
};

export class QualityStateMachine extends BaseStateMachine {
  constructor(status: string = 'PENDING') {
    super(status, INSPECTION_TRANSITIONS);
  }

  transition(transition: string): string {
    try {
      return super.transition(transition);
    } catch {
      throw new Error(ErrorCodes.QUALITY_INSPECTION_INVALID_TRANSITION);
    }
  }
}

export function getAllowedInspectionTransitions(status: string): string[] {
  return BaseStateMachine.getAllowedTransitions(INSPECTION_TRANSITIONS, status);
}

export function canTransitionInspection(from: string, action: string): boolean {
  return BaseStateMachine.canTransition(INSPECTION_TRANSITIONS, from, action);
}

workflowEngine.register('Inspection', QualityStateMachine, INSPECTION_TRANSITIONS);
