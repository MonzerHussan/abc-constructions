export { PurchaseRequestService } from '@/modules/procurement/services/PurchaseRequestService';
export { RFQService } from '@/modules/procurement/services/RFQService';
export { QuotationService } from '@/modules/procurement/services/QuotationService';
export { EvaluationService } from '@/modules/procurement/services/EvaluationService';
export { PurchaseOrderService } from '@/modules/procurement/services/PurchaseOrderService';
export { DeliveryService } from '@/modules/procurement/services/DeliveryService';
export { WorkflowHistoryService } from '@/modules/procurement/services/WorkflowHistoryService';
export { PrismaWorkflowHistoryRecorder } from '@/modules/procurement/services/PrismaWorkflowHistoryRecorder';
export { ProcurementWorkflowOrchestrator, procurementWorkflowOrchestrator } from '@/modules/procurement/services/ProcurementWorkflowOrchestrator';
export type { EntityStatusPort, OrchestratorContext, OrchestrationResult } from '@/modules/procurement/services/ProcurementWorkflowOrchestrator';

export {
  createPRSchema,
  updatePRSchema,
  approvePRSchema,
  prListQuerySchema,
} from '@/modules/procurement/validators/purchase-request-schemas';

export {
  createRFQSchema,
  updateRFQSchema,
  inviteSupplierSchema,
  rfqListQuerySchema,
} from '@/modules/procurement/validators/rfq-schemas';

export {
  createQuotationSchema,
  updateQuotationSchema,
  quotationListQuerySchema,
  acceptQuotationSchema,
  rejectQuotationSchema,
} from '@/modules/procurement/validators/quotation-schemas';

export {
  createCriteriaSchema,
  updateCriterionSchema,
  startEvaluationSchema,
  submitScoresSchema,
  completeEvaluationSchema,
  evaluationListQuerySchema,
  createApprovalSchema,
  approveDecisionSchema,
} from '@/modules/procurement/validators/evaluation-schemas';

export {
  createPOSchema,
  updatePOSchema,
  poListQuerySchema,
} from '@/modules/procurement/validators/po-schemas';

export {
  createDeliverySchema,
  updateDeliverySchema,
  deliveryListQuerySchema,
} from '@/modules/procurement/validators/delivery-schemas';

export {
  workflowTransitionSchema,
  workflowHistoryQuerySchema,
} from '@/modules/procurement/validators/workflow-schemas';
export type {
  WorkflowTransitionInput,
  WorkflowHistoryQuery,
} from '@/modules/procurement/validators/workflow-schemas';

export type {
  CreatePRInput,
  UpdatePRInput,
  ApprovePRInput,
  PRListQuery,
} from '@/modules/procurement/validators/purchase-request-schemas';

export type {
  CreateRFQInput,
  UpdateRFQInput,
  InviteSupplierInput,
  RFQListQuery,
} from '@/modules/procurement/validators/rfq-schemas';

export type {
  CreateQuotationInput,
  UpdateQuotationInput,
  QuotationListQuery,
  AcceptQuotationInput,
  RejectQuotationInput,
} from '@/modules/procurement/validators/quotation-schemas';

export type {
  CreateCriteriaInput,
  UpdateCriterionInput,
  ScoreInput,
  StartEvaluationInput,
  SubmitScoresInput,
  CompleteEvaluationInput,
  EvaluationListQuery,
  CreateApprovalInput,
  ApproveDecisionInput,
} from '@/modules/procurement/validators/evaluation-schemas';

export type {
  CreatePOInput,
  UpdatePOInput,
  POListQuery,
} from '@/modules/procurement/validators/po-schemas';

export type {
  CreateDeliveryInput,
  UpdateDeliveryInput,
  CreateDeliveryItemInput,
  DeliveryListQuery,
} from '@/modules/procurement/validators/delivery-schemas';

export type {
  PRItemDTO,
  PRSummaryDTO,
  PRDetailDTO,
} from '@/modules/procurement/dto/purchase-request-dto';

export type {
  CreateRFQDTO,
  UpdateRFQDTO,
  InviteSupplierDTO,
  RFQSummaryDTO,
  RFQDetailDTO,
  RFQItemDTO,
  RFQSupplierDTO,
} from '@/modules/procurement/dto/rfq-dto';

export type {
  QuotationItemDTO,
  QuotationSummaryDTO,
  QuotationDetailDTO,
  CreateQuotationDTO,
  UpdateQuotationDTO,
} from '@/modules/procurement/dto/quotation-dto';

export type {
  CriterionDTO,
  ScoreDTO,
  QuotationEvaluationDTO,
  EvaluationSummaryDTO,
  ApprovalRequestDTO,
  ApprovalHistoryDTO,
  StartEvaluationDTO,
  CompleteEvaluationDTO,
} from '@/modules/procurement/dto/evaluation-dto';

export type {
  POItemDTO,
  POSummaryDTO,
  PODetailDTO,
  CreatePODTO,
} from '@/modules/procurement/dto/po-dto';

export type {
  DeliveryItemDTO,
  DeliverySummaryDTO,
  DeliveryDetailDTO,
  CreateDeliveryDTO,
} from '@/modules/procurement/dto/delivery-dto';

export { RFQStateMachine, getAllowedRFQTransitions, canTransitionRFQ } from '@/modules/procurement/workflow/state-machines/RFQStateMachine';
export type { RFQStatus, RFQTransition } from '@/modules/procurement/workflow/state-machines/RFQStateMachine';
export { QuotationStateMachine, getAllowedQuotationTransitions, canTransitionQuotation } from '@/modules/procurement/workflow/state-machines/QuotationStateMachine';
export type { QuotationStatus, QuotationTransition } from '@/modules/procurement/workflow/state-machines/QuotationStateMachine';
export { POStateMachine, getAllowedPOTransitions, canTransitionPO } from '@/modules/procurement/workflow/state-machines/POStateMachine';
export type { POStatus, POTransition } from '@/modules/procurement/workflow/state-machines/POStateMachine';
export { DeliveryStateMachine, getAllowedDeliveryTransitions, canTransitionDelivery } from '@/modules/procurement/workflow/state-machines/DeliveryStateMachine';
export type { DeliveryStatus, DeliveryTransition } from '@/modules/procurement/workflow/state-machines/DeliveryStateMachine';
export { PurchaseRequestStateMachine, getAllowedPRTransitions, canTransitionPR } from '@/modules/procurement/workflow/state-machines/PurchaseRequestStateMachine';
export type { PRStatus, PRTransition } from '@/modules/procurement/workflow/state-machines/PurchaseRequestStateMachine';
export { EvaluationStateMachine, getAllowedEvaluationTransitions, canTransitionEvaluation } from '@/modules/procurement/workflow/state-machines/EvaluationStateMachine';
export type { EvalStatus, EvalTransition } from '@/modules/procurement/workflow/state-machines/EvaluationStateMachine';
export { AwardStateMachine, getAllowedAwardTransitions, canTransitionAward } from '@/modules/procurement/workflow/state-machines/AwardStateMachine';
export type { AwardStatus, AwardTransition } from '@/modules/procurement/workflow/state-machines/AwardStateMachine';
export { BaseStateMachine, workflowEngine } from '@/modules/procurement/workflow';
export type { WorkflowContext } from '@/modules/procurement/workflow';

import { PurchaseRequestService } from '@/modules/procurement/services/PurchaseRequestService';
import { RFQService } from '@/modules/procurement/services/RFQService';
import { QuotationService } from '@/modules/procurement/services/QuotationService';
import { EvaluationService } from '@/modules/procurement/services/EvaluationService';
import { PurchaseOrderService } from '@/modules/procurement/services/PurchaseOrderService';
import { DeliveryService } from '@/modules/procurement/services/DeliveryService';

export const purchaseRequestService = new PurchaseRequestService();
export const rfqService = new RFQService();
export const quotationService = new QuotationService();
export const evaluationService = new EvaluationService();
export const purchaseOrderService = new PurchaseOrderService();
export const deliveryService = new DeliveryService();
