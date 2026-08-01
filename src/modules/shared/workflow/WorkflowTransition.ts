import type { TransitionMap } from './BaseStateMachine';

export interface WorkflowTransitionDefinition {
  from: string;
  to: string;
  action: string;
  guardNames?: string[];
  allowedRoles?: string[];
}

export interface WorkflowStateConfig {
  name: string;
  allowedTransitions: string[];
  isTerminal?: boolean;
  isInitial?: boolean;
}

export interface WorkflowDefinition {
  name: string;
  entityType: string;
  initialState: string;
  states: string[];
  transitions: TransitionMap;
  guards?: Record<string, string[]>;
  terminalStates?: string[];
  metadata?: Record<string, unknown>;
}
