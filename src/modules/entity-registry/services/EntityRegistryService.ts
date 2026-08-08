import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import { ConsentStatus, Prisma } from '@/generated/prisma/client';
import { EntityRegistryErrors } from '@/modules/shared/errors/entity-registry.errors';
import type {
  CreateEntityInput,
  UpdateEntityInput,
  EntityListQuery,
  UpsertProfileInput,
  CreateInteractionInput,
  UpsertValidationInput,
  CalculateLeadScoreInput,
  UpsertConsentInput,
  CreateRelationshipInput,
  SyncEntityProfileInput,
  SyncSupplierInput,
} from '@/modules/entity-registry/validators/entity-registry-schemas';
import type {
  CreateOnboardingQuestionInput,
  UpdateOnboardingQuestionInput,
  OnboardingQuestionListQuery,
} from '@/modules/entity-registry/validators/onboarding-question-schemas';

/**
 * Entity Registry Service
 *
 * ARCHITECTURE ISOLATION (Bridge Pattern):
 * - `Entity` + `Profile` are the ONLY tables exposed to Data (Programmer 2) and AI (Programmer 4).
 * - These tables have NO relation to `User`/`UserOrganization`.
 * - The only bridge to the auth layer is `Profile.userId` (plain string, no FK).
 * - This keeps the Security/Permissions layer (Programmer 5) fully intact.
 */

export interface LeadScoreResult {
  totalLeadScore: number;
  tier: string;
}

export function calculateLeadScore(scores: {
  strategicScore: number;
  engagementScore: number;
  commercialScore: number;
  conversionScore: number;
}): LeadScoreResult {
  const totalLeadScore = Math.round(
    0.3 * scores.strategicScore +
      0.2 * scores.engagementScore +
      0.35 * scores.commercialScore +
      0.15 * scores.conversionScore,
  );
  const tier = totalLeadScore >= 75 ? 'A' : totalLeadScore >= 50 ? 'B' : totalLeadScore >= 25 ? 'C' : 'Cold';
  return { totalLeadScore, tier };
}

export class EntityRegistryService {
  private pad(n: number): string {
    return String(n).padStart(5, '0');
  }

  /**
   * Atomically increments a per-prefix DB counter (EntityRegistryCounter) and
   * returns the sequential human-friendly id (ENTITY-00001, ...). Safe under
   * concurrency and multiple instances — no in-memory state.
   */
  private async nextSequence(prefix: string): Promise<number> {
    const counter = await prisma.entityRegistryCounter.upsert({
      where: { prefix },
      create: { id: `${prefix}_counter`, prefix, value: 1 },
      update: { value: { increment: 1 } },
    });
    return counter.value;
  }

  async generateEntityId(): Promise<string> {
    return `ENTITY-${this.pad(await this.nextSequence('ENTITY'))}`;
  }

  async generateProfileId(): Promise<string> {
    return `PROF-${this.pad(await this.nextSequence('PROF'))}`;
  }

  async generateInteractionId(): Promise<string> {
    return `INT-${this.pad(await this.nextSequence('INT'))}`;
  }

  async generateValidationId(): Promise<string> {
    return `VAL-${this.pad(await this.nextSequence('VAL'))}`;
  }

  async generateScoreId(): Promise<string> {
    return `SCORE-${this.pad(await this.nextSequence('SCORE'))}`;
  }

  async generateConsentId(): Promise<string> {
    return `CONSENT-${this.pad(await this.nextSequence('CONSENT'))}`;
  }

  async generateRelationshipId(): Promise<string> {
    return `REL-${this.pad(await this.nextSequence('REL'))}`;
  }

  // ---------- Entities ----------

  async listEntities(query: EntityListQuery) {
    const { page, limit, entityType, entitySubtype, crmClassification, relationshipStatus, source, search } = query;
    const where: Record<string, unknown> = {};
    if (entityType) where.entityType = entityType;
    if (entitySubtype) where.entitySubtype = entitySubtype;
    if (crmClassification) where.crmClassification = crmClassification;
    if (relationshipStatus) where.relationshipStatus = relationshipStatus;
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.entity.findMany({
        where,
        include: { profile: { select: { profileId: true, userId: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.entity.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findEntityById(entityId: string) {
    const entity = await prisma.entity.findUnique({
      where: { entityId },
      include: {
        profile: true,
        interactions: { orderBy: { date: 'desc' } },
        validation: true,
        leadScore: true,
        consent: true,
      },
    });
    if (!entity) throw new Error(EntityRegistryErrors.ENTITY_NOT_FOUND);
    return entity;
  }

  async createEntity(input: CreateEntityInput) {
    const entityId = await this.generateEntityId();
    const entity = await prisma.entity.create({
      data: { entityId, ...input },
      include: { profile: true },
    });

    await eventBus.publish({
      name: buildEventName('EntityRegistry', 'Entity', 'Created'),
      version: 1,
      payload: { entityId: entity.entityId, entityType: entity.entityType, companyName: entity.companyName, source: entity.source },
      metadata: { timestamp: new Date(), correlationId: `entity_${entity.id}_${Date.now()}`, source: 'entity-registry' },
    });

    logger.info('Entity created', { entityId: entity.entityId });
    return entity;
  }

  async updateEntity(entityId: string, input: UpdateEntityInput) {
    const existing = await prisma.entity.findUnique({ where: { entityId } });
    if (!existing) throw new Error(EntityRegistryErrors.ENTITY_NOT_FOUND);

    const updated = await prisma.entity.update({ where: { entityId }, data: input });
    await eventBus.publish({
      name: buildEventName('EntityRegistry', 'Entity', 'Updated'),
      version: 1,
      payload: { entityId, changes: Object.keys(input) },
      metadata: { timestamp: new Date(), correlationId: `entity_${existing.id}_${Date.now()}`, source: 'entity-registry' },
    });
    logger.info('Entity updated', { entityId });
    return updated;
  }

  // ---------- Profiles (the bridge) ----------

  /**
   * Upsert a Profile for an entity.
   * BRIDGE: `userId` is a plain string (no FK) that links this market-data profile
   * to the auth-layer User id, preserving Architecture Isolation.
   */
  async upsertProfile(input: UpsertProfileInput) {
    const entity = await prisma.entity.findUnique({ where: { entityId: input.entityId } });
    if (!entity) throw new Error(EntityRegistryErrors.ENTITY_NOT_FOUND);

    const existing = await prisma.profile.findUnique({ where: { entityId: input.entityId } });
    const profileId = existing?.profileId ?? (await this.generateProfileId());

    const { surveyData, ...rest } = input;
    const data = {
      ...rest,
      surveyData: (surveyData as Prisma.JsonValue | undefined) ?? Prisma.JsonNull,
    };

    const profile = await prisma.profile.upsert({
      where: { entityId: input.entityId },
      create: { profileId, ...data },
      update: data,
    });

    await eventBus.publish({
      name: buildEventName('EntityRegistry', 'Profile', 'Upserted'),
      version: 1,
      payload: { entityId: input.entityId, userId: input.userId ?? null },
      metadata: { timestamp: new Date(), correlationId: `profile_${entity.id}_${Date.now()}`, source: 'entity-registry' },
    });
    logger.info('Profile upserted', { entityId: input.entityId, userId: input.userId });
    return profile;
  }

  /**
   * Find the profile linked to an authenticated user.
   * Used by the Smart Navigation Router to decide onboarding redirect.
   */
  async findProfileByUserId(userId: string) {
    return prisma.profile.findFirst({
      where: { userId },
      include: { entity: true },
    });
  }

  // ---------- Interactions ----------

  async createInteraction(input: CreateInteractionInput) {
    const entity = await prisma.entity.findUnique({ where: { entityId: input.entityId } });
    if (!entity) throw new Error(EntityRegistryErrors.ENTITY_NOT_FOUND);

    const interaction = await prisma.interaction.create({
      data: {
        interactionId: await this.generateInteractionId(),
        ...input,
        date: input.date ? new Date(input.date) : new Date(),
      },
    });
    logger.info('Interaction created', { interactionId: interaction.interactionId, entityId: input.entityId });
    return interaction;
  }

  // ---------- Validation ----------

  async upsertValidation(input: UpsertValidationInput) {
    const entity = await prisma.entity.findUnique({ where: { entityId: input.entityId } });
    if (!entity) throw new Error(EntityRegistryErrors.ENTITY_NOT_FOUND);

    const existing = await prisma.validation.findUnique({ where: { entityId: input.entityId } });
    const validationId = existing?.validationId ?? (await this.generateValidationId());

    const validation = await prisma.validation.upsert({
      where: { entityId: input.entityId },
      create: {
        validationId,
        entityId: input.entityId,
        painPoints: input.painPoints ?? [],
        needs: input.needs ?? [],
        feedback: input.feedback,
        feedbackLanguage: input.feedbackLanguage,
        willingnessToPay: input.willingnessToPay,
        commissionAcceptance: input.commissionAcceptance,
        adoptionInterest: input.adoptionInterest,
        firstTransactionReady: input.firstTransactionReady,
        ftOrderValue: input.ftOrderValue,
        assumptionResults: (input.assumptionResults as Prisma.JsonValue | undefined) ?? Prisma.JsonNull,
        validatedDate: input.validatedDate ? new Date(input.validatedDate) : null,
      },
      update: {
        painPoints: input.painPoints ?? [],
        needs: input.needs ?? [],
        feedback: input.feedback,
        feedbackLanguage: input.feedbackLanguage,
        willingnessToPay: input.willingnessToPay,
        commissionAcceptance: input.commissionAcceptance,
        adoptionInterest: input.adoptionInterest,
        firstTransactionReady: input.firstTransactionReady,
        ftOrderValue: input.ftOrderValue,
        assumptionResults: (input.assumptionResults as Prisma.JsonValue | undefined) ?? Prisma.JsonNull,
        validatedDate: input.validatedDate ? new Date(input.validatedDate) : null,
      },
    });
    logger.info('Validation upserted', { validationId: validation.validationId, entityId: input.entityId });
    return validation;
  }

  // ---------- Lead Scoring ----------

  async calculateLeadScore(input: CalculateLeadScoreInput) {
    const entity = await prisma.entity.findUnique({ where: { entityId: input.entityId } });
    if (!entity) throw new Error(EntityRegistryErrors.ENTITY_NOT_FOUND);

    const { totalLeadScore, tier } = calculateLeadScore(input);
    const existing = await prisma.leadScoring.findUnique({ where: { entityId: input.entityId } });
    const scoreId = existing?.scoreId ?? (await this.generateScoreId());

    const score = await prisma.leadScoring.upsert({
      where: { entityId: input.entityId },
      create: { scoreId, ...input, totalLeadScore, tier },
      update: { ...input, totalLeadScore, tier, scoredDate: new Date() },
    });
    logger.info('Lead score calculated', { entityId: input.entityId, totalLeadScore, tier });
    return score;
  }

  // ---------- Consent ----------

  async upsertConsent(input: UpsertConsentInput) {
    const entity = await prisma.entity.findUnique({ where: { entityId: input.entityId } });
    if (!entity) throw new Error(EntityRegistryErrors.ENTITY_NOT_FOUND);

    const existing = await prisma.consent.findUnique({ where: { entityId: input.entityId } });
    const consentId = existing?.consentId ?? (await this.generateConsentId());

    const data = {
      ...input,
      consentDate: input.consentDate ? new Date(input.consentDate) : new Date(),
      dataRetentionExpiry: input.consentStatus === ConsentStatus.GRANTED ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
    };

    const consent = await prisma.consent.upsert({
      where: { entityId: input.entityId },
      create: { consentId, ...data },
      update: data,
    });
    logger.info('Consent upserted', { consentId: consent.consentId, entityId: input.entityId, status: consent.consentStatus });
    return consent;
  }

  // ---------- Relationships ----------

  async createRelationship(input: CreateRelationshipInput) {
    if (input.fromEntityId === input.toEntityId) {
      throw new Error(EntityRegistryErrors.RELATIONSHIP_SELF_REFERENCE);
    }
    const [from, to] = await Promise.all([
      prisma.entity.findUnique({ where: { entityId: input.fromEntityId } }),
      prisma.entity.findUnique({ where: { entityId: input.toEntityId } }),
    ]);
    if (!from || !to) throw new Error(EntityRegistryErrors.ENTITY_NOT_FOUND);

    const relationship = await prisma.relationship.create({
      data: {
        relationshipId: await this.generateRelationshipId(),
        ...input,
        sinceDate: input.sinceDate ? new Date(input.sinceDate) : new Date(),
      },
    });
    logger.info('Relationship created', { relationshipId: relationship.relationshipId, fromEntityId: input.fromEntityId, toEntityId: input.toEntityId });
    return relationship;
  }

  // ---------- Sync Bridge (entity_id ↔ user_id) ----------

  /**
   * sync-entity-profile
   * Creates an Entity + Profile atomically and links the Profile to an existing
   * auth User via Profile.userId (plain string). Used by the registration frontend.
   */
  async syncEntityProfile(input: SyncEntityProfileInput) {
    const entityId = await this.generateEntityId();

    return prisma.$transaction(async (tx) => {
      const entity = await tx.entity.create({
        data: { entityId, ...input.entity },
      });

      const profileData = {
        userId: input.profile?.userId ?? null,
        companySize: input.profile?.companySize ?? null,
        annualVolume: input.profile?.annualVolume ?? null,
        businessActivity: input.profile?.businessActivity ?? null,
        relevantCategories: input.profile?.relevantCategories ?? [],
        subcategories: input.profile?.subcategories ?? [],
        hasCatalog: input.profile?.hasCatalog ?? false,
        digitalMaturity: input.profile?.digitalMaturity ?? null,
        apiReadiness: input.profile?.apiReadiness ?? null,
        capabilities: input.profile?.capabilities ?? [],
        surveyData: (input.profile?.surveyData as Prisma.JsonValue | undefined) ?? Prisma.JsonNull,
      };

      const profile = await tx.profile.create({
        data: { profileId: await this.generateProfileId(), entityId: entity.id, ...profileData },
      });

      await eventBus.publish({
        name: buildEventName('EntityRegistry', 'Entity', 'Synced'),
        version: 1,
        payload: { entityId, userId: profileData.userId, entityType: entity.entityType },
        metadata: { timestamp: new Date(), correlationId: `sync_${entity.id}_${Date.now()}`, source: 'entity-registry' },
      });

      logger.info('Entity+Profile synced', { entityId, userId: profileData.userId });
      return { entity, profile };
    });
  }

  // ---------- Sync Supplier Bridge (entity_id ↔ supplierProfile) ----------

  /**
   * sync-supplier
   * Creates an Entity + Profile atomically and bridges it to an existing
   * SupplierProfile via SupplierProfile.entityId (plain string — no FK).
   * This connects the Marketplace (SupplierProfile/Offering) to the isolated
   * Entity Registry, enabling Data (P2) and AI (P4) to analyze suppliers
   * through Entity/Profile only, without touching the security layer.
   */
  async syncSupplier(input: SyncSupplierInput) {
    const supplierProfile = await prisma.supplierProfile.findUnique({
      where: { id: input.supplierProfileId },
      select: { id: true, userId: true },
    });
    if (!supplierProfile) throw new Error(EntityRegistryErrors.ENTITY_NOT_FOUND);

    // SECURITY: the caller must own the supplier profile they are bridging.
    const ownerUserId = input.profile?.userId;
    if (ownerUserId && supplierProfile.userId !== ownerUserId) {
      throw new Error(EntityRegistryErrors.PROFILE_FORBIDDEN);
    }

    const entityId = await this.generateEntityId();

    return prisma.$transaction(async (tx) => {
      const entity = await tx.entity.create({
        data: { entityId, ...input.entity },
      });

      const profileData = {
        userId: input.profile?.userId ?? supplierProfile.userId ?? null,
        companySize: input.profile?.companySize ?? null,
        annualVolume: input.profile?.annualVolume ?? null,
        businessActivity: input.profile?.businessActivity ?? null,
        relevantCategories: input.profile?.relevantCategories ?? [],
        subcategories: input.profile?.subcategories ?? [],
        hasCatalog: input.profile?.hasCatalog ?? false,
        digitalMaturity: input.profile?.digitalMaturity ?? null,
        apiReadiness: input.profile?.apiReadiness ?? null,
        capabilities: input.profile?.capabilities ?? [],
        surveyData: (input.profile?.surveyData as Prisma.JsonValue | undefined) ?? Prisma.JsonNull,
      };

      const profile = await tx.profile.create({
        data: { profileId: await this.generateProfileId(), entityId: entity.id, ...profileData },
      });

      // Bridge: link the SupplierProfile to the new Entity (no FK — isolation preserved)
      await tx.supplierProfile.update({
        where: { id: input.supplierProfileId },
        data: { entityId } as Parameters<typeof tx.supplierProfile.update>[0]["data"],
      });

      await eventBus.publish({
        name: buildEventName('EntityRegistry', 'Supplier', 'Synced'),
        version: 1,
        payload: { entityId, supplierProfileId: input.supplierProfileId, userId: profileData.userId },
        metadata: { timestamp: new Date(), correlationId: `sync_supplier_${entity.id}_${Date.now()}`, source: 'entity-registry' },
      });

      logger.info('Entity+Profile synced to SupplierProfile', { entityId, supplierProfileId: input.supplierProfileId });
      return { entity, profile, supplierProfileId: input.supplierProfileId };
    });
  }

  // ---------- Onboarding Survey Question Bank (Isolated) ----------

  /**
   * Lists onboarding survey questions with optional category/answerType/isActive filters.
   * ISOLATED: this is the onboarding question bank, separate from the Research Survey engine.
   */
  async listOnboardingQuestions(query: OnboardingQuestionListQuery) {
    const { page, limit, category, answerType, isActive } = query;
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (answerType) where.answerType = answerType;
    if (isActive !== undefined) where.isActive = isActive;

    const [items, total] = await Promise.all([
      prisma.onboardingQuestion.findMany({
        where,
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.onboardingQuestion.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getOnboardingQuestion(id: string) {
    const question = await prisma.onboardingQuestion.findUnique({ where: { id } });
    if (!question) throw new Error(EntityRegistryErrors.ONBOARDING_QUESTION_NOT_FOUND);
    return question;
  }

  async createOnboardingQuestion(input: CreateOnboardingQuestionInput) {
    const question = await prisma.onboardingQuestion.create({
      data: {
        category: input.category,
        questionText: input.questionText,
        answerType: input.answerType,
        options: (input.options as Prisma.JsonValue | undefined) ?? Prisma.JsonNull,
        order: input.order ?? 0,
        isActive: input.isActive ?? true,
      },
    });
    logger.info('Onboarding question created', { id: question.id, category: question.category });
    return question;
  }

  async updateOnboardingQuestion(id: string, input: UpdateOnboardingQuestionInput) {
    const existing = await prisma.onboardingQuestion.findUnique({ where: { id } });
    if (!existing) throw new Error(EntityRegistryErrors.ONBOARDING_QUESTION_NOT_FOUND);

    const question = await prisma.onboardingQuestion.update({
      where: { id },
      data: {
        category: input.category,
        questionText: input.questionText,
        answerType: input.answerType,
        options: input.options !== undefined ? ((input.options as Prisma.JsonValue) ?? Prisma.JsonNull) : undefined,
        order: input.order,
        isActive: input.isActive,
      },
    });
    logger.info('Onboarding question updated', { id });
    return question;
  }

  async deleteOnboardingQuestion(id: string) {
    const existing = await prisma.onboardingQuestion.findUnique({ where: { id } });
    if (!existing) throw new Error(EntityRegistryErrors.ONBOARDING_QUESTION_NOT_FOUND);

    await prisma.onboardingQuestion.delete({ where: { id } });
    logger.info('Onboarding question deleted', { id });
    return { id };
  }

  // ---------- Profile surveyData (bridge) ----------

  /**
   * Persists the full onboarding/market-survey answers on the user's Profile.
   * BRIDGE: resolves the entity via Profile.userId (plain string, no FK).
   */
  async saveSurveyData(userId: string, surveyData: Record<string, unknown>) {
    const profile = await prisma.profile.findFirst({ where: { userId } });
    if (!profile) throw new Error(EntityRegistryErrors.PROFILE_NOT_FOUND);

    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: { surveyData: (surveyData as Prisma.JsonValue) ?? Prisma.JsonNull },
    });
    logger.info('Profile surveyData saved', { profileId: profile.profileId, userId });
    return updated;
  }
}

export const entityRegistryService = new EntityRegistryService();
