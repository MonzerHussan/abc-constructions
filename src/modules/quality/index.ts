export { QualityService } from '@/modules/quality/services/QualityService';

export {
  createInspectionSchema,
  updateInspectionSchema,
  inspectionListQuerySchema,
  addInspectionItemSchema,
  updateInspectionItemSchema,
  createNCRSchema,
  createCertificateSchema,
  addAttachmentSchema,
} from '@/modules/quality/validators/inspection-schemas';

export type {
  CreateInspectionInput,
  UpdateInspectionInput,
  InspectionListQuery,
  AddInspectionItemInput,
  UpdateInspectionItemInput,
  CreateNCRInput,
  CreateCertificateInput,
  AddAttachmentInput,
} from '@/modules/quality/validators/inspection-schemas';

export type {
  InspectionItemDTO,
  InspectionAttachmentDTO,
  NCRDTO,
  AcceptanceCertificateDTO,
  InspectionSummaryDTO,
  InspectionDetailDTO,
  CreateInspectionDTO,
} from '@/modules/quality/dto/inspection-dto';

export { QualityStateMachine, getAllowedInspectionTransitions, canTransitionInspection } from '@/modules/quality/workflow/state-machines/QualityStateMachine';
export type { InspectionStatus, InspectionTransition } from '@/modules/quality/workflow/state-machines/QualityStateMachine';

import { QualityService } from '@/modules/quality/services/QualityService';

export const qualityService = new QualityService();
