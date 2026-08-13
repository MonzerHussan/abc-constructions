import { z } from 'zod';
import {
  EntityType,
  EntitySubtype,
  LanguagePreference,
  EntityRelationshipStatus,
  EntitySource,
  PilotStatus,
  CrmClassification,
  InteractionType,
  InteractionChannel,
  WtpRange,
  CommissionAcceptance,
  AdoptionInterest,
  ConsentStatus,
  AllowedUsage,
  RelationshipType,
  EntityLinkStatus,
} from '@/generated/prisma/client';

export const createEntitySchema = z.object({
  entityType: z.nativeEnum(EntityType),
  entitySubtype: z.nativeEnum(EntitySubtype),
  companyName: z.string().min(1, 'companyName is required').max(300),
  contactPerson: z.string().optional(),
  contactRole: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  languagePreference: z.nativeEnum(LanguagePreference).default(LanguagePreference.ARABIC),
  location: z.string().optional(),
  industrySegment: z.string().optional(),
  relationshipStatus: z.nativeEnum(EntityRelationshipStatus).default(EntityRelationshipStatus.NEW),
  source: z.nativeEnum(EntitySource),
  sourceDetail: z.string().optional(),
  pilotStatus: z.nativeEnum(PilotStatus).optional(),
  crmClassification: z.nativeEnum(CrmClassification).default(CrmClassification.LEAD),
});

export const updateEntitySchema = createEntitySchema.partial();

export const entityListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  entityType: z.nativeEnum(EntityType).optional(),
  entitySubtype: z.nativeEnum(EntitySubtype).optional(),
  crmClassification: z.nativeEnum(CrmClassification).optional(),
  relationshipStatus: z.nativeEnum(EntityRelationshipStatus).optional(),
  source: z.nativeEnum(EntitySource).optional(),
  search: z.string().optional(),
});

export const upsertProfileSchema = z.object({
  entityId: z.string().min(1, 'entityId is required'),
  userId: z.string().optional().nullable(),
  companySize: z.string().optional().nullable(),
  annualVolume: z.string().optional().nullable(),
  businessActivity: z.string().optional().nullable(),
  relevantCategories: z.array(z.string()).optional(),
  subcategories: z.array(z.string()).optional(),
  hasCatalog: z.boolean().optional(),
  digitalMaturity: z.string().optional().nullable(),
  apiReadiness: z.string().optional().nullable(),
  capabilities: z.array(z.string()).optional(),
  surveyData: z.record(z.string(), z.unknown()).optional(),
});

export const createInteractionSchema = z.object({
  entityId: z.string().min(1, 'entityId is required'),
  type: z.nativeEnum(InteractionType),
  date: z.string().datetime().optional(),
  channel: z.nativeEnum(InteractionChannel),
  owner: z.string().min(1, 'owner is required'),
  outcome: z.string().optional(),
  nextAction: z.string().optional(),
  relatedEntityId: z.string().optional(),
});

export const upsertValidationSchema = z.object({
  entityId: z.string().min(1, 'entityId is required'),
  painPoints: z.array(z.string()).optional(),
  needs: z.array(z.string()).optional(),
  feedback: z.string().optional(),
  feedbackLanguage: z.string().optional(),
  willingnessToPay: z.nativeEnum(WtpRange).optional().nullable(),
  commissionAcceptance: z.nativeEnum(CommissionAcceptance).optional().nullable(),
  adoptionInterest: z.nativeEnum(AdoptionInterest).optional().nullable(),
  firstTransactionReady: z.boolean().optional(),
  ftOrderValue: z.number().optional().nullable(),
  assumptionResults: z.record(z.string(), z.unknown()).optional(),
  validatedDate: z.string().datetime().optional().nullable(),
});

export const calculateLeadScoreSchema = z.object({
  entityId: z.string().min(1, 'entityId is required'),
  strategicScore: z.number().int().min(0).max(100).default(0),
  engagementScore: z.number().int().min(0).max(100).default(0),
  commercialScore: z.number().int().min(0).max(100).default(0),
  conversionScore: z.number().int().min(0).max(100).default(0),
});

export const upsertConsentSchema = z.object({
  entityId: z.string().min(1, 'entityId is required'),
  consentStatus: z.nativeEnum(ConsentStatus).default(ConsentStatus.NOT_REQUESTED),
  consentDate: z.string().datetime().optional().nullable(),
  consentVersion: z.string().optional().nullable(),
  language: z.nativeEnum(LanguagePreference).default(LanguagePreference.ARABIC),
  allowedUsage: z.array(z.nativeEnum(AllowedUsage)).optional(),
  deletionRequested: z.boolean().default(false),
});

export const createRelationshipSchema = z.object({
  fromEntityId: z.string().min(1, 'fromEntityId is required'),
  toEntityId: z.string().min(1, 'toEntityId is required'),
  relationshipType: z.nativeEnum(RelationshipType),
  sinceDate: z.string().datetime().optional().nullable(),
  status: z.nativeEnum(EntityLinkStatus).default(EntityLinkStatus.ACTIVE),
  notes: z.string().optional(),
});

export const syncEntityProfileSchema = z.object({
  entity: createEntitySchema,
  profile: upsertProfileSchema.omit({ entityId: true }).optional(),
});

export const syncSupplierSchema = z.object({
  entity: createEntitySchema,
  profile: upsertProfileSchema.omit({ entityId: true }).optional(),
  supplierProfileId: z.string().min(1, 'supplierProfileId is required'),
});

export type CreateEntityInput = z.infer<typeof createEntitySchema>;
export type UpdateEntityInput = z.infer<typeof updateEntitySchema>;
export type EntityListQuery = z.infer<typeof entityListQuerySchema>;
export type UpsertProfileInput = z.infer<typeof upsertProfileSchema>;
export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;
export type UpsertValidationInput = z.infer<typeof upsertValidationSchema>;
export type CalculateLeadScoreInput = z.infer<typeof calculateLeadScoreSchema>;
export type UpsertConsentInput = z.infer<typeof upsertConsentSchema>;
export type CreateRelationshipInput = z.infer<typeof createRelationshipSchema>;
export type SyncEntityProfileInput = z.infer<typeof syncEntityProfileSchema>;
export type SyncSupplierInput = z.infer<typeof syncSupplierSchema>;
