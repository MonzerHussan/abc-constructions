-- Migration: ai_boq_models
-- Reconstructed from live DB to close git/DB drift (P5 Gatekeeper).
-- Idempotent: uses IF NOT EXISTS for tables and indexes.

CREATE TYPE "AiJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED');
CREATE TYPE "AiJobType" AS ENUM ('EXTRACTION', 'EMBEDDING', 'ANALYSIS', 'MATCHING', 'RECOMMENDATION');
CREATE TYPE "CrmActivityType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK', 'WHATSAPP', 'SMS', 'SOCIAL', 'OTHER');
CREATE TYPE "CrmTaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "CrmTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DEFERRED');
CREATE TYPE "InsightType" AS ENUM ('PAIN_POINT', 'FEATURE_REQUEST', 'SENTIMENT', 'SEGMENT_INSIGHT', 'PRICING_INSIGHT', 'PRIORITY', 'TREND', 'PREDICTION', 'RECOMMENDATION');
CREATE TYPE "InspectionItemResult" AS ENUM ('PASS', 'FAIL', 'N_A');
CREATE TYPE "InspectionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'PARTIAL', 'NCR_CREATED', 'ACCEPTED');
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'COLD_CALL', 'EVENT', 'ADVERTISEMENT', 'PARTNER', 'MARKETPLACE', 'OTHER');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST', 'DISQUALIFIED');
CREATE TYPE "MatchStatus" AS ENUM ('MATCHED', 'MISMATCH', 'PENDING');
CREATE TYPE "NCRSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "NCRStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE "OpportunityStage" AS ENUM ('DISCOVERY', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST', 'ON_HOLD');
CREATE TYPE "PODeliveryStatus" AS ENUM ('SCHEDULED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentReleaseType" AS ENUM ('PARTIAL', 'FULL', 'REFUND');
CREATE TYPE "PaymentReservationStatus" AS ENUM ('RESERVED', 'HELD', 'PARTIALLY_RELEASED', 'RELEASED', 'REFUNDED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS "AiJob" (
  "id" text NOT NULL,
  "orgId" text NOT NULL,
  "type" "AiJobType" NOT NULL,
  "status" "AiJobStatus" NOT NULL DEFAULT 'PENDING'::"AiJobStatus",
  "fileUrl" text,
  "result" jsonb,
  "error" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "AiJob_pkey" ON public."AiJob" USING btree (id);
CREATE INDEX IF NOT EXISTS "AiJob_orgId_idx" ON public."AiJob" USING btree ("orgId");
CREATE INDEX IF NOT EXISTS "AiJob_orgId_status_idx" ON public."AiJob" USING btree ("orgId", status);
CREATE INDEX IF NOT EXISTS "AiJob_type_createdAt_idx" ON public."AiJob" USING btree (type, "createdAt");

CREATE TABLE IF NOT EXISTS "AiUsage" (
  "id" text NOT NULL,
  "orgId" text NOT NULL,
  "jobId" text,
  "tokensUsed" integer NOT NULL DEFAULT 0,
  "cost" double precision NOT NULL DEFAULT 0,
  "model" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "AiUsage_pkey" ON public."AiUsage" USING btree (id);
CREATE INDEX IF NOT EXISTS "AiUsage_orgId_idx" ON public."AiUsage" USING btree ("orgId");
CREATE INDEX IF NOT EXISTS "AiUsage_orgId_createdAt_idx" ON public."AiUsage" USING btree ("orgId", "createdAt");
CREATE INDEX IF NOT EXISTS "AiUsage_jobId_idx" ON public."AiUsage" USING btree ("jobId");
CREATE INDEX IF NOT EXISTS "AiUsage_model_idx" ON public."AiUsage" USING btree (model);

CREATE TABLE IF NOT EXISTS "AiQuota" (
  "id" text NOT NULL,
  "orgId" text NOT NULL,
  "month" text NOT NULL,
  "tokensUsed" integer NOT NULL DEFAULT 0,
  "tokensLimit" integer,
  "jobsUsed" integer NOT NULL DEFAULT 0,
  "jobsLimit" integer
);
CREATE UNIQUE INDEX IF NOT EXISTS "AiQuota_pkey" ON public."AiQuota" USING btree (id);
CREATE INDEX IF NOT EXISTS "AiQuota_orgId_month_idx" ON public."AiQuota" USING btree ("orgId", month);
CREATE UNIQUE INDEX IF NOT EXISTS "AiQuota_orgId_month_key" ON public."AiQuota" USING btree ("orgId", month);

CREATE TABLE IF NOT EXISTS "AiExtractionVersion" (
  "id" text NOT NULL,
  "version" text NOT NULL,
  "modelName" text NOT NULL,
  "schema" jsonb NOT NULL,
  "deployedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "active" boolean NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX IF NOT EXISTS "AiExtractionVersion_pkey" ON public."AiExtractionVersion" USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS "AiExtractionVersion_version_key" ON public."AiExtractionVersion" USING btree (version);

CREATE TABLE IF NOT EXISTS "AiInsight" (
  "id" text NOT NULL,
  "insightType" "InsightType" NOT NULL,
  "title" text NOT NULL,
  "titleEn" text,
  "titleAr" text,
  "titleUr" text,
  "description" text,
  "data" jsonb,
  "confidence" double precision,
  "sourceModel" text,
  "campaignId" text,
  "segmentId" text,
  "isReviewed" boolean NOT NULL DEFAULT false,
  "isActionable" boolean NOT NULL DEFAULT false,
  "priority" integer NOT NULL DEFAULT 0,
  "generatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "AiInsight_pkey" ON public."AiInsight" USING btree (id);
CREATE INDEX IF NOT EXISTS "AiInsight_insightType_idx" ON public."AiInsight" USING btree ("insightType");
CREATE INDEX IF NOT EXISTS "AiInsight_campaignId_idx" ON public."AiInsight" USING btree ("campaignId");
CREATE INDEX IF NOT EXISTS "AiInsight_segmentId_idx" ON public."AiInsight" USING btree ("segmentId");
CREATE INDEX IF NOT EXISTS "AiInsight_generatedAt_idx" ON public."AiInsight" USING btree ("generatedAt");

CREATE TABLE IF NOT EXISTS "Lead" (
  "id" text NOT NULL,
  "organizationId" text NOT NULL,
  "firstName" text NOT NULL,
  "lastName" text NOT NULL,
  "email" text,
  "phone" text,
  "company" text,
  "jobTitle" text,
  "source" "LeadSource" NOT NULL DEFAULT 'OTHER'::"LeadSource",
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW'::"LeadStatus",
  "score" integer NOT NULL DEFAULT 0,
  "tags" text[],
  "notes" text,
  "convertedToContactId" text,
  "assignedToId" text,
  "createdById" text NOT NULL,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Lead_pkey" ON public."Lead" USING btree (id);
CREATE INDEX IF NOT EXISTS "Lead_organizationId_idx" ON public."Lead" USING btree ("organizationId");
CREATE INDEX IF NOT EXISTS "Lead_assignedToId_idx" ON public."Lead" USING btree ("assignedToId");
CREATE INDEX IF NOT EXISTS "Lead_status_idx" ON public."Lead" USING btree (status);
CREATE INDEX IF NOT EXISTS "Lead_email_idx" ON public."Lead" USING btree (email);

CREATE TABLE IF NOT EXISTS "CrmContact" (
  "id" text NOT NULL,
  "organizationId" text NOT NULL,
  "firstName" text NOT NULL,
  "lastName" text NOT NULL,
  "email" text,
  "phone" text,
  "jobTitle" text,
  "company" text,
  "linkedUserId" text,
  "ownerId" text,
  "source" "LeadSource" NOT NULL DEFAULT 'OTHER'::"LeadSource",
  "tags" text[],
  "notes" text,
  "avatar" text,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "CrmContact_pkey" ON public."CrmContact" USING btree (id);
CREATE INDEX IF NOT EXISTS "CrmContact_organizationId_idx" ON public."CrmContact" USING btree ("organizationId");
CREATE INDEX IF NOT EXISTS "CrmContact_ownerId_idx" ON public."CrmContact" USING btree ("ownerId");
CREATE INDEX IF NOT EXISTS "CrmContact_linkedUserId_idx" ON public."CrmContact" USING btree ("linkedUserId");
CREATE INDEX IF NOT EXISTS "CrmContact_email_idx" ON public."CrmContact" USING btree (email);

CREATE TABLE IF NOT EXISTS "Opportunity" (
  "id" text NOT NULL,
  "organizationId" text NOT NULL,
  "name" text NOT NULL,
  "amount" numeric(65,30) NOT NULL DEFAULT 0,
  "currency" text NOT NULL DEFAULT 'SAR'::text,
  "stage" "OpportunityStage" NOT NULL DEFAULT 'DISCOVERY'::"OpportunityStage",
  "probability" integer NOT NULL DEFAULT 0,
  "expectedCloseDate" timestamp(3) without time zone,
  "actualCloseDate" timestamp(3) without time zone,
  "source" "LeadSource" NOT NULL DEFAULT 'OTHER'::"LeadSource",
  "notes" text,
  "tags" text[],
  "leadId" text,
  "contactId" text,
  "companyName" text,
  "ownerId" text,
  "createdById" text NOT NULL,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Opportunity_pkey" ON public."Opportunity" USING btree (id);
CREATE INDEX IF NOT EXISTS "Opportunity_organizationId_idx" ON public."Opportunity" USING btree ("organizationId");
CREATE INDEX IF NOT EXISTS "Opportunity_ownerId_idx" ON public."Opportunity" USING btree ("ownerId");
CREATE INDEX IF NOT EXISTS "Opportunity_stage_idx" ON public."Opportunity" USING btree (stage);
CREATE INDEX IF NOT EXISTS "Opportunity_leadId_idx" ON public."Opportunity" USING btree ("leadId");
CREATE INDEX IF NOT EXISTS "Opportunity_contactId_idx" ON public."Opportunity" USING btree ("contactId");

CREATE TABLE IF NOT EXISTS "CrmActivity" (
  "id" text NOT NULL,
  "organizationId" text NOT NULL,
  "type" "CrmActivityType" NOT NULL,
  "subject" text NOT NULL,
  "description" text,
  "outcome" text,
  "scheduledAt" timestamp(3) without time zone,
  "completedAt" timestamp(3) without time zone,
  "durationMinutes" integer,
  "assignedToId" text,
  "createdById" text NOT NULL,
  "leadId" text,
  "contactId" text,
  "opportunityId" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "CrmActivity_pkey" ON public."CrmActivity" USING btree (id);
CREATE INDEX IF NOT EXISTS "CrmActivity_organizationId_idx" ON public."CrmActivity" USING btree ("organizationId");
CREATE INDEX IF NOT EXISTS "CrmActivity_assignedToId_idx" ON public."CrmActivity" USING btree ("assignedToId");
CREATE INDEX IF NOT EXISTS "CrmActivity_type_idx" ON public."CrmActivity" USING btree (type);
CREATE INDEX IF NOT EXISTS "CrmActivity_leadId_idx" ON public."CrmActivity" USING btree ("leadId");
CREATE INDEX IF NOT EXISTS "CrmActivity_contactId_idx" ON public."CrmActivity" USING btree ("contactId");
CREATE INDEX IF NOT EXISTS "CrmActivity_opportunityId_idx" ON public."CrmActivity" USING btree ("opportunityId");

CREATE TABLE IF NOT EXISTS "CrmTask" (
  "id" text NOT NULL,
  "organizationId" text NOT NULL,
  "subject" text NOT NULL,
  "description" text,
  "status" "CrmTaskStatus" NOT NULL DEFAULT 'PENDING'::"CrmTaskStatus",
  "priority" "CrmTaskPriority" NOT NULL DEFAULT 'MEDIUM'::"CrmTaskPriority",
  "dueDate" timestamp(3) without time zone,
  "completedAt" timestamp(3) without time zone,
  "assignedToId" text,
  "createdById" text NOT NULL,
  "leadId" text,
  "contactId" text,
  "opportunityId" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "CrmTask_pkey" ON public."CrmTask" USING btree (id);
CREATE INDEX IF NOT EXISTS "CrmTask_organizationId_idx" ON public."CrmTask" USING btree ("organizationId");
CREATE INDEX IF NOT EXISTS "CrmTask_assignedToId_idx" ON public."CrmTask" USING btree ("assignedToId");
CREATE INDEX IF NOT EXISTS "CrmTask_status_idx" ON public."CrmTask" USING btree (status);
CREATE INDEX IF NOT EXISTS "CrmTask_dueDate_idx" ON public."CrmTask" USING btree ("dueDate");

CREATE TABLE IF NOT EXISTS "CrmMeeting" (
  "id" text NOT NULL,
  "organizationId" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "startTime" timestamp(3) without time zone NOT NULL,
  "endTime" timestamp(3) without time zone,
  "location" text,
  "meetingLink" text,
  "status" text NOT NULL DEFAULT 'SCHEDULED'::text,
  "outcome" text,
  "organizerId" text,
  "leadId" text,
  "contactId" text,
  "opportunityId" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "CrmMeeting_pkey" ON public."CrmMeeting" USING btree (id);
CREATE INDEX IF NOT EXISTS "CrmMeeting_organizationId_idx" ON public."CrmMeeting" USING btree ("organizationId");
CREATE INDEX IF NOT EXISTS "CrmMeeting_organizerId_idx" ON public."CrmMeeting" USING btree ("organizerId");
CREATE INDEX IF NOT EXISTS "CrmMeeting_startTime_idx" ON public."CrmMeeting" USING btree ("startTime");

CREATE TABLE IF NOT EXISTS "CrmNote" (
  "id" text NOT NULL,
  "organizationId" text NOT NULL,
  "content" text NOT NULL,
  "pinned" boolean NOT NULL DEFAULT false,
  "leadId" text,
  "contactId" text,
  "opportunityId" text,
  "createdById" text NOT NULL,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "CrmNote_pkey" ON public."CrmNote" USING btree (id);
CREATE INDEX IF NOT EXISTS "CrmNote_organizationId_idx" ON public."CrmNote" USING btree ("organizationId");
CREATE INDEX IF NOT EXISTS "CrmNote_leadId_idx" ON public."CrmNote" USING btree ("leadId");
CREATE INDEX IF NOT EXISTS "CrmNote_contactId_idx" ON public."CrmNote" USING btree ("contactId");
CREATE INDEX IF NOT EXISTS "CrmNote_opportunityId_idx" ON public."CrmNote" USING btree ("opportunityId");
CREATE INDEX IF NOT EXISTS "CrmNote_pinned_idx" ON public."CrmNote" USING btree (pinned);

CREATE TABLE IF NOT EXISTS "EvaluationCriterion" (
  "id" text NOT NULL,
  "rfqId" text,
  "name" text NOT NULL,
  "description" text,
  "maxScore" double precision NOT NULL,
  "weight" double precision NOT NULL DEFAULT 1.0,
  "orderIndex" integer NOT NULL DEFAULT 0,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "EvaluationCriterion_pkey" ON public."EvaluationCriterion" USING btree (id);
CREATE INDEX IF NOT EXISTS "EvaluationCriterion_rfqId_idx" ON public."EvaluationCriterion" USING btree ("rfqId");

CREATE TABLE IF NOT EXISTS "EvaluationScore" (
  "id" text NOT NULL,
  "quotationEvaluationId" text NOT NULL,
  "criterionId" text NOT NULL,
  "score" double precision NOT NULL,
  "comment" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "EvaluationScore_pkey" ON public."EvaluationScore" USING btree (id);
CREATE INDEX IF NOT EXISTS "EvaluationScore_quotationEvaluationId_idx" ON public."EvaluationScore" USING btree ("quotationEvaluationId");
CREATE INDEX IF NOT EXISTS "EvaluationScore_criterionId_idx" ON public."EvaluationScore" USING btree ("criterionId");

CREATE TABLE IF NOT EXISTS "QuotationEvaluation" (
  "id" text NOT NULL,
  "quotationId" text NOT NULL,
  "evaluatorId" text NOT NULL,
  "status" "EvalStatus" NOT NULL DEFAULT 'PENDING'::"EvalStatus",
  "totalScore" double precision,
  "notes" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "QuotationEvaluation_pkey" ON public."QuotationEvaluation" USING btree (id);
CREATE INDEX IF NOT EXISTS "QuotationEvaluation_quotationId_idx" ON public."QuotationEvaluation" USING btree ("quotationId");
CREATE INDEX IF NOT EXISTS "QuotationEvaluation_evaluatorId_idx" ON public."QuotationEvaluation" USING btree ("evaluatorId");
CREATE INDEX IF NOT EXISTS "QuotationEvaluation_status_idx" ON public."QuotationEvaluation" USING btree (status);

CREATE TABLE IF NOT EXISTS "ApprovalRequest" (
  "id" text NOT NULL,
  "quotationEvaluationId" text NOT NULL,
  "requestedById" text NOT NULL,
  "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING'::"ApprovalStatus",
  "notes" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "ApprovalRequest_pkey" ON public."ApprovalRequest" USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS "ApprovalRequest_quotationEvaluationId_key" ON public."ApprovalRequest" USING btree ("quotationEvaluationId");

CREATE TABLE IF NOT EXISTS "ApprovalHistory" (
  "id" text NOT NULL,
  "approvalRequestId" text NOT NULL,
  "action" "ApprovalStatus" NOT NULL,
  "comment" text,
  "actionById" text NOT NULL,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "ApprovalHistory_pkey" ON public."ApprovalHistory" USING btree (id);
CREATE INDEX IF NOT EXISTS "ApprovalHistory_approvalRequestId_idx" ON public."ApprovalHistory" USING btree ("approvalRequestId");

CREATE TABLE IF NOT EXISTS "Delivery" (
  "id" text NOT NULL,
  "deliveryNumber" text NOT NULL,
  "purchaseOrderId" text NOT NULL,
  "supplierId" text NOT NULL,
  "driverName" text,
  "driverPhone" text,
  "vehicleNumber" text,
  "status" "PODeliveryStatus" NOT NULL DEFAULT 'SCHEDULED'::"PODeliveryStatus",
  "scheduledDate" timestamp(3) without time zone,
  "dispatchedAt" timestamp(3) without time zone,
  "arrivedAt" timestamp(3) without time zone,
  "notes" text,
  "createdById" text NOT NULL,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Delivery_pkey" ON public."Delivery" USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS "Delivery_deliveryNumber_key" ON public."Delivery" USING btree ("deliveryNumber");
CREATE INDEX IF NOT EXISTS "Delivery_purchaseOrderId_idx" ON public."Delivery" USING btree ("purchaseOrderId");
CREATE INDEX IF NOT EXISTS "Delivery_supplierId_idx" ON public."Delivery" USING btree ("supplierId");
CREATE INDEX IF NOT EXISTS "Delivery_status_idx" ON public."Delivery" USING btree (status);

CREATE TABLE IF NOT EXISTS "DeliveryItem" (
  "id" text NOT NULL,
  "deliveryId" text NOT NULL,
  "poItemId" text NOT NULL,
  "quantity" double precision NOT NULL,
  "notes" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "DeliveryItem_pkey" ON public."DeliveryItem" USING btree (id);
CREATE INDEX IF NOT EXISTS "DeliveryItem_deliveryId_idx" ON public."DeliveryItem" USING btree ("deliveryId");
CREATE INDEX IF NOT EXISTS "DeliveryItem_poItemId_idx" ON public."DeliveryItem" USING btree ("poItemId");

CREATE TABLE IF NOT EXISTS "InvoiceMatch" (
  "id" text NOT NULL,
  "invoiceId" text NOT NULL,
  "referenceType" text NOT NULL,
  "referenceId" text NOT NULL,
  "status" "MatchStatus" NOT NULL DEFAULT 'PENDING'::"MatchStatus",
  "poQuantity" double precision,
  "deliveryQuantity" double precision,
  "acceptedQuantity" double precision,
  "invoiceQuantity" double precision,
  "poAmount" double precision,
  "deliveryAmount" double precision,
  "invoiceAmount" double precision,
  "varianceQuantity" double precision,
  "varianceAmount" double precision,
  "notes" text,
  "matchedAt" timestamp(3) without time zone,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "InvoiceMatch_pkey" ON public."InvoiceMatch" USING btree (id);
CREATE INDEX IF NOT EXISTS "InvoiceMatch_invoiceId_idx" ON public."InvoiceMatch" USING btree ("invoiceId");
CREATE INDEX IF NOT EXISTS "InvoiceMatch_referenceType_referenceId_idx" ON public."InvoiceMatch" USING btree ("referenceType", "referenceId");
CREATE UNIQUE INDEX IF NOT EXISTS "InvoiceMatch_invoiceId_referenceType_referenceId_key" ON public."InvoiceMatch" USING btree ("invoiceId", "referenceType", "referenceId");

CREATE TABLE IF NOT EXISTS "Inspection" (
  "id" text NOT NULL,
  "inspectionNumber" text NOT NULL,
  "type" text NOT NULL,
  "status" "InspectionStatus" NOT NULL DEFAULT 'PENDING'::"InspectionStatus",
  "referenceType" text NOT NULL,
  "referenceId" text NOT NULL,
  "inspectorId" text NOT NULL,
  "scheduledAt" timestamp(3) without time zone,
  "completedAt" timestamp(3) without time zone,
  "notes" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Inspection_pkey" ON public."Inspection" USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS "Inspection_inspectionNumber_key" ON public."Inspection" USING btree ("inspectionNumber");
CREATE INDEX IF NOT EXISTS "Inspection_referenceType_referenceId_idx" ON public."Inspection" USING btree ("referenceType", "referenceId");
CREATE INDEX IF NOT EXISTS "Inspection_inspectorId_idx" ON public."Inspection" USING btree ("inspectorId");
CREATE INDEX IF NOT EXISTS "Inspection_status_idx" ON public."Inspection" USING btree (status);
CREATE INDEX IF NOT EXISTS "Inspection_inspectionNumber_idx" ON public."Inspection" USING btree ("inspectionNumber");

CREATE TABLE IF NOT EXISTS "InspectionItem" (
  "id" text NOT NULL,
  "inspectionId" text NOT NULL,
  "deliveryItemId" text,
  "poItemId" text NOT NULL,
  "specification" text NOT NULL,
  "expectedValue" text,
  "actualValue" text,
  "result" "InspectionItemResult",
  "remarks" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "InspectionItem_pkey" ON public."InspectionItem" USING btree (id);
CREATE INDEX IF NOT EXISTS "InspectionItem_inspectionId_idx" ON public."InspectionItem" USING btree ("inspectionId");
CREATE INDEX IF NOT EXISTS "InspectionItem_deliveryItemId_idx" ON public."InspectionItem" USING btree ("deliveryItemId");
CREATE INDEX IF NOT EXISTS "InspectionItem_poItemId_idx" ON public."InspectionItem" USING btree ("poItemId");

CREATE TABLE IF NOT EXISTS "InspectionAttachment" (
  "id" text NOT NULL,
  "inspectionId" text NOT NULL,
  "type" text NOT NULL,
  "url" text NOT NULL,
  "fileName" text NOT NULL,
  "uploadedById" text NOT NULL,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "InspectionAttachment_pkey" ON public."InspectionAttachment" USING btree (id);
CREATE INDEX IF NOT EXISTS "InspectionAttachment_inspectionId_idx" ON public."InspectionAttachment" USING btree ("inspectionId");
CREATE INDEX IF NOT EXISTS "InspectionAttachment_uploadedById_idx" ON public."InspectionAttachment" USING btree ("uploadedById");

CREATE TABLE IF NOT EXISTS "NCR" (
  "id" text NOT NULL,
  "ncrNumber" text NOT NULL,
  "inspectionId" text NOT NULL,
  "severity" "NCRSeverity" NOT NULL DEFAULT 'MEDIUM'::"NCRSeverity",
  "category" text NOT NULL,
  "description" text NOT NULL,
  "correctiveAction" text,
  "dueDate" timestamp(3) without time zone,
  "status" "NCRStatus" NOT NULL DEFAULT 'OPEN'::"NCRStatus",
  "createdById" text NOT NULL,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "NCR_pkey" ON public."NCR" USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS "NCR_ncrNumber_key" ON public."NCR" USING btree ("ncrNumber");
CREATE INDEX IF NOT EXISTS "NCR_inspectionId_idx" ON public."NCR" USING btree ("inspectionId");
CREATE INDEX IF NOT EXISTS "NCR_status_idx" ON public."NCR" USING btree (status);
CREATE INDEX IF NOT EXISTS "NCR_ncrNumber_idx" ON public."NCR" USING btree ("ncrNumber");

CREATE TABLE IF NOT EXISTS "AcceptanceCertificate" (
  "id" text NOT NULL,
  "certificateNumber" text NOT NULL,
  "inspectionId" text NOT NULL,
  "acceptedById" text NOT NULL,
  "acceptedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "remarks" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "AcceptanceCertificate_pkey" ON public."AcceptanceCertificate" USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS "AcceptanceCertificate_certificateNumber_key" ON public."AcceptanceCertificate" USING btree ("certificateNumber");
CREATE INDEX IF NOT EXISTS "AcceptanceCertificate_inspectionId_idx" ON public."AcceptanceCertificate" USING btree ("inspectionId");
CREATE INDEX IF NOT EXISTS "AcceptanceCertificate_acceptedById_idx" ON public."AcceptanceCertificate" USING btree ("acceptedById");
CREATE INDEX IF NOT EXISTS "AcceptanceCertificate_certificateNumber_idx" ON public."AcceptanceCertificate" USING btree ("certificateNumber");

CREATE TABLE IF NOT EXISTS "PaymentReservation" (
  "id" text NOT NULL,
  "reservationNumber" text NOT NULL,
  "purchaseOrderId" text NOT NULL,
  "supplierId" text NOT NULL,
  "buyerId" text NOT NULL,
  "totalAmount" double precision NOT NULL,
  "heldAmount" double precision NOT NULL DEFAULT 0,
  "releasedAmount" double precision NOT NULL DEFAULT 0,
  "currency" text NOT NULL DEFAULT 'SAR'::text,
  "status" "PaymentReservationStatus" NOT NULL DEFAULT 'RESERVED'::"PaymentReservationStatus",
  "notes" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentReservation_pkey" ON public."PaymentReservation" USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentReservation_reservationNumber_key" ON public."PaymentReservation" USING btree ("reservationNumber");
CREATE INDEX IF NOT EXISTS "PaymentReservation_purchaseOrderId_idx" ON public."PaymentReservation" USING btree ("purchaseOrderId");
CREATE INDEX IF NOT EXISTS "PaymentReservation_supplierId_idx" ON public."PaymentReservation" USING btree ("supplierId");
CREATE INDEX IF NOT EXISTS "PaymentReservation_buyerId_idx" ON public."PaymentReservation" USING btree ("buyerId");
CREATE INDEX IF NOT EXISTS "PaymentReservation_status_idx" ON public."PaymentReservation" USING btree (status);

CREATE TABLE IF NOT EXISTS "PaymentRelease" (
  "id" text NOT NULL,
  "reservationId" text NOT NULL,
  "amount" double precision NOT NULL,
  "type" "PaymentReleaseType" NOT NULL,
  "notes" text,
  "releasedById" text NOT NULL,
  "releasedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentRelease_pkey" ON public."PaymentRelease" USING btree (id);
CREATE INDEX IF NOT EXISTS "PaymentRelease_reservationId_idx" ON public."PaymentRelease" USING btree ("reservationId");
CREATE INDEX IF NOT EXISTS "PaymentRelease_releasedById_idx" ON public."PaymentRelease" USING btree ("releasedById");

