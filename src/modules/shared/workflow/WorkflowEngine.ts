import { BaseStateMachine, TransitionMap } from './BaseStateMachine';
import type { WorkflowContext } from './WorkflowContext';
import type { WorkflowDefinition, WorkflowStateConfig } from './WorkflowTransition';
import type { WorkflowHistoryEntry, WorkflowHistoryRecorder } from './WorkflowHistoryRecorder';
import { InMemoryWorkflowHistoryRecorder } from './WorkflowHistoryRecorder';
import { buildGuardContext, runGuards } from './WorkflowGuards';

export interface WorkflowTransitionResult {
  fromStatus: string;
  toStatus: string;
  action: string;
  result: WorkflowHistoryEntry['result'];
  blockedBy?: string;
  reason?: string;
  historyId?: string;
}

export class WorkflowEngine {
  private machines: Map<string, new (status: string) => BaseStateMachine> = new Map();
  private transitions: Map<string, TransitionMap> = new Map();
  private definitions: Map<string, WorkflowDefinition> = new Map();
  private historyRecorder: WorkflowHistoryRecorder;

  constructor(historyRecorder?: WorkflowHistoryRecorder) {
    this.historyRecorder = historyRecorder ?? new InMemoryWorkflowHistoryRecorder();
  }

  setHistoryRecorder(recorder: WorkflowHistoryRecorder): void {
    this.historyRecorder = recorder;
  }

  register(name: string, machineClass: new (status: string) => BaseStateMachine, transitions: TransitionMap): void {
    this.machines.set(name, machineClass);
    this.transitions.set(name, transitions);
  }

  registerDefinition(definition: WorkflowDefinition, machineClass: new (status: string) => BaseStateMachine): void {
    this.definitions.set(definition.name, definition);
    this.machines.set(definition.name, machineClass);
    this.transitions.set(definition.name, definition.transitions);
  }

  create(name: string, status: string): BaseStateMachine {
    const MachineClass = this.machines.get(name);
    if (!MachineClass) throw new Error(`WORKFLOW_DEFINITION_NOT_FOUND: ${name}`);
    return new MachineClass(status);
  }

  validateTransition(name: string, from: string, action: string): boolean {
    const t = this.transitions.get(name);
    if (!t) return false;
    return BaseStateMachine.canTransition(t, from, action);
  }

  getDefinition(name: string): WorkflowDefinition | undefined {
    return this.definitions.get(name);
  }

  listDefinitions(): WorkflowDefinition[] {
    return [...this.definitions.values()];
  }

  getAllowedTransitions(name: string, status: string): string[] {
    const t = this.transitions.get(name);
    if (!t) return [];
    return BaseStateMachine.getAllowedTransitions(t, status);
  }

  async execute(
    name: string,
    status: string,
    action: string,
    context?: WorkflowContext,
  ): Promise<WorkflowTransitionResult> {
    const t = this.transitions.get(name);
    if (!t) {
      throw new Error(`WORKFLOW_DEFINITION_NOT_FOUND: ${name}`);
    }
    const machine = this.create(name, status);

    const next = BaseStateMachine.canTransition(t, status, action) ? t[status][action] : null;

    const recordHistory = async (
      result: WorkflowHistoryEntry['result'],
      toStatus: string | null,
      extra?: Partial<Omit<WorkflowHistoryEntry, 'id' | 'createdAt'>>,
    ): Promise<WorkflowHistoryEntry | undefined> => {
      if (!context) return undefined;
      return this.historyRecorder.record({
        entityType: context.entityType ?? name,
        entityId: context.entityId,
        action,
        fromStatus: status,
        toStatus,
        result,
        actorId: context.userId,
        actorRole: context.actorRole,
        reason: context.reason,
        metadata: context.metadata,
        ...extra,
      });
    };

    if (!next) {
      await recordHistory('INVALID_TRANSITION', null, { reason: `INVALID_TRANSITION:${action} from ${status}` });
      throw new Error(`WORKFLOW_INVALID_TRANSITION: ${action} from ${status}`);
    }

    const definition = this.definitions.get(name);
    const guardNames = definition?.guards?.[action] ?? [];
    const guardCtx = buildGuardContext(context ?? defaultContext(), action, status, next);
    const guardResults = await runGuards(guardNames, guardCtx);
    const blocked = guardResults.find((result) => !result.allowed);
    if (blocked) {
      const guardName = guardNames[guardResults.indexOf(blocked)];
      await recordHistory('BLOCKED_BY_GUARD', null, { guardName, reason: blocked.reason });
      return {
        fromStatus: status,
        toStatus: status,
        action,
        result: 'BLOCKED_BY_GUARD',
        blockedBy: guardName,
        reason: blocked.reason,
      };
    }

    machine.transition(action, context);
    const history = await recordHistory('SUCCESS', next);
    return {
      fromStatus: status,
      toStatus: next,
      action,
      result: 'SUCCESS',
      historyId: history?.id,
    };
  }

  getStateConfigs(name: string): WorkflowStateConfig[] {
    const definition = this.definitions.get(name);
    const t = this.transitions.get(name);
    if (!t) return [];
    const states = definition?.states ?? Object.keys(t);
    return states.map((state) => ({
      name: state,
      allowedTransitions: Object.keys(t[state] ?? {}),
      isTerminal: (definition?.terminalStates ?? []).includes(state),
      isInitial: state === definition?.initialState,
    }));
  }
}

function defaultContext(): WorkflowContext {
  return { entityId: 'unknown', userId: 'system', timestamp: new Date() };
}

export const workflowEngine = new WorkflowEngine();
