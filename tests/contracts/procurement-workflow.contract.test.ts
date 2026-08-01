import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const { executeMock, listMock } = vi.hoisted(() => ({
  executeMock: vi.fn(),
  listMock: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'buyer-1', email: 'buyer@test.com', role: 'BUYER' },
  }),
}));

vi.mock('@/modules/procurement/services/ProcurementWorkflowOrchestrator', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    procurementWorkflowOrchestrator: {
      execute: executeMock,
      getHistoryService: () => ({ list: listMock }),
    },
  };
});

vi.mock('@/modules/shared/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('@/modules/shared/events/event-bus', () => ({
  eventBus: { publish: vi.fn() },
}));

import { POST } from '@/app/api/v1/procurement/workflow/transition/route';
import { GET as GET_HISTORY } from '@/app/api/v1/procurement/workflow/history/route';

async function jsonResponse(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

function nextRequest(body?: unknown): NextRequest {
  return new Request('http://localhost/api/v1/procurement/workflow/transition', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe('Workflow Transition API (Contract)', () => {
  beforeEach(() => {
    executeMock.mockReset();
    listMock.mockReset();
  });

  it('returns 401 when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    const res = await POST(nextRequest({ entityType: 'Award', entityId: 'aw1', action: 'accept' }));
    expect(res.status).toBe(401);
  });

  it('returns 422 for invalid payload', async () => {
    const res = await POST(nextRequest({ entityType: 'Unknown', entityId: 'x', action: 'go' }));
    expect(res.status).toBe(422);
  });

  it('returns 403 when transition is blocked by a guard', async () => {
    executeMock.mockResolvedValue({
      result: 'BLOCKED_BY_GUARD',
      fromStatus: 'PENDING_ACCEPTANCE',
      toStatus: 'PENDING_ACCEPTANCE',
      action: 'accept',
      entityType: 'Award',
      entityId: 'aw1',
      blockedBy: 'award.accept.rbac',
      reason: 'NOT_SUPPLIER',
    });
    const res = await POST(nextRequest({ entityType: 'Award', entityId: 'aw1', action: 'accept' }));
    expect(res.status).toBe(403);
    const body = await jsonResponse(res);
    expect(body.success).toBe(false);
    expect((body.error as { code: string }).code).toBe('CORE_USER_FORBIDDEN');
  });

  it('returns 409 when the transition is invalid for the current status', async () => {
    executeMock.mockResolvedValue({
      result: 'INVALID_TRANSITION',
      fromStatus: 'DRAFT',
      toStatus: 'DRAFT',
      action: 'approve',
      entityType: 'PurchaseRequest',
      entityId: 'pr1',
    });
    const res = await POST(nextRequest({ entityType: 'PurchaseRequest', entityId: 'pr1', action: 'approve' }));
    expect(res.status).toBe(409);
  });

  it('returns the success envelope on a valid transition', async () => {
    executeMock.mockResolvedValue({
      result: 'SUCCESS',
      fromStatus: 'PENDING_ACCEPTANCE',
      toStatus: 'ACCEPTED',
      action: 'accept',
      entityType: 'Award',
      entityId: 'aw1',
      eventName: 'Procurement.Award.Accepted',
    });
    const res = await POST(
      nextRequest({ entityType: 'Award', entityId: 'aw1', action: 'accept', reason: 'Offer accepted' }),
    );
    expect(res.status).toBe(200);
    const body = await jsonResponse(res);
    expect(body.success).toBe(true);
    const data = body.data as { toStatus: string };
    expect(data.toStatus).toBe('ACCEPTED');
    expect(executeMock).toHaveBeenCalledWith('Award', 'accept', expect.objectContaining({ entityId: 'aw1', actorId: 'buyer-1', actorRole: 'BUYER', reason: 'Offer accepted' }));
  });
});

describe('Workflow History API (Contract)', () => {
  it('returns 401 when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    const res = await GET_HISTORY(
      new Request('http://localhost/api/v1/procurement/workflow/history') as unknown as NextRequest,
    );
    expect(res.status).toBe(401);
  });

  it('returns paginated history', async () => {
    listMock.mockResolvedValue({
      items: [{ id: 'wh1', entityType: 'Award', entityId: 'aw1', action: 'accept', result: 'SUCCESS' }],
      total: 1,
      page: 1,
      limit: 20,
    });
    const res = await GET_HISTORY(
      new Request('http://localhost/api/v1/procurement/workflow/history?entityType=Award&page=1&limit=20') as unknown as NextRequest,
    );
    expect(res.status).toBe(200);
    const body = await jsonResponse(res);
    expect(body.success).toBe(true);
    expect((body.data as unknown[]).length).toBe(1);
    const pagination = body.pagination as { total: number; page: number };
    expect(pagination.total).toBe(1);
    expect(listMock).toHaveBeenCalledWith({ entityType: 'Award', entityId: undefined, page: 1, limit: 20 });
  });
});
