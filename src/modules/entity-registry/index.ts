export { EntityRegistryService, entityRegistryService, calculateLeadScore } from '@/modules/entity-registry/services/EntityRegistryService';
export type { LeadScoreResult } from '@/modules/entity-registry/services/EntityRegistryService';

export {
  createEntitySchema,
  updateEntitySchema,
  entityListQuerySchema,
  upsertProfileSchema,
  createInteractionSchema,
  upsertValidationSchema,
  calculateLeadScoreSchema,
  upsertConsentSchema,
  createRelationshipSchema,
  syncEntityProfileSchema,
  syncSupplierSchema,
} from '@/modules/entity-registry/validators/entity-registry-schemas';

export type {
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

export {
  onboardingAnswerTypeSchema,
  onboardingOptionSchema,
  createOnboardingQuestionSchema,
  updateOnboardingQuestionSchema,
  onboardingQuestionListQuerySchema,
  saveSurveyDataSchema,
} from '@/modules/entity-registry/validators/onboarding-question-schemas';

export type {
  CreateOnboardingQuestionInput,
  UpdateOnboardingQuestionInput,
  OnboardingQuestionListQuery,
  SaveSurveyDataInput,
} from '@/modules/entity-registry/validators/onboarding-question-schemas';
