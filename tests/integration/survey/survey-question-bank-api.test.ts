import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
const prismaMock = vi.hoisted(() => {
  const onboardingQuestion = {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return { onboardingQuestion };
});

const requirePermissionMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth', () => ({ auth: authMock }));
vi.mock('@/lib/rbac', () => ({ requirePermission: requirePermissionMock }));
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

vi.mock('@/modules/shared/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { GET as LIST_GET, POST as CREATE_POST } from '@/app/api/v1/entity-registry/survey/questions/route';
import {
  GET as ITEM_GET,
  PATCH as ITEM_PATCH,
  DELETE as ITEM_DELETE,
} from '@/app/api/v1/entity-registry/survey/questions/[id]/route';

const USER = { id: 'admin-1', email: 'admin@example.com', name: 'Admin' };

function jsonReq(url: string, body?: unknown): NextRequest {
  return new Request(url, {
    method: body !== undefined ? 'POST' : 'GET',
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }) as unknown as NextRequest;
}

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'q_construction_1',
    category: 'construction-materials',
    questionText: 'Which materials do you use?',
    answerType: 'MULTIPLE_CHOICE',
    options: [
      { label: 'Cement', value: 'cement' },
      { label: 'Steel', value: 'steel' },
    ],
    order: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('Question Bank API — full CRUD flow (used by QuestionBankManager)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ user: USER });
    requirePermissionMock.mockResolvedValue({ allowed: true, error: null, status: 200 });
  });

  it('401 without a session', async () => {
    authMock.mockResolvedValue(null);
    const res = await LIST_GET(jsonReq('http://localhost/api/v1/entity-registry/survey/questions'));
    expect(res.status).toBe(401);
  });

  it('403 write without research.survey.edit permission', async () => {
    requirePermissionMock.mockResolvedValue({ allowed: false, error: 'Forbidden', status: 403 });
    const res = await CREATE_POST(
      jsonReq('http://localhost/api/v1/entity-registry/survey/questions', {
        category: 'construction-materials',
        questionText: 'Unauthorized write?',
        answerType: 'MULTIPLE_CHOICE',
        options: [{ label: 'A' }, { label: 'B' }],
      }),
    );
    expect(res.status).toBe(403);
    expect(prismaMock.onboardingQuestion.create).not.toHaveBeenCalled();
  });

  it('lists questions (paginated)', async () => {
    prismaMock.onboardingQuestion.findMany.mockResolvedValue([makeItem()]);
    prismaMock.onboardingQuestion.count.mockResolvedValue(1);

    const res = await LIST_GET(jsonReq('http://localhost/api/v1/entity-registry/survey/questions?page=1&limit=50'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.pagination.total).toBe(1);
    expect(prismaMock.onboardingQuestion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {}, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }),
    );
  });

  it('lists questions filtered by category and active flag', async () => {
    prismaMock.onboardingQuestion.findMany.mockResolvedValue([makeItem()]);
    prismaMock.onboardingQuestion.count.mockResolvedValue(1);

    await LIST_GET(jsonReq('http://localhost/api/v1/entity-registry/survey/questions?category=construction-materials&isActive=true'));
    expect(prismaMock.onboardingQuestion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'construction-materials', isActive: true }),
      }),
    );
  });

  it('creates a question', async () => {
    prismaMock.onboardingQuestion.create.mockResolvedValue(makeItem());

    const res = await CREATE_POST(
      jsonReq('http://localhost/api/v1/entity-registry/survey/questions', {
        category: 'construction-materials',
        questionText: 'Which materials do you use?',
        answerType: 'MULTIPLE_CHOICE',
        options: [
          { label: 'Cement', value: 'cement' },
          { label: 'Steel', value: 'steel' },
        ],
      }),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.questionText).toBe('Which materials do you use?');
    expect(prismaMock.onboardingQuestion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          category: 'construction-materials',
          answerType: 'MULTIPLE_CHOICE',
          options: expect.arrayContaining([expect.objectContaining({ label: 'Cement' })]),
        }),
      }),
    );
  });

  it('rejects a choice question without at least 2 options (422)', async () => {
    const res = await CREATE_POST(
      jsonReq('http://localhost/api/v1/entity-registry/survey/questions', {
        category: 'construction-materials',
        questionText: 'Pick one',
        answerType: 'SINGLE_CHOICE',
        options: [{ label: 'Only one' }],
      }),
    );
    expect(res.status).toBe(422);
    expect(prismaMock.onboardingQuestion.create).not.toHaveBeenCalled();
  });

  it('fetches a single question', async () => {
    prismaMock.onboardingQuestion.findUnique.mockResolvedValue(makeItem());
    const res = await ITEM_GET(
      jsonReq('http://localhost/api/v1/entity-registry/survey/questions/q_construction_1'),
      { params: Promise.resolve({ id: 'q_construction_1' }) } as never,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe('q_construction_1');
  });

  it('404 when a single question is missing', async () => {
    prismaMock.onboardingQuestion.findUnique.mockResolvedValue(null);
    const res = await ITEM_GET(
      jsonReq('http://localhost/api/v1/entity-registry/survey/questions/missing'),
      { params: Promise.resolve({ id: 'missing' }) } as never,
    );
    expect(res.status).toBe(404);
  });

  it('updates (toggles) a question', async () => {
    prismaMock.onboardingQuestion.findUnique.mockResolvedValue(makeItem());
    prismaMock.onboardingQuestion.update.mockResolvedValue(makeItem({ isActive: false }));

    const res = await ITEM_PATCH(
      jsonReq('http://localhost/api/v1/entity-registry/survey/questions/q_construction_1', { isActive: false }),
      { params: Promise.resolve({ id: 'q_construction_1' }) } as never,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.isActive).toBe(false);
    expect(prismaMock.onboardingQuestion.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isActive: false }) }),
    );
  });

  it('updates question text and answer type together', async () => {
    prismaMock.onboardingQuestion.findUnique.mockResolvedValue(makeItem());
    prismaMock.onboardingQuestion.update.mockResolvedValue(
      makeItem({ questionText: 'Updated?', answerType: 'YES_NO' }),
    );

    const res = await ITEM_PATCH(
      jsonReq('http://localhost/api/v1/entity-registry/survey/questions/q_construction_1', {
        questionText: 'Updated?',
        answerType: 'YES_NO',
      }),
      { params: Promise.resolve({ id: 'q_construction_1' }) } as never,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.questionText).toBe('Updated?');
    expect(body.data.answerType).toBe('YES_NO');
  });

  it('deletes a question', async () => {
    prismaMock.onboardingQuestion.findUnique.mockResolvedValue(makeItem());
    prismaMock.onboardingQuestion.delete.mockResolvedValue(makeItem());

    const res = await ITEM_DELETE(
      jsonReq('http://localhost/api/v1/entity-registry/survey/questions/q_construction_1'),
      { params: Promise.resolve({ id: 'q_construction_1' }) } as never,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe('q_construction_1');
    expect(prismaMock.onboardingQuestion.delete).toHaveBeenCalledWith({
      where: { id: 'q_construction_1' },
    });
  });

  it('404 when deleting a missing question', async () => {
    prismaMock.onboardingQuestion.findUnique.mockResolvedValue(null);
    const res = await ITEM_DELETE(
      jsonReq('http://localhost/api/v1/entity-registry/survey/questions/missing'),
      { params: Promise.resolve({ id: 'missing' }) } as never,
    );
    expect(res.status).toBe(404);
  });
});
