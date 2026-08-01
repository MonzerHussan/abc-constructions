import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowEngine } from '../WorkflowEngine';
import { BaseStateMachine, type TransitionMap } from '../BaseStateMachine';
import { InMemoryWorkflowHistoryRecorder } from '../WorkflowHistoryRecorder';
import { registerGuard, createAuthorizationGuard, createDeadlineGuard } from '../WorkflowGuards';

const TEST_TRANSITIONS: TransitionMap = {
  DRAFT: { submit: 'SENT', cancel: 'CANCELLED' },
  SENT: { send: 'OPEN' },
  OPEN: { award: 'AWARDED' },
  AWARDED: {},
  CANCELLED: {},
};

class TestMachine extends BaseStateMachine {
  constructor(status: string = 'DRAFT') {
    super(status, TEST_TRANSITIONS);
  }
}

function makeContext(overrides: Partial<Parameters<WorkflowEngine['execute']>[3] & { entityType?: string }> = {}) {
  return {
    entityId: 'ent-1',
    entityType: 'RFQ',
    userId: 'user-1',
    timestamp: new Date(),
    ...overrides,
  };
}

describe('WorkflowEngine — Registration & Definitions', () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    engine = new WorkflowEngine(new InMemoryWorkflowHistoryRecorder());
  });

  it('registers a machine and can create an instance', () => {
    engine.register('Test', TestMachine, TEST_TRANSITIONS);
    const machine = engine.create('Test', 'DRAFT');
    expect(machine.status).toBe('DRAFT');
  });

  it('throws WORKFLOW_DEFINITION_NOT_FOUND for unknown machine', () => {
    expect(() => engine.create('Missing', 'DRAFT')).toThrow('WORKFLOW_DEFINITION_NOT_FOUND');
  });

  it('validates transitions via validateTransition', () => {
    engine.register('Test', TestMachine, TEST_TRANSITIONS);
    expect(engine.validateTransition('Test', 'DRAFT', 'submit')).toBe(true);
    expect(engine.validateTransition('Test', 'DRAFT', 'award')).toBe(false);
  });

  it('returns allowed transitions for a status', () => {
    engine.register('Test', TestMachine, TEST_TRANSITIONS);
    expect(engine.getAllowedTransitions('Test', 'DRAFT')).toEqual(['submit', 'cancel']);
    expect(engine.getAllowedTransitions('Test', 'AWARDED')).toEqual([]);
  });

  it('registers definitions and lists them', () => {
    engine.registerDefinition(
      {
        name: 'TestDef',
        entityType: 'RFQ',
        initialState: 'DRAFT',
        states: ['DRAFT', 'SENT', 'OPEN', 'AWARDED'],
        transitions: TEST_TRANSITIONS,
        guards: { submit: ['roleCheck'] },
      },
      TestMachine,
    );
    const def = engine.getDefinition('TestDef');
    expect(def?.name).toBe('TestDef');
    expect(def?.entityType).toBe('RFQ');
    expect(engine.listDefinitions()).toHaveLength(1);
  });

  it('builds state configs with terminal/initial flags', () => {
    engine.registerDefinition(
      {
        name: 'TestDef2',
        entityType: 'RFQ',
        initialState: 'DRAFT',
        states: ['DRAFT', 'AWARDED'],
        transitions: TEST_TRANSITIONS,
        terminalStates: ['AWARDED'],
      },
      TestMachine,
    );
    const configs = engine.getStateConfigs('TestDef2');
    expect(configs.find((c) => c.name === 'DRAFT')?.isInitial).toBe(true);
    expect(configs.find((c) => c.name === 'AWARDED')?.isTerminal).toBe(true);
  });
});

describe('WorkflowEngine — execute transitions', () => {
  let engine: WorkflowEngine;
  let recorder: InMemoryWorkflowHistoryRecorder;

  beforeEach(() => {
    recorder = new InMemoryWorkflowHistoryRecorder();
    engine = new WorkflowEngine(recorder);
    engine.register('Test', TestMachine, TEST_TRANSITIONS);
  });

  it('executes a valid transition and returns next status', async () => {
    const result = await engine.execute('Test', 'DRAFT', 'submit', makeContext());
    expect(result.result).toBe('SUCCESS');
    expect(result.toStatus).toBe('SENT');
    expect(result.fromStatus).toBe('DRAFT');
  });

  it('records SUCCESS history on valid transition', async () => {
    await engine.execute('Test', 'DRAFT', 'submit', makeContext());
    const entries = await recorder.list();
    expect(entries).toHaveLength(1);
    expect(entries[0].result).toBe('SUCCESS');
    expect(entries[0].fromStatus).toBe('DRAFT');
    expect(entries[0].toStatus).toBe('SENT');
    expect(entries[0].entityType).toBe('RFQ');
    expect(entries[0].actorId).toBe('user-1');
  });

  it('records INVALID_TRANSITION and throws for invalid transition', async () => {
    await expect(engine.execute('Test', 'DRAFT', 'award', makeContext())).rejects.toThrow('WORKFLOW_INVALID_TRANSITION');
    const entries = await recorder.list();
    expect(entries[0].result).toBe('INVALID_TRANSITION');
  });

  it('throws WORKFLOW_DEFINITION_NOT_FOUND for unknown name', async () => {
    await expect(engine.execute('Nope', 'DRAFT', 'submit', makeContext())).rejects.toThrow('WORKFLOW_DEFINITION_NOT_FOUND');
  });

  it('executes without context (system transitions) and skips history', async () => {
    const result = await engine.execute('Test', 'DRAFT', 'submit');
    expect(result.toStatus).toBe('SENT');
    expect(await recorder.list()).toHaveLength(0);
  });

  it('executes a chain of transitions', async () => {
    const r1 = await engine.execute('Test', 'DRAFT', 'submit', makeContext());
    const r2 = await engine.execute('Test', r1.toStatus, 'send', makeContext());
    expect(r2.toStatus).toBe('OPEN');
  });
});

describe('WorkflowEngine — Guards', () => {
  let engine: WorkflowEngine;
  let recorder: InMemoryWorkflowHistoryRecorder;

  beforeEach(() => {
    registerGuard('adminOnly', createAuthorizationGuard(['ADMIN']));
    recorder = new InMemoryWorkflowHistoryRecorder();
    engine = new WorkflowEngine(recorder);
    engine.registerDefinition(
      {
        name: 'Guarded',
        entityType: 'RFQ',
        initialState: 'DRAFT',
        states: ['DRAFT', 'SENT'],
        transitions: TEST_TRANSITIONS,
        guards: { submit: ['adminOnly'] },
      },
      TestMachine,
    );
  });

  it('allows transition when guard passes', async () => {
    const result = await engine.execute('Guarded', 'DRAFT', 'submit', makeContext({ actorRole: 'ADMIN' }));
    expect(result.result).toBe('SUCCESS');
    expect(result.toStatus).toBe('SENT');
  });

  it('blocks transition when guard fails and records BLOCKED_BY_GUARD', async () => {
    const result = await engine.execute('Guarded', 'DRAFT', 'submit', makeContext({ actorRole: 'SUPPLIER' }));
    expect(result.result).toBe('BLOCKED_BY_GUARD');
    expect(result.blockedBy).toBe('adminOnly');
    expect(result.reason).toContain('ROLE_NOT_ALLOWED');
    const entries = await recorder.list();
    expect(entries[0].result).toBe('BLOCKED_BY_GUARD');
    expect(entries[0].guardName).toBe('adminOnly');
  });

  it('blocks when actor role is missing', async () => {
    const result = await engine.execute('Guarded', 'DRAFT', 'submit', makeContext({ actorRole: undefined }));
    expect(result.result).toBe('BLOCKED_BY_GUARD');
    expect(result.reason).toBe('MISSING_ACTOR_ROLE');
  });

  it('returns UNKNOWN_GUARD reason when guard not registered', async () => {
    engine.registerDefinition(
      {
        name: 'MissingGuard',
        entityType: 'RFQ',
        initialState: 'DRAFT',
        states: ['DRAFT', 'SENT'],
        transitions: TEST_TRANSITIONS,
        guards: { submit: ['notRegistered'] },
      },
      TestMachine,
    );
    const result = await engine.execute('MissingGuard', 'DRAFT', 'submit', makeContext({ actorRole: 'ADMIN' }));
    expect(result.result).toBe('BLOCKED_BY_GUARD');
    expect(result.reason).toBe('UNKNOWN_GUARD:notRegistered');
  });

  it('supports deadline guards', async () => {
    const pastDeadline = createDeadlineGuard(() => new Date(Date.now() - 1000));
    registerGuard('pastDeadline', pastDeadline);
    engine.registerDefinition(
      {
        name: 'Deadline',
        entityType: 'RFQ',
        initialState: 'DRAFT',
        states: ['DRAFT', 'SENT'],
        transitions: TEST_TRANSITIONS,
        guards: { submit: ['pastDeadline'] },
      },
      TestMachine,
    );
    const result = await engine.execute('Deadline', 'DRAFT', 'submit', makeContext());
    expect(result.result).toBe('BLOCKED_BY_GUARD');
    expect(result.reason).toBe('DEADLINE_PASSED');
  });

  it('passes when deadline guard has no deadline', async () => {
    const noDeadline = createDeadlineGuard(() => null);
    registerGuard('noDeadline', noDeadline);
    engine.registerDefinition(
      {
        name: 'NoDeadline',
        entityType: 'RFQ',
        initialState: 'DRAFT',
        states: ['DRAFT', 'SENT'],
        transitions: TEST_TRANSITIONS,
        guards: { submit: ['noDeadline'] },
      },
      TestMachine,
    );
    const result = await engine.execute('NoDeadline', 'DRAFT', 'submit', makeContext());
    expect(result.result).toBe('SUCCESS');
  });
});
