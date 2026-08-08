import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    entity: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    profile: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    interaction: {
      create: vi.fn(),
    },
    validation: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    leadScoring: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    consent: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    relationship: {
      create: vi.fn(),
    },
    supplierProfile: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    entityRegistryCounter: {
      upsert: vi.fn(),
    },
    onboardingQuestion: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/modules/shared/events/event-bus', () => ({
  eventBus: { publish: vi.fn() },
}));

vi.mock('@/modules/shared/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { prisma } from '@/lib/prisma';
import { EntityRegistryService, calculateLeadScore } from '@/modules/entity-registry/services/EntityRegistryService';

describe('calculateLeadScore', () => {
  it('computes weighted total and tier A', () => {
    const result = calculateLeadScore({ strategicScore: 90, engagementScore: 80, commercialScore: 85, conversionScore: 75 });
    expect(result.totalLeadScore).toBe(84);
    expect(result.tier).toBe('A');
  });

  it('computes tier B', () => {
    const result = calculateLeadScore({ strategicScore: 70, engagementScore: 65, commercialScore: 60, conversionScore: 55 });
    expect(result.totalLeadScore).toBe(63);
    expect(result.tier).toBe('B');
  });

  it('computes tier C', () => {
    const result = calculateLeadScore({ strategicScore: 45, engagementScore: 50, commercialScore: 40, conversionScore: 35 });
    expect(result.totalLeadScore).toBe(43);
    expect(result.tier).toBe('C');
  });

  it('computes tier Cold', () => {
    const result = calculateLeadScore({ strategicScore: 30, engagementScore: 25, commercialScore: 20, conversionScore: 15 });
    expect(result.totalLeadScore).toBe(23);
    expect(result.tier).toBe('Cold');
  });
});

describe('EntityRegistryService ID generation (DB-backed counter)', () => {
  let service: EntityRegistryService;

  beforeEach(() => {
    service = new EntityRegistryService();
    vi.clearAllMocks();
  });

  it('uses the DB counter (not in-memory state) to generate sequential ids', async () => {
    (prisma.entityRegistryCounter.upsert as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ value: 1 })
      .mockResolvedValueOnce({ value: 2 });

    const id1 = await service.generateEntityId();
    const id2 = await service.generateEntityId();

    expect(id1).toBe('ENTITY-00001');
    expect(id2).toBe('ENTITY-00002');
    expect(prisma.entityRegistryCounter.upsert).toHaveBeenCalledTimes(2);
  });
});

describe('EntityRegistryService security (userId always from session)', () => {
  let service: EntityRegistryService;

  beforeEach(() => {
    service = new EntityRegistryService();
    vi.clearAllMocks();
  });

  it('syncSupplier rejects bridging another user\'s supplier profile', async () => {
    (prisma.supplierProfile.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sp1',
      userId: 'user-owner',
    });
    (prisma.entityRegistryCounter.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ value: 1 });

    await expect(
      service.syncSupplier({
        entity: { entityType: 'SUPP', entitySubtype: 'SUPPLIER', companyName: 'X', source: 'EMAIL', languagePreference: 'ARABIC', relationshipStatus: 'NEW', crmClassification: 'SUPPLIER' },
        supplierProfileId: 'sp1',
        profile: { userId: 'attacker-user' },
      }),
    ).rejects.toThrow('PROFILE_FORBIDDEN');
  });

  it('syncSupplier allows bridging when the caller owns the supplier profile', async () => {
    (prisma.supplierProfile.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sp1',
      userId: 'user-owner',
    });
    (prisma.entityRegistryCounter.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ value: 1 });
    (prisma.entity.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'e1', entityId: 'ENTITY-00001' });
    (prisma.profile.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'p1', profileId: 'PROF-00001' });
    // $transaction executes the callback directly
    vi.spyOn(prisma, '$transaction').mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) =>
      fn(prisma),
    );

    const result = await service.syncSupplier({
      entity: { entityType: 'SUPP', entitySubtype: 'SUPPLIER', companyName: 'X', source: 'EMAIL', languagePreference: 'ARABIC', relationshipStatus: 'NEW', crmClassification: 'SUPPLIER' },
      supplierProfileId: 'sp1',
      profile: { userId: 'user-owner' },
    });

    expect(result.entity.entityId).toBe('ENTITY-00001');
    expect(prisma.supplierProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'sp1' }, data: { entityId: 'ENTITY-00001' } }),
    );
  });
});

describe('EntityRegistryService onboarding question bank (isolated)', () => {
  let service: EntityRegistryService;

  beforeEach(() => {
    service = new EntityRegistryService();
    vi.clearAllMocks();
  });

  it('creates an onboarding question with options serialized to Json', async () => {
    (prisma.onboardingQuestion.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'q1',
      category: 'business',
      questionText: 'What is your company size?',
      answerType: 'SINGLE_CHOICE',
      options: [{ label: '1-10', value: '1-10' }],
      order: 0,
      isActive: true,
    });

    const result = await service.createOnboardingQuestion({
      category: 'business',
      questionText: 'What is your company size?',
      answerType: 'SINGLE_CHOICE',
      options: [{ label: '1-10', value: '1-10' }],
    });

    expect(result.id).toBe('q1');
    expect(prisma.onboardingQuestion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          category: 'business',
          answerType: 'SINGLE_CHOICE',
          options: [{ label: '1-10', value: '1-10' }],
        }),
      }),
    );
  });

  it('throws ONBOARDING_QUESTION_NOT_FOUND for missing question on update', async () => {
    (prisma.onboardingQuestion.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await expect(
      service.updateOnboardingQuestion('missing', { questionText: 'X' }),
    ).rejects.toThrow('ONBOARDING_QUESTION_NOT_FOUND');
  });

  it('lists onboarding questions with category filter', async () => {
    (prisma.onboardingQuestion.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'q1', category: 'business' },
    ]);
    (prisma.onboardingQuestion.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const result = await service.listOnboardingQuestions({ page: 1, limit: 20, category: 'business' });

    expect(result.total).toBe(1);
    expect(prisma.onboardingQuestion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { category: 'business' },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
    );
  });

  it('deletes an existing onboarding question', async () => {
    (prisma.onboardingQuestion.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'q1' });
    (prisma.onboardingQuestion.delete as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'q1' });

    const result = await service.deleteOnboardingQuestion('q1');
    expect(result).toEqual({ id: 'q1' });
    expect(prisma.onboardingQuestion.delete).toHaveBeenCalledWith({ where: { id: 'q1' } });
  });

  it('saveSurveyData throws PROFILE_NOT_FOUND when user has no profile', async () => {
    (prisma.profile.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    await expect(service.saveSurveyData('user-1', { companySize: '1-10' })).rejects.toThrow('PROFILE_NOT_FOUND');
  });

  it('saveSurveyData persists survey answers on the resolved profile', async () => {
    (prisma.profile.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'p1', profileId: 'PROF-00001' });
    (prisma.profile.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'p1',
      profileId: 'PROF-00001',
      surveyData: { companySize: '1-10' },
    });

    const result = await service.saveSurveyData('user-1', { companySize: '1-10' });

    expect(result.surveyData).toEqual({ companySize: '1-10' });
    expect(prisma.profile.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { surveyData: { companySize: '1-10' } },
    });
  });
});
