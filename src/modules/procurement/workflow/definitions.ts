import { workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
import type { WorkflowDefinition } from '@/modules/shared/workflow/WorkflowTransition';
import { PurchaseRequestStateMachine, PR_TRANSITIONS } from '@/modules/procurement/workflow/state-machines/PurchaseRequestStateMachine';
import { EvaluationStateMachine, EVALUATION_TRANSITIONS } from '@/modules/procurement/workflow/state-machines/EvaluationStateMachine';
import { AwardStateMachine, AWARD_TRANSITIONS } from '@/modules/procurement/workflow/state-machines/AwardStateMachine';
import { registerProcurementGuards } from '@/modules/procurement/workflow/guards/procurement-guards';

const PR_GUARDS: Record<string, string[]> = {
  submit: ['pr.submit.owner'],
  approve: ['pr.approve.rbac'],
  reject: ['pr.reject.rbac'],
  order: ['pr.order.rbac'],
};

const EVALUATION_GUARDS: Record<string, string[]> = {
  complete: ['eval.complete.completeness'],
};

const AWARD_GUARDS: Record<string, string[]> = {
  accept: ['award.accept.rbac'],
  decline: ['award.decline.rbac'],
  cancel: ['award.cancel.rbac'],
};

export function registerProcurementDefinitions(): void {
  registerProcurementGuards();

  const prDefinition: WorkflowDefinition = {
    name: 'PurchaseRequest',
    entityType: 'PurchaseRequest',
    initialState: 'DRAFT',
    states: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ORDERED'],
    transitions: PR_TRANSITIONS,
    guards: PR_GUARDS,
    terminalStates: ['APPROVED', 'REJECTED', 'ORDERED'],
  };
  workflowEngine.registerDefinition(prDefinition, PurchaseRequestStateMachine);

  const evaluationDefinition: WorkflowDefinition = {
    name: 'Evaluation',
    entityType: 'Evaluation',
    initialState: 'PENDING',
    states: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    transitions: EVALUATION_TRANSITIONS,
    guards: EVALUATION_GUARDS,
    terminalStates: ['COMPLETED'],
  };
  workflowEngine.registerDefinition(evaluationDefinition, EvaluationStateMachine);

  const awardDefinition: WorkflowDefinition = {
    name: 'Award',
    entityType: 'Award',
    initialState: 'PENDING_ACCEPTANCE',
    states: ['PENDING_ACCEPTANCE', 'ACCEPTED', 'DECLINED', 'CANCELLED'],
    transitions: AWARD_TRANSITIONS,
    guards: AWARD_GUARDS,
    terminalStates: ['ACCEPTED', 'DECLINED', 'CANCELLED'],
  };
  workflowEngine.registerDefinition(awardDefinition, AwardStateMachine);
}
