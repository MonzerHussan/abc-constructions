export { BaseStateMachine } from '@/modules/shared/workflow/BaseStateMachine';
export type { TransitionMap } from '@/modules/shared/workflow/BaseStateMachine';
export { WorkflowEngine, workflowEngine } from '@/modules/shared/workflow/WorkflowEngine';
export type { WorkflowTransitionResult } from '@/modules/shared/workflow/WorkflowEngine';
export type { WorkflowContext } from '@/modules/shared/workflow/WorkflowContext';
export type { WorkflowTransitionDefinition, WorkflowStateConfig, WorkflowDefinition } from '@/modules/shared/workflow/WorkflowTransition';
export type { WorkflowGuard, WorkflowGuardContext, WorkflowGuardResult } from '@/modules/shared/workflow/WorkflowGuard';
export {
  registerGuard,
  getGuard,
  hasGuard,
  listGuards,
  runGuards,
  createAuthorizationGuard,
  createDeadlineGuard,
  createCompletenessGuard,
  buildGuardContext,
} from '@/modules/shared/workflow/WorkflowGuards';
export type { WorkflowGuardContextWithEntity } from '@/modules/shared/workflow/WorkflowGuards';
export { InMemoryWorkflowHistoryRecorder } from '@/modules/shared/workflow/WorkflowHistoryRecorder';
export type { WorkflowHistoryEntry, WorkflowHistoryResult, WorkflowHistoryRecorder } from '@/modules/shared/workflow/WorkflowHistoryRecorder';
export { registerProcurementGuards } from '@/modules/procurement/workflow/guards/procurement-guards';
export { registerProcurementDefinitions } from '@/modules/procurement/workflow/definitions';
