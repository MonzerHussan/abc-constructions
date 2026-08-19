export interface DocumentTypeOption {
  id: "commercialRegistration" | "nationalId" | "vatCertificate" | "license" | "other";
  key: string;
}

export const documentTypeOptions: DocumentTypeOption[] = [
  { id: "commercialRegistration", key: "obDocCommercialRegistration" },
  { id: "nationalId", key: "obDocNationalId" },
  { id: "vatCertificate", key: "obDocVatCertificate" },
  { id: "license", key: "obDocLicense" },
  { id: "other", key: "obDocOther" },
];

export interface LookingForOption {
  id: string;
  key: string;
}

export const lookingForOptions: LookingForOption[] = [
  { id: "materials", key: "obLookingMaterials" },
  { id: "contractors", key: "obLookingContractors" },
  { id: "suppliers", key: "obLookingSuppliers" },
  { id: "workers", key: "obLookingWorkers" },
  { id: "tenders", key: "obLookingTenders" },
  { id: "consultants", key: "obLookingConsultants" },
  { id: "financing", key: "obLookingFinancing" },
  { id: "delivery", key: "obLookingDelivery" },
];

export interface BudgetRangeOption {
  id: "small" | "medium" | "large" | "enterprise";
  key: string;
}

export const budgetRangeOptions: BudgetRangeOption[] = [
  { id: "small", key: "obBudgetSmall" },
  { id: "medium", key: "obBudgetMedium" },
  { id: "large", key: "obBudgetLarge" },
  { id: "enterprise", key: "obBudgetEnterprise" },
];

export interface HasProjectsOption {
  id: "yes" | "no" | "soon";
  key: string;
}

export const hasProjectsOptions: HasProjectsOption[] = [
  { id: "yes", key: "obProjectsYes" },
  { id: "no", key: "obProjectsNo" },
  { id: "soon", key: "obProjectsSoon" },
];

export interface UrgencyOption {
  id: "immediate" | "3months" | "6months" | "future";
  key: string;
}

export const urgencyOptions: UrgencyOption[] = [
  { id: "immediate", key: "obUrgencyImmediate" },
  { id: "3months", key: "obUrgency3Months" },
  { id: "6months", key: "obUrgency6Months" },
  { id: "future", key: "obUrgencyFuture" },
];

export const locationOptions = [
  { id: "riyadh", key: "locRiyadh" },
  { id: "jeddah", key: "locJeddah" },
  { id: "dammam", key: "locDammam" },
  { id: "makkah", key: "locMakkah" },
  { id: "madinah", key: "locMadinah" },
  { id: "khobar", key: "locKhobar" },
  { id: "tabuk", key: "locTabuk" },
  { id: "abha", key: "locAbha" },
];
