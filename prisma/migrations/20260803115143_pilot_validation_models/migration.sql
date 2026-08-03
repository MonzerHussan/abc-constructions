-- Migration: pilot_validation_models
-- Reconstructed from live DB to close git/DB drift (P5 Gatekeeper).
-- Idempotent: uses IF NOT EXISTS for tables and indexes.

CREATE TYPE "AdoptionInterest" AS ENUM ('IMMEDIATELY', 'MONTHS_6_12', 'LATER');
CREATE TYPE "AllowedUsage" AS ENUM ('PRODUCT_RESEARCH', 'CONTACT_FOR_PILOT', 'EARLY_ADOPTER_LIST');
CREATE TYPE "CapabilityLevel" AS ENUM ('PRIMARY', 'SECONDARY', 'SPECIALIZED', 'EMERGING');
CREATE TYPE "CommissionAcceptance" AS ENUM ('NONE', 'P_1_3', 'P_3_5', 'P_5_PLUS');
CREATE TYPE "ConsentStatus" AS ENUM ('GRANTED', 'DENIED', 'NOT_REQUESTED');
CREATE TYPE "EntityLinkStatus" AS ENUM ('ACTIVE', 'PENDING', 'ENDED');
CREATE TYPE "EntityRelationshipStatus" AS ENUM ('NEW', 'ENGAGED', 'TRIAL', 'ACTIVE', 'CHURNED');
CREATE TYPE "EntitySource" AS ENUM ('LINKEDIN', 'WHATSAPP', 'EMAIL', 'REFERRAL', 'EVENT', 'INTERNAL');
CREATE TYPE "EntitySubtype" AS ENUM ('CONTRACTOR', 'DEVELOPER', 'CONSULTANT', 'PROJECT_OWNER', 'SUPPLIER', 'MANUFACTURER', 'DISTRIBUTOR', 'MATERIAL_VENDOR', 'STRATEGIC_PARTNER', 'INDUSTRY_ASSOCIATION', 'SERVICE_PROVIDER', 'INVESTOR', 'ADVISOR', 'MEDIA', 'POTENTIAL_TEAM_MEMBER', 'SERVICE_STAFF');
CREATE TYPE "EntityType" AS ENUM ('CUST', 'SUPP', 'ECO', 'INT');
CREATE TYPE "FoundingMemberTier" AS ENUM ('PIONEER', 'EARLY_ADOPTER', 'BETA_TESTER', 'INSIDER');
CREATE TYPE "InteractionChannel" AS ENUM ('TYPEFORM', 'WHATSAPP', 'EMAIL', 'PHONE', 'IN_PERSON', 'PLATFORM');
CREATE TYPE "InteractionType" AS ENUM ('SURVEY', 'INTERVIEW', 'EMAIL', 'CALL', 'MEETING', 'FEEDBACK', 'PILOT_ACTIVITY', 'REFERRAL');
CREATE TYPE "PilotStatus" AS ENUM ('INVITED', 'STARTED', 'COMPLETED', 'INTERVIEWED', 'FT_TRIAL');
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'TEXTAREA', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DROPDOWN', 'LINEAR_SCALE', 'RATING', 'YES_NO', 'EMAIL', 'PHONE', 'DATE', 'FILE_UPLOAD', 'MATRIX', 'NET_PROMOTER_SCORE', 'CSAT', 'CES', 'RANKING', 'SECTION_BREAK', 'INFO_TEXT');
CREATE TYPE "RelationshipStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'TERMINATED');
CREATE TYPE "RelationshipType" AS ENUM ('SERVES', 'DEMANDS', 'OWNS', 'EXECUTES', 'INITIATES', 'BIDS', 'RESULTS', 'PARTNERS', 'REFERS', 'FUNDS');
CREATE TYPE "ResearchCampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'ARCHIVED');
CREATE TYPE "ResearchCampaignType" AS ENUM ('MARKET_RESEARCH', 'PROBLEM_DISCOVERY', 'PRICING_RESEARCH', 'COMPETITOR_BENCHMARKING', 'PRODUCT_VALIDATION', 'FEATURE_VALIDATION', 'BETA_TESTING', 'CUSTOMER_SATISFACTION', 'NPS', 'CSAT', 'CES', 'PRODUCT_FEEDBACK', 'FEATURE_REQUESTS', 'BUG_REPORTS', 'UX_RESEARCH', 'INTERVIEW', 'FOCUS_GROUP', 'OTHER');
CREATE TYPE "ResearchParticipantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');
CREATE TYPE "ResearchParticipantType" AS ENUM ('GUEST', 'REGISTERED');
CREATE TYPE "ResearchSegmentType" AS ENUM ('PROJECT_OWNER', 'CONSULTANT', 'MAIN_CONTRACTOR', 'SUBCONTRACTOR', 'WORKSHOP', 'SUPPLIER', 'FACTORY', 'TRANSPORT_COMPANY', 'FREELANCER', 'JOB_SEEKER', 'GOVERNMENT', 'OTHER');
CREATE TYPE "SurveyResponseStatus" AS ENUM ('PARTIAL', 'COMPLETED', 'DISQUALIFIED');
CREATE TYPE "WtpRange" AS ENUM ('UNDER_100', 'RANGE_100_400', 'RANGE_400_1000', 'RANGE_1000_PLUS');

CREATE TABLE IF NOT EXISTS "ResearchCampaign" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "titleEn" text,
  "titleAr" text,
  "titleUr" text,
  "description" text,
  "descriptionEn" text,
  "descriptionAr" text,
  "descriptionUr" text,
  "campaignType" "ResearchCampaignType" NOT NULL,
  "status" "ResearchCampaignStatus" NOT NULL DEFAULT 'DRAFT'::"ResearchCampaignStatus",
  "slug" text NOT NULL,
  "coverImage" text,
  "landingPage" text,
  "welcomeMessage" text,
  "thankYouMessage" text,
  "allowGuestParticipation" boolean NOT NULL DEFAULT true,
  "requireEmailVerification" boolean NOT NULL DEFAULT false,
  "maxResponses" integer,
  "startDate" timestamp(3) without time zone,
  "endDate" timestamp(3) without time zone,
  "targetResponses" integer,
  "isPublic" boolean NOT NULL DEFAULT false,
  "isFeatured" boolean NOT NULL DEFAULT false,
  "metadata" jsonb,
  "createdById" text NOT NULL,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "ResearchCampaign_pkey" ON public."ResearchCampaign" USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS "ResearchCampaign_slug_key" ON public."ResearchCampaign" USING btree (slug);
CREATE INDEX IF NOT EXISTS "ResearchCampaign_status_idx" ON public."ResearchCampaign" USING btree (status);
CREATE INDEX IF NOT EXISTS "ResearchCampaign_campaignType_idx" ON public."ResearchCampaign" USING btree ("campaignType");
CREATE INDEX IF NOT EXISTS "ResearchCampaign_createdById_idx" ON public."ResearchCampaign" USING btree ("createdById");
CREATE INDEX IF NOT EXISTS "ResearchCampaign_slug_idx" ON public."ResearchCampaign" USING btree (slug);
CREATE INDEX IF NOT EXISTS "ResearchCampaign_createdAt_idx" ON public."ResearchCampaign" USING btree ("createdAt");

CREATE TABLE IF NOT EXISTS "ResearchSegment" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "nameEn" text,
  "nameUr" text,
  "description" text,
  "segmentType" "ResearchSegmentType" NOT NULL DEFAULT 'OTHER'::"ResearchSegmentType",
  "icon" text,
  "color" text,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "ResearchSegment_pkey" ON public."ResearchSegment" USING btree (id);
CREATE INDEX IF NOT EXISTS "ResearchSegment_segmentType_idx" ON public."ResearchSegment" USING btree ("segmentType");

CREATE TABLE IF NOT EXISTS "ResearchCampaignSegment" (
  "id" text NOT NULL,
  "campaignId" text NOT NULL,
  "segmentId" text NOT NULL,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "ResearchCampaignSegment_pkey" ON public."ResearchCampaignSegment" USING btree (id);
CREATE INDEX IF NOT EXISTS "ResearchCampaignSegment_campaignId_idx" ON public."ResearchCampaignSegment" USING btree ("campaignId");
CREATE INDEX IF NOT EXISTS "ResearchCampaignSegment_segmentId_idx" ON public."ResearchCampaignSegment" USING btree ("segmentId");
CREATE UNIQUE INDEX IF NOT EXISTS "ResearchCampaignSegment_campaignId_segmentId_key" ON public."ResearchCampaignSegment" USING btree ("campaignId", "segmentId");

CREATE TABLE IF NOT EXISTS "CampaignParticipant" (
  "id" text NOT NULL,
  "campaignId" text NOT NULL,
  "participantId" text NOT NULL,
  "status" text NOT NULL DEFAULT 'ACTIVE'::text,
  "role" text NOT NULL DEFAULT 'RESPONDENT'::text,
  "joinedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "CampaignParticipant_pkey" ON public."CampaignParticipant" USING btree (id);
CREATE INDEX IF NOT EXISTS "CampaignParticipant_campaignId_idx" ON public."CampaignParticipant" USING btree ("campaignId");
CREATE INDEX IF NOT EXISTS "CampaignParticipant_participantId_idx" ON public."CampaignParticipant" USING btree ("participantId");
CREATE UNIQUE INDEX IF NOT EXISTS "CampaignParticipant_campaignId_participantId_key" ON public."CampaignParticipant" USING btree ("campaignId", "participantId");

CREATE TABLE IF NOT EXISTS "ResearchParticipant" (
  "id" text NOT NULL,
  "email" text,
  "phone" text,
  "name" text,
  "company" text,
  "jobTitle" text,
  "country" text,
  "city" text,
  "segmentId" text,
  "linkedUserId" text,
  "status" "ResearchParticipantStatus" NOT NULL DEFAULT 'ACTIVE'::"ResearchParticipantStatus",
  "participantType" "ResearchParticipantType",
  "tags" text[],
  "metadata" jsonb,
  "consentGiven" boolean NOT NULL DEFAULT false,
  "consentDate" timestamp(3) without time zone,
  "source" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "ResearchParticipant_pkey" ON public."ResearchParticipant" USING btree (id);
CREATE INDEX IF NOT EXISTS "ResearchParticipant_email_idx" ON public."ResearchParticipant" USING btree (email);
CREATE INDEX IF NOT EXISTS "ResearchParticipant_phone_idx" ON public."ResearchParticipant" USING btree (phone);
CREATE INDEX IF NOT EXISTS "ResearchParticipant_linkedUserId_idx" ON public."ResearchParticipant" USING btree ("linkedUserId");
CREATE INDEX IF NOT EXISTS "ResearchParticipant_segmentId_idx" ON public."ResearchParticipant" USING btree ("segmentId");
CREATE INDEX IF NOT EXISTS "ResearchParticipant_status_idx" ON public."ResearchParticipant" USING btree (status);

CREATE TABLE IF NOT EXISTS "FoundingMember" (
  "id" text NOT NULL,
  "participantId" text NOT NULL,
  "tier" "FoundingMemberTier" NOT NULL DEFAULT 'INSIDER'::"FoundingMemberTier",
  "badge" text,
  "earlyAccess" boolean NOT NULL DEFAULT false,
  "betaAccess" boolean NOT NULL DEFAULT false,
  "discountPercent" double precision,
  "freeSubscription" boolean NOT NULL DEFAULT false,
  "subscriptionMonths" integer,
  "specialOffers" jsonb,
  "joinedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" text
);
CREATE UNIQUE INDEX IF NOT EXISTS "FoundingMember_pkey" ON public."FoundingMember" USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS "FoundingMember_participantId_key" ON public."FoundingMember" USING btree ("participantId");
CREATE INDEX IF NOT EXISTS "FoundingMember_tier_idx" ON public."FoundingMember" USING btree (tier);

CREATE TABLE IF NOT EXISTS "Survey" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "titleEn" text,
  "titleAr" text,
  "titleUr" text,
  "description" text,
  "descriptionEn" text,
  "descriptionAr" text,
  "descriptionUr" text,
  "campaignId" text NOT NULL,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "timeEstimate" integer,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Survey_pkey" ON public."Survey" USING btree (id);
CREATE INDEX IF NOT EXISTS "Survey_campaignId_idx" ON public."Survey" USING btree ("campaignId");

CREATE TABLE IF NOT EXISTS "SurveySection" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "titleEn" text,
  "titleAr" text,
  "titleUr" text,
  "description" text,
  "surveyId" text NOT NULL,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "repeatable" boolean NOT NULL DEFAULT false,
  "randomizeQuestions" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "SurveySection_pkey" ON public."SurveySection" USING btree (id);
CREATE INDEX IF NOT EXISTS "SurveySection_surveyId_idx" ON public."SurveySection" USING btree ("surveyId");

CREATE TABLE IF NOT EXISTS "SurveyQuestion" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "titleEn" text,
  "titleAr" text,
  "titleUr" text,
  "description" text,
  "questionType" "QuestionType" NOT NULL,
  "sectionId" text NOT NULL,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "isRequired" boolean NOT NULL DEFAULT true,
  "hasOtherOption" boolean NOT NULL DEFAULT false,
  "otherOptionLabel" text,
  "randomizeOptions" boolean NOT NULL DEFAULT false,
  "maxSelections" integer,
  "minSelections" integer,
  "lowLabel" text,
  "highLabel" text,
  "lowValue" integer,
  "highValue" integer,
  "stepValue" integer,
  "matrixRows" jsonb,
  "matrixColumns" jsonb,
  "validationRules" jsonb,
  "visibilityLogic" jsonb,
  "metadata" jsonb,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "SurveyQuestion_pkey" ON public."SurveyQuestion" USING btree (id);
CREATE INDEX IF NOT EXISTS "SurveyQuestion_sectionId_idx" ON public."SurveyQuestion" USING btree ("sectionId");

CREATE TABLE IF NOT EXISTS "QuestionOption" (
  "id" text NOT NULL,
  "questionId" text NOT NULL,
  "label" text NOT NULL,
  "labelEn" text,
  "labelUr" text,
  "value" text NOT NULL,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "hasCustom" boolean NOT NULL DEFAULT false,
  "metadata" jsonb,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "QuestionOption_pkey" ON public."QuestionOption" USING btree (id);
CREATE INDEX IF NOT EXISTS "QuestionOption_questionId_idx" ON public."QuestionOption" USING btree ("questionId");

CREATE TABLE IF NOT EXISTS "SurveyResponse" (
  "id" text NOT NULL,
  "campaignId" text NOT NULL,
  "surveyId" text NOT NULL,
  "participantId" text,
  "linkedUserId" text,
  "status" "SurveyResponseStatus" NOT NULL DEFAULT 'PARTIAL'::"SurveyResponseStatus",
  "isComplete" boolean NOT NULL DEFAULT false,
  "ipAddress" text,
  "userAgent" text,
  "source" text,
  "timeStarted" timestamp(3) without time zone,
  "timeCompleted" timestamp(3) without time zone,
  "duration" integer,
  "metadata" jsonb,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "SurveyResponse_pkey" ON public."SurveyResponse" USING btree (id);
CREATE INDEX IF NOT EXISTS "SurveyResponse_campaignId_idx" ON public."SurveyResponse" USING btree ("campaignId");
CREATE INDEX IF NOT EXISTS "SurveyResponse_surveyId_idx" ON public."SurveyResponse" USING btree ("surveyId");
CREATE INDEX IF NOT EXISTS "SurveyResponse_participantId_idx" ON public."SurveyResponse" USING btree ("participantId");
CREATE INDEX IF NOT EXISTS "SurveyResponse_linkedUserId_idx" ON public."SurveyResponse" USING btree ("linkedUserId");
CREATE INDEX IF NOT EXISTS "SurveyResponse_status_idx" ON public."SurveyResponse" USING btree (status);
CREATE INDEX IF NOT EXISTS "SurveyResponse_createdAt_idx" ON public."SurveyResponse" USING btree ("createdAt");

CREATE TABLE IF NOT EXISTS "ResponseAnswer" (
  "id" text NOT NULL,
  "responseId" text NOT NULL,
  "questionId" text NOT NULL,
  "value" text,
  "values" text[],
  "valueNumber" double precision,
  "valueJson" jsonb,
  "timeSpent" integer,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "ResponseAnswer_pkey" ON public."ResponseAnswer" USING btree (id);
CREATE INDEX IF NOT EXISTS "ResponseAnswer_responseId_idx" ON public."ResponseAnswer" USING btree ("responseId");
CREATE INDEX IF NOT EXISTS "ResponseAnswer_questionId_idx" ON public."ResponseAnswer" USING btree ("questionId");

CREATE TABLE IF NOT EXISTS "FeatureRequest" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "category" text NOT NULL DEFAULT 'NEW_FEATURE'::text,
  "status" text NOT NULL DEFAULT 'UNDER_REVIEW'::text,
  "priority" text NOT NULL DEFAULT 'MEDIUM'::text,
  "campaignId" text,
  "participantId" text,
  "linkedUserId" text,
  "metadata" jsonb,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "FeatureRequest_pkey" ON public."FeatureRequest" USING btree (id);
CREATE INDEX IF NOT EXISTS "FeatureRequest_status_idx" ON public."FeatureRequest" USING btree (status);
CREATE INDEX IF NOT EXISTS "FeatureRequest_priority_idx" ON public."FeatureRequest" USING btree (priority);
CREATE INDEX IF NOT EXISTS "FeatureRequest_campaignId_idx" ON public."FeatureRequest" USING btree ("campaignId");
CREATE INDEX IF NOT EXISTS "FeatureRequest_createdAt_idx" ON public."FeatureRequest" USING btree ("createdAt");

CREATE TABLE IF NOT EXISTS "FeatureVote" (
  "id" text NOT NULL,
  "featureRequestId" text NOT NULL,
  "participantId" text,
  "linkedUserId" text,
  "vote" integer NOT NULL DEFAULT 1,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "FeatureVote_pkey" ON public."FeatureVote" USING btree (id);
CREATE INDEX IF NOT EXISTS "FeatureVote_featureRequestId_idx" ON public."FeatureVote" USING btree ("featureRequestId");
CREATE UNIQUE INDEX IF NOT EXISTS "FeatureVote_featureRequestId_participantId_key" ON public."FeatureVote" USING btree ("featureRequestId", "participantId");

CREATE TABLE IF NOT EXISTS "Feedback" (
  "id" text NOT NULL,
  "content" text NOT NULL,
  "category" text,
  "participantId" text,
  "linkedUserId" text,
  "source" text,
  "isPublic" boolean NOT NULL DEFAULT false,
  "metadata" jsonb,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Feedback_pkey" ON public."Feedback" USING btree (id);
CREATE INDEX IF NOT EXISTS "Feedback_participantId_idx" ON public."Feedback" USING btree ("participantId");
CREATE INDEX IF NOT EXISTS "Feedback_linkedUserId_idx" ON public."Feedback" USING btree ("linkedUserId");
CREATE INDEX IF NOT EXISTS "Feedback_category_idx" ON public."Feedback" USING btree (category);

CREATE TABLE IF NOT EXISTS "BugReport" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "stepsToReproduce" text,
  "severity" text NOT NULL DEFAULT 'MEDIUM'::text,
  "status" text NOT NULL DEFAULT 'REPORTED'::text,
  "attachment" text,
  "participantId" text,
  "linkedUserId" text,
  "metadata" jsonb,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "BugReport_pkey" ON public."BugReport" USING btree (id);
CREATE INDEX IF NOT EXISTS "BugReport_status_idx" ON public."BugReport" USING btree (status);
CREATE INDEX IF NOT EXISTS "BugReport_severity_idx" ON public."BugReport" USING btree (severity);

CREATE TABLE IF NOT EXISTS "NpsScore" (
  "id" text NOT NULL,
  "score" integer NOT NULL,
  "reason" text,
  "campaignId" text,
  "participantId" text,
  "linkedUserId" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "NpsScore_pkey" ON public."NpsScore" USING btree (id);
CREATE INDEX IF NOT EXISTS "NpsScore_campaignId_idx" ON public."NpsScore" USING btree ("campaignId");
CREATE INDEX IF NOT EXISTS "NpsScore_participantId_idx" ON public."NpsScore" USING btree ("participantId");
CREATE INDEX IF NOT EXISTS "NpsScore_linkedUserId_idx" ON public."NpsScore" USING btree ("linkedUserId");

CREATE TABLE IF NOT EXISTS "CsatScore" (
  "id" text NOT NULL,
  "score" integer NOT NULL,
  "reason" text,
  "campaignId" text,
  "participantId" text,
  "linkedUserId" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "CsatScore_pkey" ON public."CsatScore" USING btree (id);
CREATE INDEX IF NOT EXISTS "CsatScore_campaignId_idx" ON public."CsatScore" USING btree ("campaignId");
CREATE INDEX IF NOT EXISTS "CsatScore_participantId_idx" ON public."CsatScore" USING btree ("participantId");
CREATE INDEX IF NOT EXISTS "CsatScore_linkedUserId_idx" ON public."CsatScore" USING btree ("linkedUserId");

CREATE TABLE IF NOT EXISTS "CesScore" (
  "id" text NOT NULL,
  "score" integer NOT NULL,
  "reason" text,
  "campaignId" text,
  "participantId" text,
  "linkedUserId" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "CesScore_pkey" ON public."CesScore" USING btree (id);
CREATE INDEX IF NOT EXISTS "CesScore_campaignId_idx" ON public."CesScore" USING btree ("campaignId");
CREATE INDEX IF NOT EXISTS "CesScore_participantId_idx" ON public."CesScore" USING btree ("participantId");
CREATE INDEX IF NOT EXISTS "CesScore_linkedUserId_idx" ON public."CesScore" USING btree ("linkedUserId");

CREATE TABLE IF NOT EXISTS "Interview" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "campaignId" text NOT NULL,
  "participantId" text,
  "interviewerId" text,
  "scheduledAt" timestamp(3) without time zone,
  "conductedAt" timestamp(3) without time zone,
  "duration" integer,
  "notes" text,
  "transcript" text,
  "recordingUrl" text,
  "keyFindings" jsonb,
  "status" text NOT NULL DEFAULT 'SCHEDULED'::text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Interview_pkey" ON public."Interview" USING btree (id);
CREATE INDEX IF NOT EXISTS "Interview_campaignId_idx" ON public."Interview" USING btree ("campaignId");
CREATE INDEX IF NOT EXISTS "Interview_participantId_idx" ON public."Interview" USING btree ("participantId");
CREATE INDEX IF NOT EXISTS "Interview_status_idx" ON public."Interview" USING btree (status);

CREATE TABLE IF NOT EXISTS "FocusGroup" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "campaignId" text NOT NULL,
  "moderatorId" text,
  "scheduledAt" timestamp(3) without time zone,
  "conductedAt" timestamp(3) without time zone,
  "duration" integer,
  "participantIds" text[],
  "notes" text,
  "transcript" text,
  "recordingUrl" text,
  "keyFindings" jsonb,
  "status" text NOT NULL DEFAULT 'SCHEDULED'::text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "FocusGroup_pkey" ON public."FocusGroup" USING btree (id);
CREATE INDEX IF NOT EXISTS "FocusGroup_campaignId_idx" ON public."FocusGroup" USING btree ("campaignId");
CREATE INDEX IF NOT EXISTS "FocusGroup_status_idx" ON public."FocusGroup" USING btree (status);

CREATE TABLE IF NOT EXISTS "PricingResearch" (
  "id" text NOT NULL,
  "campaignId" text NOT NULL,
  "modelType" text NOT NULL,
  "pricePoint" double precision,
  "currency" text NOT NULL DEFAULT 'SAR'::text,
  "willingness" integer,
  "feedback" text,
  "competitorPrice" double precision,
  "participantId" text,
  "metadata" jsonb,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "PricingResearch_pkey" ON public."PricingResearch" USING btree (id);
CREATE INDEX IF NOT EXISTS "PricingResearch_campaignId_idx" ON public."PricingResearch" USING btree ("campaignId");
CREATE INDEX IF NOT EXISTS "PricingResearch_modelType_idx" ON public."PricingResearch" USING btree ("modelType");

CREATE TABLE IF NOT EXISTS "CompetitorResearch" (
  "id" text NOT NULL,
  "campaignId" text NOT NULL,
  "competitorName" text NOT NULL,
  "competitorUrl" text,
  "strengths" text,
  "weaknesses" text,
  "pricing" text,
  "marketShare" text,
  "features" jsonb,
  "rating" integer,
  "participantId" text,
  "notes" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "CompetitorResearch_pkey" ON public."CompetitorResearch" USING btree (id);
CREATE INDEX IF NOT EXISTS "CompetitorResearch_campaignId_idx" ON public."CompetitorResearch" USING btree ("campaignId");
CREATE INDEX IF NOT EXISTS "CompetitorResearch_competitorName_idx" ON public."CompetitorResearch" USING btree ("competitorName");

CREATE TABLE IF NOT EXISTS "CustomerJourneyEvent" (
  "id" text NOT NULL,
  "participantId" text,
  "linkedUserId" text,
  "eventType" text NOT NULL,
  "eventData" jsonb,
  "source" text,
  "createdAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "CustomerJourneyEvent_pkey" ON public."CustomerJourneyEvent" USING btree (id);
CREATE INDEX IF NOT EXISTS "CustomerJourneyEvent_participantId_idx" ON public."CustomerJourneyEvent" USING btree ("participantId");
CREATE INDEX IF NOT EXISTS "CustomerJourneyEvent_linkedUserId_idx" ON public."CustomerJourneyEvent" USING btree ("linkedUserId");
CREATE INDEX IF NOT EXISTS "CustomerJourneyEvent_eventType_idx" ON public."CustomerJourneyEvent" USING btree ("eventType");
CREATE INDEX IF NOT EXISTS "CustomerJourneyEvent_createdAt_idx" ON public."CustomerJourneyEvent" USING btree ("createdAt");

