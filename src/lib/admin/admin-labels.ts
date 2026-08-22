import type { TranslationKey } from "@/lib/translations";

export const AUDIT_ACTION_KEYS: Record<string, TranslationKey> = {
  LOGIN: "auditActionLogin",
  LOGOUT: "auditActionLogout",
  CREATE: "auditActionCreate",
  UPDATE: "auditActionUpdate",
  DELETE: "auditActionDelete",
  APPROVE: "auditActionApprove",
  REJECT: "auditActionReject",
  VERIFY: "auditActionVerify",
  SUSPEND: "auditActionSuspend",
  ACTIVATE: "auditActionActivate",
  DEACTIVATE: "auditActionDeactivate",
  ASSIGN_ROLE: "auditActionAssignRole",
  REVOKE_ROLE: "auditActionRevokeRole",
  SUBMIT_BID: "auditActionSubmitBid",
  AWARD_TENDER: "auditActionAwardTender",
  MAKE_PAYMENT: "auditActionMakePayment",
  APPROVE_PAYMENT: "auditActionApprovePayment",
  UPLOAD_DOCUMENT: "auditActionUploadDocument",
  CREATE_CAMPAIGN: "auditActionCreateCampaign",
  PUBLISH_CAMPAIGN: "auditActionPublishCampaign",
  SEND_INVITATION: "auditActionSendInvitation",
  EXPORT_DATA: "auditActionExportData",
  GENERATE_INSIGHT: "auditActionGenerateInsight",
};

export const AUDIT_ENTITY_KEYS: Record<string, TranslationKey> = {
  User: "auditEntityUser",
  Organization: "auditEntityOrganization",
  Project: "auditEntityProject",
  ProjectTender: "auditEntityProjectTender",
  MaterialTender: "auditEntityMaterialTender",
  Bid: "auditEntityBid",
  Job: "auditEntityJob",
  Course: "auditEntityCourse",
  Verification: "auditEntityVerification",
  Payment: "auditEntityPayment",
  Invoice: "auditEntityInvoice",
  PurchaseOrder: "auditEntityPurchaseOrder",
  PurchaseRequest: "auditEntityPurchaseRequest",
  Role: "auditEntityRole",
  Permission: "auditEntityPermission",
  Campaign: "auditEntityCampaign",
  Survey: "auditEntitySurvey",
};

export const RESEARCH_CAMPAIGN_STATUS_KEYS: Record<string, TranslationKey> = {
  DRAFT: "researchCampaignStatusDraft",
  ACTIVE: "researchCampaignStatusActive",
  PAUSED: "researchCampaignStatusPaused",
  COMPLETED: "researchCampaignStatusCompleted",
  CANCELLED: "researchCampaignStatusCancelled",
};

export const RESEARCH_CAMPAIGN_TYPE_KEYS: Record<string, TranslationKey> = {
  SURVEY: "researchCampaignTypeSurvey",
  INTERVIEW: "researchCampaignTypeInterview",
  FOCUS_GROUP: "researchCampaignTypeFocusGroup",
  USABILITY_TEST: "researchCampaignTypeUsabilityTest",
  BETA_TEST: "researchCampaignTypeBetaTest",
};

export const RESEARCH_SURVEY_STATUS_KEYS: Record<string, TranslationKey> = {
  DRAFT: "researchSurveyStatusDraft",
  PUBLISHED: "researchSurveyStatusPublished",
};

export const RESEARCH_FEATURE_STATUS_KEYS: Record<string, TranslationKey> = {
  PENDING: "researchFeatureStatusPending",
  UNDER_REVIEW: "researchFeatureStatusUnderReview",
  PLANNED: "researchFeatureStatusPlanned",
  IN_PROGRESS: "researchFeatureStatusInProgress",
  COMPLETED: "researchFeatureStatusCompleted",
  REJECTED: "researchFeatureStatusRejected",
};

export const RESEARCH_FEATURE_PRIORITY_KEYS: Record<string, TranslationKey> = {
  CRITICAL: "researchFeaturePriorityCritical",
  HIGH: "researchFeaturePriorityHigh",
  MEDIUM: "researchFeaturePriorityMedium",
  LOW: "researchFeaturePriorityLow",
};

export const RESEARCH_FEEDBACK_TYPE_KEYS: Record<string, TranslationKey> = {
  BUG: "researchFeedbackTypeBug",
  FEEDBACK: "researchFeedbackTypeFeedback",
  COMPLAINT: "researchFeedbackTypeComplaint",
  SUGGESTION: "researchFeedbackTypeSuggestion",
  PRAISE: "researchFeedbackTypePraise",
};

export const RESEARCH_FEEDBACK_STATUS_KEYS: Record<string, TranslationKey> = {
  NEW: "researchFeedbackStatusNew",
  READ: "researchFeedbackStatusRead",
  IN_PROGRESS: "researchFeedbackStatusInProgress",
  RESOLVED: "researchFeedbackStatusResolved",
  CLOSED: "researchFeedbackStatusClosed",
};

export const RESEARCH_AI_INSIGHT_TYPE_KEYS: Record<string, TranslationKey> = {
  TREND: "researchAiTypeTrend",
  SENTIMENT: "researchAiTypeSentiment",
  PATTERN: "researchAiTypePattern",
  OPPORTUNITY: "researchAiTypeOpportunity",
  SUGGESTION: "researchAiTypeSuggestion",
  ALERT: "researchAiTypeAlert",
};

export const RESEARCH_PARTICIPANT_TAG_KEYS: Record<string, TranslationKey> = {
  FOUNDING: "researchParticipantTagFounding",
  VIP: "researchParticipantTagVip",
  ACTIVE: "researchParticipantTagActive",
  NEW: "researchParticipantTagNew",
};

export const RESEARCH_TIER_KEYS: Record<string, TranslationKey> = {
  PLATINUM: "researchTierPlatinum",
  GOLD: "researchTierGold",
  SILVER: "researchTierSilver",
  BRONZE: "researchTierBronze",
};

export const RESEARCH_SURVEY_QUESTION_TYPE_KEYS: Record<string, TranslationKey> = {
  TEXT: "researchQuestionTypeText",
  MULTIPLE_CHOICE: "researchQuestionTypeMultipleChoice",
  SINGLE_CHOICE: "researchQuestionTypeSingleChoice",
  RATING: "researchQuestionTypeRating",
  YES_NO: "researchQuestionTypeYesNo",
};
