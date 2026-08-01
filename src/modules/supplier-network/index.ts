export { SupplierNetworkService } from '@/modules/supplier-network/services/SupplierNetworkService';

export {
  createProfileSchema, updateProfileSchema, profileListQuerySchema,
  uploadDocumentSchema, verifyDocumentSchema,
  addCertificationSchema, upsertBankingSchema,
  addCapabilitySchema, updateCapabilitySchema,
  createRelationshipSchema, updateRelationshipSchema, relationshipListQuerySchema,
  createRatingSchema,
} from '@/modules/supplier-network/validators/supplier-network-schemas';
export type {
  CreateProfileInput, UpdateProfileInput, ProfileListQuery,
  UploadDocumentInput, VerifyDocumentInput,
  AddCertificationInput, UpsertBankingInput,
  AddCapabilityInput, UpdateCapabilityInput,
  CreateRelationshipInput, UpdateRelationshipInput, RelationshipListQuery,
  CreateRatingInput,
} from '@/modules/supplier-network/validators/supplier-network-schemas';

export { SupplierNetworkEvents } from '@/modules/supplier-network/events';

export {
  SupplierVerificationStateMachine,
  getAllowedVerificationTransitions,
  canTransitionVerification,
} from '@/modules/supplier-network/workflow/state-machines/SupplierVerificationStateMachine';
export type { VerificationStatus, VerificationTransition } from '@/modules/supplier-network/workflow/state-machines/SupplierVerificationStateMachine';

import { SupplierNetworkService } from '@/modules/supplier-network/services/SupplierNetworkService';
export const supplierNetworkService = new SupplierNetworkService();
