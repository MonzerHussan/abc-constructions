import { z } from 'zod';

const supplierTypeEnum = z.enum(['MANUFACTURER','AUTHORIZED_DISTRIBUTOR','WHOLESALER','RETAIL_SUPPLIER','IMPORTER','SERVICE_SUPPLIER','DISTRIBUTOR','DEALER','SUPPLIER','RENTAL_COMPANY','MAINTENANCE_COMPANY','TRADER']);

// === Profile ===
export const createProfileSchema = z.object({
  organizationId: z.string().optional(),
  supplierType: z.array(supplierTypeEnum).min(1),
  companyName: z.string().min(1),
  companyNameAr: z.string().optional(),
  companyNameUr: z.string().optional(),
  commercialLicense: z.string().optional(),
  licenseNumber: z.string().optional(),
  taxNumber: z.string().optional(),
  vatRegistered: z.boolean().optional().default(false),
  yearEstablished: z.number().int().positive().optional(),
  employeeCount: z.number().int().positive().optional(),
  country: z.string().optional(),
  emirate: z.string().optional(),
  city: z.string().optional(),
  countryId: z.string().optional(),
  cityId: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  about: z.string().optional(),
  aboutAr: z.string().optional(),
  aboutUr: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  minOrderValue: z.number().positive().optional(),
  maxDailyCapacity: z.number().positive().optional(),
  leadTimeDays: z.number().int().positive().optional(),
  transportTypes: z.array(z.string()).optional(),
  countriesServed: z.array(z.string()).optional(),
  workingHours: z.string().optional(),
  hasWarehouses: z.boolean().optional(),
  hasBranches: z.boolean().optional(),
});

export const updateProfileSchema = createProfileSchema.partial();

export const profileListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  verificationLevel: z.string().optional(),
  supplierType: z.string().optional(),
  countryId: z.string().optional(),
  cityId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// === Document ===
export const uploadDocumentSchema = z.object({
  supplierId: z.string().min(1),
  docType: z.enum(['TRADE_LICENSE','VAT_CERTIFICATE','COMPANY_LICENSE','TAX_CERTIFICATE','BANK_ACCOUNT_CONFIRMATION','INSURANCE_CERTIFICATE','ISO_CERTIFICATE','ENGINEERING_LICENSE','CONTRACTOR_CLASSIFICATION','AUTHORIZATION_LETTER','PROFESSIONAL_CERT','PORTFOLIO','OTHER']),
  title: z.string().min(1),
  fileName: z.string().min(1),
  fileUrl: z.string().min(1),
  mimeType: z.string().optional(),
  issuedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const verifyDocumentSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  notes: z.string().optional(),
});

// === Certification ===
export const addCertificationSchema = z.object({
  supplierId: z.string().min(1),
  name: z.string().min(1),
  issuingBody: z.string().min(1),
  certificateNumber: z.string().optional(),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime().optional(),
  fileUrl: z.string().optional(),
});

// === Banking ===
export const upsertBankingSchema = z.object({
  supplierId: z.string().min(1),
  bankName: z.string().min(1),
  accountName: z.string().min(1),
  accountNumber: z.string().min(1),
  iban: z.string().min(1),
  swiftCode: z.string().optional(),
  currency: z.string().optional().default('SAR'),
});

// === Capability ===
export const addCapabilitySchema = z.object({
  supplierId: z.string().min(1),
  category: z.string().min(1),
  level: z.enum(['PRIMARY','SECONDARY','SPECIALIZED','EMERGING']).optional().default('SECONDARY'),
  capacityMonthly: z.number().positive().optional(),
  maxProjectValue: z.number().positive().optional(),
  currency: z.string().optional().default('SAR'),
  notes: z.string().optional(),
});

export const updateCapabilitySchema = addCapabilitySchema.partial().omit({ supplierId: true });

// === Relationship ===
export const createRelationshipSchema = z.object({
  buyerOrgId: z.string().min(1),
  supplierProfileId: z.string().min(1),
  relationshipType: z.enum(['PREFERRED','APPROVED','STRATEGIC','PROSPECTIVE','BLACKLISTED']).optional().default('APPROVED'),
  creditLimit: z.number().positive().optional(),
  currency: z.string().optional().default('SAR'),
  paymentTerms: z.string().optional(),
  contractRef: z.string().optional(),
  contractStartDate: z.string().datetime().optional(),
  contractEndDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateRelationshipSchema = z.object({
  relationshipType: z.enum(['PREFERRED','APPROVED','STRATEGIC','PROSPECTIVE','BLACKLISTED']).optional(),
  status: z.enum(['ACTIVE','PENDING','SUSPENDED','TERMINATED']).optional(),
  creditLimit: z.number().positive().optional(),
  paymentTerms: z.string().optional(),
  contractRef: z.string().optional(),
  contractEndDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const relationshipListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  buyerOrgId: z.string().optional(),
  supplierProfileId: z.string().optional(),
  relationshipType: z.string().optional(),
  status: z.string().optional(),
});

// === Rating ===
export const createRatingSchema = z.object({
  supplierProfileId: z.string().min(1),
  organizationId: z.string().min(1),
  purchaseOrderId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  quality: z.number().int().min(1).max(5).optional(),
  delivery: z.number().int().min(1).max(5).optional(),
  communication: z.number().int().min(1).max(5).optional(),
  price: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ProfileListQuery = z.infer<typeof profileListQuerySchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type VerifyDocumentInput = z.infer<typeof verifyDocumentSchema>;
export type AddCertificationInput = z.infer<typeof addCertificationSchema>;
export type UpsertBankingInput = z.infer<typeof upsertBankingSchema>;
export type AddCapabilityInput = z.infer<typeof addCapabilitySchema>;
export type UpdateCapabilityInput = z.infer<typeof updateCapabilitySchema>;
export type CreateRelationshipInput = z.infer<typeof createRelationshipSchema>;
export type UpdateRelationshipInput = z.infer<typeof updateRelationshipSchema>;
export type RelationshipListQuery = z.infer<typeof relationshipListQuerySchema>;
export type CreateRatingInput = z.infer<typeof createRatingSchema>;
