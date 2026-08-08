import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const { authMock, requirePermissionMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  requirePermissionMock: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ auth: authMock }));

vi.mock('@/lib/rbac', () => ({ requirePermission: requirePermissionMock }));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    surveyQuestion: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    surveySection: { findUnique: vi.fn() },
    questionOption: { deleteMany: vi.fn(), createMany: vi.fn() },
  },
}));

import { prisma } from '@/lib/prisma';
import { GET as GET_LIST, POST as POST_CREATE } from '@/app/api/admin/survey/questions/route';
import {
  GET as GET_ONE,
  PUT as PUT_UPDATE,
  DELETE as DELETE_QUESTION,
} from '@/app/api/admin/survey/questions/[id]/route';
import { PATCH as PATCH_REORDER } from '@/app/api/admin/survey/questions/[id]/order/route';

const ADMIN = { id: 'admin-1', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' };

function req(url: string, init?: RequestInit): NextRequest {
  return new Request(url, init) as unknown as NextRequest;
}

function jsonReq(url: string, method: string, body: unknown): NextRequest {
  return req(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function paramsFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

function allowAdmin() {
  authMock.mockResolvedValue({ user: ADMIN });
  requirePermissionMock.mockResolvedValue({ allowed: true, error: null, status: 200 });
}

beforeEach(() => {
  vi.clearAllMocks();
  (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (arg: unknown) => {
    if (typeof arg === 'function') {
      return (arg as (tx: typeof prisma) => Promise<unknown>)(prisma);
    }
    return arg;
  });
  allowAdmin();
});

describe('GET /api/admin/survey/questions (list)', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null);
    const res = await GET_LIST(req('http://localhost/api/admin/survey/questions'));
    expect(res.status).toBe(401);
  });

  it('returns 403 when the user lacks the view permission', async () => {
    requirePermissionMock.mockResolvedValue({ allowed: false, error: 'Forbidden', status: 403 });
    const res = await GET_LIST(req('http://localhost/api/admin/survey/questions'));
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid query parameters', async () => {
    const res = await GET_LIST(req('http://localhost/api/admin/survey/questions?page=0&limit=999'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns a paginated envelope with items', async () => {
    vi.mocked(prisma.surveyQuestion.findMany).mockResolvedValue([
      { id: 'q1', title: 'Company size', questionType: 'TEXT', sortOrder: 0 },
    ] as never);
    vi.mocked(prisma.surveyQuestion.count).mockResolvedValue(1);

    const res = await GET_LIST(req('http://localhost/api/admin/survey/questions?page=1&limit=10'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.pagination).toMatchObject({ page: 1, limit: 10, total: 1 });
    expect(prisma.surveyQuestion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
  });
});

describe('POST /api/admin/survey/questions (create)', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null);
    const res = await POST_CREATE(jsonReq('http://localhost/api/admin/survey/questions', 'POST', {}));
    expect(res.status).toBe(401);
  });

  it('returns 403 when the user lacks the edit permission', async () => {
    requirePermissionMock.mockResolvedValue({ allowed: false, error: 'Forbidden', status: 403 });
    const res = await POST_CREATE(jsonReq('http://localhost/api/admin/survey/questions', 'POST', {}));
    expect(res.status).toBe(403);
  });

  it('returns 400 for an invalid payload (missing title)', async () => {
    const res = await POST_CREATE(
      jsonReq('http://localhost/api/admin/survey/questions', 'POST', {
        questionType: 'TEXT',
        sectionId: 'sec1',
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for a choice question with fewer than 2 options', async () => {
    const res = await POST_CREATE(
      jsonReq('http://localhost/api/admin/survey/questions', 'POST', {
        title: 'Pick one',
        questionType: 'SINGLE_CHOICE',
        sectionId: 'sec1',
        options: [{ label: 'Only one' }],
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when the section does not exist', async () => {
    vi.mocked(prisma.surveySection.findUnique).mockResolvedValue(null as never);
    const res = await POST_CREATE(
      jsonReq('http://localhost/api/admin/survey/questions', 'POST', {
        title: 'What is your company size?',
        questionType: 'TEXT',
        sectionId: 'missing',
      }),
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('SURVEY_SECTION_NOT_FOUND');
  });

  it('creates the question with auto-computed sortOrder', async () => {
    vi.mocked(prisma.surveySection.findUnique).mockResolvedValue({
      id: 'sec1', surveyId: 'sv1', title: 'Section',
    } as never);
    vi.mocked(prisma.surveyQuestion.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.surveyQuestion.create).mockResolvedValue({
      id: 'q1', title: 'What is your company size?', questionType: 'TEXT', sectionId: 'sec1', sortOrder: 0,
    } as never);

    const res = await POST_CREATE(
      jsonReq('http://localhost/api/admin/survey/questions', 'POST', {
        title: 'What is your company size?',
        questionType: 'TEXT',
        sectionId: 'sec1',
        isRequired: true,
      }),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('q1');

    expect(prisma.surveyQuestion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          section: { connect: { id: 'sec1' } },
          sortOrder: 0,
        }),
      }),
    );
  });
});

describe('GET /api/admin/survey/questions/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null);
    const res = await GET_ONE(req('http://localhost/api/admin/survey/questions/q1'), paramsFor('q1'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when the question does not exist', async () => {
    vi.mocked(prisma.surveyQuestion.findUnique).mockResolvedValue(null as never);
    const res = await GET_ONE(req('http://localhost/api/admin/survey/questions/q1'), paramsFor('q1'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('SURVEY_QUESTION_NOT_FOUND');
  });

  it('returns the question', async () => {
    vi.mocked(prisma.surveyQuestion.findUnique).mockResolvedValue({
      id: 'q1', title: 'Company size', questionType: 'TEXT', sectionId: 'sec1', options: [],
    } as never);
    const res = await GET_ONE(req('http://localhost/api/admin/survey/questions/q1'), paramsFor('q1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('q1');
  });
});

describe('PUT /api/admin/survey/questions/[id] (update)', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null);
    const res = await PUT_UPDATE(
      jsonReq('http://localhost/api/admin/survey/questions/q1', 'PUT', {}),
      paramsFor('q1'),
    );
    expect(res.status).toBe(401);
  });

  it('returns 403 when the user lacks the edit permission', async () => {
    requirePermissionMock.mockResolvedValue({ allowed: false, error: 'Forbidden', status: 403 });
    const res = await PUT_UPDATE(
      jsonReq('http://localhost/api/admin/survey/questions/q1', 'PUT', {}),
      paramsFor('q1'),
    );
    expect(res.status).toBe(403);
  });

  it('returns 404 when the question does not exist', async () => {
    vi.mocked(prisma.surveyQuestion.findUnique).mockResolvedValue(null as never);
    const res = await PUT_UPDATE(
      jsonReq('http://localhost/api/admin/survey/questions/q1', 'PUT', { title: 'New' }),
      paramsFor('q1'),
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('SURVEY_QUESTION_NOT_FOUND');
  });

  it('returns 404 when moving to a section that does not exist', async () => {
    vi.mocked(prisma.surveyQuestion.findUnique).mockResolvedValue({
      id: 'q1', sectionId: 'sec1', questionType: 'TEXT',
    } as never);
    vi.mocked(prisma.surveySection.findUnique).mockResolvedValue(null as never);
    const res = await PUT_UPDATE(
      jsonReq('http://localhost/api/admin/survey/questions/q1', 'PUT', { sectionId: 'missing' }),
      paramsFor('q1'),
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('SURVEY_SECTION_NOT_FOUND');
  });

  it('returns 400 when a choice question is updated with too few options', async () => {
    vi.mocked(prisma.surveyQuestion.findUnique).mockResolvedValue({
      id: 'q1', sectionId: 'sec1', questionType: 'SINGLE_CHOICE',
    } as never);
    const res = await PUT_UPDATE(
      jsonReq('http://localhost/api/admin/survey/questions/q1', 'PUT', {
        options: [{ label: 'Only one' }],
      }),
      paramsFor('q1'),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('SURVEY_QUESTION_VALIDATION');
  });

  it('updates the question and replaces its options in a transaction', async () => {
    vi.mocked(prisma.surveyQuestion.findUnique).mockResolvedValue({
      id: 'q1', sectionId: 'sec1', questionType: 'TEXT',
    } as never);
    vi.mocked(prisma.surveyQuestion.update).mockResolvedValue({
      id: 'q1', title: 'Updated', questionType: 'TEXT', sectionId: 'sec1',
    } as never);

    const res = await PUT_UPDATE(
      jsonReq('http://localhost/api/admin/survey/questions/q1', 'PUT', {
        title: 'Updated',
        isRequired: false,
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      }),
      paramsFor('q1'),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    expect(prisma.questionOption.deleteMany).toHaveBeenCalledWith({
      where: { questionId: 'q1' },
    });
    expect(prisma.questionOption.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ label: 'A', value: 'a', questionId: 'q1' }),
        ]),
      }),
    );
    expect(prisma.surveyQuestion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'q1' },
        data: expect.objectContaining({ title: 'Updated', isRequired: false }),
      }),
    );
  });
});

describe('DELETE /api/admin/survey/questions/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null);
    const res = await DELETE_QUESTION(req('http://localhost/api/admin/survey/questions/q1'), paramsFor('q1'));
    expect(res.status).toBe(401);
  });

  it('returns 403 when the user lacks the edit permission', async () => {
    requirePermissionMock.mockResolvedValue({ allowed: false, error: 'Forbidden', status: 403 });
    const res = await DELETE_QUESTION(req('http://localhost/api/admin/survey/questions/q1'), paramsFor('q1'));
    expect(res.status).toBe(403);
  });

  it('returns 404 when the question does not exist', async () => {
    vi.mocked(prisma.surveyQuestion.findUnique).mockResolvedValue(null as never);
    const res = await DELETE_QUESTION(req('http://localhost/api/admin/survey/questions/q1'), paramsFor('q1'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('SURVEY_QUESTION_NOT_FOUND');
  });

  it('returns 409 when the question already has responses (FK P2003)', async () => {
    vi.mocked(prisma.surveyQuestion.findUnique).mockResolvedValue({ id: 'q1' } as never);
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockRejectedValue(
      Object.assign(new Error('Foreign key constraint failed'), { code: 'P2003' }),
    );

    const res = await DELETE_QUESTION(req('http://localhost/api/admin/survey/questions/q1'), paramsFor('q1'));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error.code).toBe('SURVEY_QUESTION_HAS_RESPONSES');
  });

  it('deletes the question and its options', async () => {
    vi.mocked(prisma.surveyQuestion.findUnique).mockResolvedValue({ id: 'q1' } as never);
    const res = await DELETE_QUESTION(req('http://localhost/api/admin/survey/questions/q1'), paramsFor('q1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(prisma.questionOption.deleteMany).toHaveBeenCalledWith({ where: { questionId: 'q1' } });
    expect(prisma.surveyQuestion.delete).toHaveBeenCalledWith({ where: { id: 'q1' } });
  });
});

describe('PATCH /api/admin/survey/questions/[id]/order (reorder)', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null);
    const res = await PATCH_REORDER(
      jsonReq('http://localhost/api/admin/survey/questions/q1/order', 'PATCH', {}),
      paramsFor('q1'),
    );
    expect(res.status).toBe(401);
  });

  it('returns 403 when the user lacks the edit permission', async () => {
    requirePermissionMock.mockResolvedValue({ allowed: false, error: 'Forbidden', status: 403 });
    const res = await PATCH_REORDER(
      jsonReq('http://localhost/api/admin/survey/questions/q1/order', 'PATCH', {}),
      paramsFor('q1'),
    );
    expect(res.status).toBe(403);
  });

  it('returns 400 when neither sortOrder nor direction is provided', async () => {
    const res = await PATCH_REORDER(
      jsonReq('http://localhost/api/admin/survey/questions/q1/order', 'PATCH', {}),
      paramsFor('q1'),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when the question does not exist', async () => {
    vi.mocked(prisma.surveyQuestion.findUnique).mockResolvedValue(null as never);
    const res = await PATCH_REORDER(
      jsonReq('http://localhost/api/admin/survey/questions/q1/order', 'PATCH', { direction: 'down' }),
      paramsFor('q1'),
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('SURVEY_QUESTION_NOT_FOUND');
  });

  it('reorders the question among its siblings', async () => {
    vi.mocked(prisma.surveyQuestion.findUnique)
      .mockResolvedValueOnce({ id: 'q1', sectionId: 'sec1' } as never)
      .mockResolvedValueOnce({
        id: 'q1', title: 'Q1', questionType: 'TEXT', sectionId: 'sec1', options: [],
      } as never);
    vi.mocked(prisma.surveyQuestion.findMany).mockResolvedValue([
      { id: 'q1' },
      { id: 'q2' },
    ] as never);

    const res = await PATCH_REORDER(
      jsonReq('http://localhost/api/admin/survey/questions/q1/order', 'PATCH', { direction: 'down' }),
      paramsFor('q1'),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    const updateArgs = vi.mocked(prisma.surveyQuestion.update).mock.calls.map(([arg]) => arg);
    expect(updateArgs).toContainEqual(
      expect.objectContaining({ where: { id: 'q1' }, data: { sortOrder: 1 } }),
    );
    expect(updateArgs).toContainEqual(
      expect.objectContaining({ where: { id: 'q2' }, data: { sortOrder: 0 } }),
    );
  });
});
