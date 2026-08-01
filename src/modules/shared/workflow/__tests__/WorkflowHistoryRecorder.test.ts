import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryWorkflowHistoryRecorder } from '../WorkflowHistoryRecorder';
import { createAuthorizationGuard, createCompletenessGuard, createDeadlineGuard, listGuards, registerGuard, runGuards } from '../WorkflowGuards';

function guardCtx(overrides = {}) {
  return {
    entityId: 'ent-1',
    entityType: 'RFQ',
    action: 'submit',
    fromStatus: 'DRAFT',
    toStatus: 'SENT',
    actorId: 'user-1',
    actorRole: 'ADMIN',
    metadata: {},
    ...overrides,
  };
}

describe('InMemoryWorkflowHistoryRecorder', () => {
  let recorder: InMemoryWorkflowHistoryRecorder;

  beforeEach(() => {
    recorder = new InMemoryWorkflowHistoryRecorder();
  });

  it('records an entry with id and createdAt', async () => {
    const entry = await recorder.record({
      entityType: 'RFQ',
      entityId: 'ent-1',
      action: 'submit',
      fromStatus: 'DRAFT',
      toStatus: 'SENT',
      result: 'SUCCESS',
      actorId: 'user-1',
    });
    expect(entry.id).toBeDefined();
    expect(entry.createdAt).toBeInstanceOf(Date);
  });

  it('lists entries by entity sorted chronologically', async () => {
    await recorder.record({ entityType: 'RFQ', entityId: 'ent-1', action: 'submit', fromStatus: 'DRAFT', toStatus: 'SENT', result: 'SUCCESS' });
    await recorder.record({ entityType: 'RFQ', entityId: 'ent-1', action: 'send', fromStatus: 'SENT', toStatus: 'OPEN', result: 'SUCCESS' });
    await recorder.record({ entityType: 'PO', entityId: 'ent-9', action: 'issue', fromStatus: 'DRAFT', toStatus: 'ISSUED', result: 'SUCCESS' });

    const rfq = await recorder.listByEntity('RFQ', 'ent-1');
    expect(rfq).toHaveLength(2);
    expect(rfq[0].action).toBe('submit');
    expect(rfq[1].action).toBe('send');

    const po = await recorder.listByEntity('PO', 'ent-9');
    expect(po).toHaveLength(1);
  });

  it('stores full audit metadata', async () => {
    await recorder.record({
      entityType: 'RFQ',
      entityId: 'ent-1',
      action: 'submit',
      fromStatus: 'DRAFT',
      toStatus: 'SENT',
      result: 'BLOCKED_BY_GUARD',
      guardName: 'adminOnly',
      reason: 'ROLE_NOT_ALLOWED:SUPPLIER',
      actorId: 'user-2',
      actorRole: 'SUPPLIER',
      metadata: { note: 'test' },
    });
    const entries = await recorder.list();
    expect(entries[0].guardName).toBe('adminOnly');
    expect(entries[0].actorRole).toBe('SUPPLIER');
    expect(entries[0].metadata).toEqual({ note: 'test' });
  });

  it('lists all entries', async () => {
    await recorder.record({ entityType: 'RFQ', entityId: 'a', action: 'submit', fromStatus: 'DRAFT', toStatus: 'SENT', result: 'SUCCESS' });
    await recorder.record({ entityType: 'RFQ', entityId: 'b', action: 'submit', fromStatus: 'DRAFT', toStatus: 'SENT', result: 'SUCCESS' });
    expect(await recorder.list()).toHaveLength(2);
  });

  it('returns empty list for unknown entity', async () => {
    expect(await recorder.listByEntity('RFQ', 'nope')).toEqual([]);
  });

  it('clears all entries', async () => {
    await recorder.record({ entityType: 'RFQ', entityId: 'a', action: 'submit', fromStatus: 'DRAFT', toStatus: 'SENT', result: 'SUCCESS' });
    recorder.clear();
    expect(await recorder.list()).toHaveLength(0);
  });
});

describe('WorkflowGuards — general guard factories', () => {
  it('authorization guard allows permitted roles', () => {
    const guard = createAuthorizationGuard(['ADMIN', 'BUYER']);
    expect(guard(guardCtx({ actorRole: 'BUYER' })).allowed).toBe(true);
    expect(guard(guardCtx({ actorRole: 'SUPPLIER' })).allowed).toBe(false);
  });

  it('authorization guard rejects missing role', () => {
    const guard = createAuthorizationGuard(['ADMIN']);
    const result = guard(guardCtx({ actorRole: undefined }));
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('MISSING_ACTOR_ROLE');
  });

  it('deadline guard rejects past deadline', () => {
    const guard = createDeadlineGuard(() => new Date(Date.now() - 5000));
    expect(guard(guardCtx()).allowed).toBe(false);
  });

  it('deadline guard passes future or null deadline', () => {
    const future = createDeadlineGuard(() => new Date(Date.now() + 10000));
    expect(future(guardCtx()).allowed).toBe(true);
    const none = createDeadlineGuard(() => null);
    expect(none(guardCtx()).allowed).toBe(true);
  });

  it('completeness guard rejects missing fields', () => {
    const guard = createCompletenessGuard(['supplierId', 'amount'], () => ({ supplierId: 's-1', amount: null }));
    const result = guard(guardCtx());
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('MISSING_FIELDS:amount');
  });

  it('completeness guard passes when all fields present', () => {
    const guard = createCompletenessGuard(['supplierId', 'amount'], () => ({ supplierId: 's-1', amount: 100 }));
    expect(guard(guardCtx()).allowed).toBe(true);
  });
});

describe('WorkflowGuards — registry', () => {
  it('registers, retrieves, checks and lists guards', () => {
    registerGuard('regTest', () => ({ allowed: true }));
    expect(listGuards()).toContain('regTest');
  });

  it('runGuards returns UNKNOWN_GUARD for missing guard', async () => {
    const results = await runGuards(['missing1'], guardCtx());
    expect(results[0].allowed).toBe(false);
    expect(results[0].reason).toBe('UNKNOWN_GUARD:missing1');
  });

  it('runGuards aggregates results in order', async () => {
    registerGuard('ok1', () => ({ allowed: true }));
    registerGuard('block1', () => ({ allowed: false, reason: 'NOPE' }));
    registerGuard('ok2', () => ({ allowed: true }));
    const results = await runGuards(['ok1', 'block1', 'ok2'], guardCtx());
    expect(results.map((r) => r.allowed)).toEqual([true, false, true]);
  });

  it('runGuards supports async guards', async () => {
    registerGuard('async1', async () => ({ allowed: true }));
    const results = await runGuards(['async1'], guardCtx());
    expect(results[0].allowed).toBe(true);
  });
});
