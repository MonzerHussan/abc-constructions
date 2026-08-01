import type { WorkflowContext } from './WorkflowContext';

export type TransitionMap = Record<string, Partial<Record<string, string>>>;

export class BaseStateMachine {
  protected currentStatus: string;
  protected transitions: TransitionMap;

  constructor(initialStatus: string, transitions: TransitionMap) {
    this.currentStatus = initialStatus;
    this.transitions = transitions;
  }

  get status(): string {
    return this.currentStatus;
  }

  can(transition: string): boolean {
    return !!this.transitions[this.currentStatus]?.[transition];
  }

  transition(transition: string, _context?: WorkflowContext): string {
    const next = this.transitions[this.currentStatus]?.[transition];
    if (!next) {
      throw new Error('WORKFLOW_INVALID_TRANSITION');
    }
    this.currentStatus = next;
    return next;
  }

  allowedTransitions(): string[] {
    return Object.keys(this.transitions[this.currentStatus] ?? {});
  }

  static getAllowedTransitions(transitions: TransitionMap, status: string): string[] {
    return Object.keys(transitions[status] ?? {});
  }

  static canTransition(transitions: TransitionMap, from: string, action: string): boolean {
    return !!transitions[from]?.[action];
  }
}
