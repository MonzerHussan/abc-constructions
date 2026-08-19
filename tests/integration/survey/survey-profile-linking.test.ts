import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));

vi.mock('@/lib/auth', () => ({ auth: authMock }));

vi.mock('@/lib/rbac', () => ({ requirePermission: vi.fn() }));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    entity: { create: vi.fn() },
    profile: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    entityRegistryCounter: { upsert: vi.fn() },
    interaction: { create: vi.fn() },
  },
}));

vi.mock('@/modules/shared/events/event-bus', () => ({
  eventBus: { publish: vi.fn() },
}));

vi.mock('@/modules/shared/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { prisma } from '@/lib/prisma';
import { POST as POST_SYNC_ENTITY_PROFILE } from '@/app/api/v1/entity-registry/sync-entity-profile/route';
import { submitOnboarding } from '@/lib/onboarding/api';
import type { OnboardingState } from '@/lib/onboarding/types';

const USER = { id: 'user-1', email: 'user@example.com', name: 'User' };

function jsonReq(url: string, body: unknown): NextRequest {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe('Automatic linking: Onboarding → POST /api/v1/entity-registry/sync-entity-profile → Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ user: USER });
    (prisma.entityRegistryCounter.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ value: 1 });
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
    );
    (prisma.entity.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'e1', entityId: 'ENTITY-00001', entityType: 'SUPP', companyName: 'ABC Contracting',
    });
    (prisma.profile.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'p1', profileId: 'PROF-00001', entityId: 'e1', userId: USER.id,
    });
  });

  it('submitOnboarding maps survey answers to the Profile payload fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          entity: { entityId: 'ENTITY-00001' },
          profile: { profileId: 'PROF-00001' },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const state: OnboardingState = {
      step: 3,
      profile: {
        accountType: 'supplier',
        fullName: 'Ali',
        email: 'ali@example.com',
        phone: '0555000000',
        companyName: 'ABC Contracting',
      },
      documents: [
        { id: 'd1', type: 'commercialRegistration', file: null, name: 'cr.pdf', status: 'uploaded', progress: 100 },
      ],
      survey: {
        lookingFor: [],
        selectedCategories: ['construction-materials', 'finishing'],
        subcategories: ['portland-cement', 'tiles'],
        hasProjects: 'yes',
        budgetRange: 'large',
        projectLocations: ['Riyadh'],
        urgency: 'immediate',
      },
      isSubmitting: false,
      error: null,
    };

    const result = await submitOnboarding(state);

    expect(result.success).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/entity-registry/sync-entity-profile');
    const body = JSON.parse(init.body as string);

    // Mapping from the onboarding survey to the Profile fields:
    expect(body.entity.entityType).toBe('SUPP');
    expect(body.entity.entitySubtype).toBe('SUPPLIER');
    expect(body.profile.businessActivity).toBe('supplier');
    expect(body.profile.companySize).toBe('large');
    expect(body.profile.relevantCategories).toEqual(['construction-materials', 'finishing']);
    expect(body.profile.subcategories).toEqual(['portland-cement', 'tiles']);
    expect(body.profile.capabilities).toEqual(['Riyadh']);
    expect(body.profile.surveyData).toEqual(
      expect.objectContaining({
        selectedCategories: ['construction-materials', 'finishing'],
        subcategories: ['portland-cement', 'tiles'],
        hasProjects: 'yes',
        budgetRange: 'large',
        urgency: 'immediate',
      }),
    );

    // Security: userId is never sent from the client.
    expect(body.profile.userId).toBeUndefined();
    vi.unstubAllGlobals();
  });

  it('submitOnboarding refuses to submit when the survey is incomplete', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const state: OnboardingState = {
      step: 3,
      profile: {
        accountType: 'mainContractor',
        fullName: 'Ali',
        email: 'ali@example.com',
        phone: '0555000000',
        companyName: 'ABC',
      },
      documents: [
        { id: 'd1', type: 'license', file: null, name: 'l.pdf', status: 'uploaded', progress: 100 },
      ],
      survey: {
        lookingFor: [],
        selectedCategories: [],
        subcategories: [],
        hasProjects: '',
        budgetRange: '',
        projectLocations: [],
        urgency: '',
      },
      isSubmitting: false,
      error: null,
    };

    const result = await submitOnboarding(state);
    expect(result.success).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null);
    const res = await POST_SYNC_ENTITY_PROFILE(
      jsonReq('http://localhost/api/v1/entity-registry/sync-entity-profile', {
        entity: { entityType: 'SUPP', entitySubtype: 'SUPPLIER', companyName: 'X', source: 'INTERNAL' },
      }),
    );
    expect(res.status).toBe(401);
  });

  it('returns 422 for an invalid payload', async () => {
    const res = await POST_SYNC_ENTITY_PROFILE(
      jsonReq('http://localhost/api/v1/entity-registry/sync-entity-profile', {
        entity: { entityType: 'SUPP', entitySubtype: 'SUPPLIER' },
      }),
    );
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('creates the Profile from the survey answers with the session userId', async () => {
    const res = await POST_SYNC_ENTITY_PROFILE(
      jsonReq('http://localhost/api/v1/entity-registry/sync-entity-profile', {
        entity: {
          entityType: 'SUPP',
          entitySubtype: 'SUPPLIER',
          companyName: 'ABC Contracting',
          contactPerson: 'Ali',
          contactEmail: 'ali@example.com',
          contactPhone: '0555000000',
          languagePreference: 'ARABIC',
          relationshipStatus: 'NEW',
          source: 'INTERNAL',
          sourceDetail: 'onboarding',
          pilotStatus: 'STARTED',
          crmClassification: 'SUPPLIER',
        },
        profile: {
          businessActivity: 'supplier',
          companySize: 'large',
          relevantCategories: ['construction-materials', 'finishing'],
          subcategories: ['portland-cement', 'tiles'],
          capabilities: ['Riyadh'],
        },
      }),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.entity.entityId).toBe('ENTITY-00001');

    expect(prisma.entity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entityId: 'ENTITY-00001',
          entityType: 'SUPP',
          companyName: 'ABC Contracting',
        }),
      }),
    );
    // Automatic linking: the Profile row carries all the survey-derived fields
    // plus the session userId (never a body-supplied userId).
    expect(prisma.profile.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: USER.id,
          businessActivity: 'supplier',
          companySize: 'large',
          relevantCategories: ['construction-materials', 'finishing'],
          subcategories: ['portland-cement', 'tiles'],
          capabilities: ['Riyadh'],
          entityId: 'e1',
        }),
      }),
    );
  });

  it('ignores any userId sent in the body — the session userId wins (IDOR protection)', async () => {
    await POST_SYNC_ENTITY_PROFILE(
      jsonReq('http://localhost/api/v1/entity-registry/sync-entity-profile', {
        entity: { entityType: 'CUST', entitySubtype: 'CONTRACTOR', companyName: 'X', source: 'INTERNAL' },
        profile: {
          userId: 'attacker-user-id',
          businessActivity: 'mainContractor',
          companySize: 'small',
        },
      }),
    );

    expect(prisma.profile.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: USER.id }),
      }),
    );
    const createCall = vi.mocked(prisma.profile.create).mock.calls[0]?.[0] as {
      data: { userId?: string };
    };
    expect(createCall.data.userId).not.toBe('attacker-user-id');
  });
});
