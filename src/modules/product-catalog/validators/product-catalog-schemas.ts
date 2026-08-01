import { z } from 'zod';

// === ProductMaster ===
export const createProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  nameAr: z.string().optional(),
  nameUr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionUr: z.string().optional(),
  manufacturerId: z.string().min(1),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  unitId: z.string().optional(),
  barcode: z.string().optional(),
  gtin: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial().omit({ manufacturerId: true, sku: true });

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  manufacturerId: z.string().optional(),
  brandId: z.string().optional(),
  search: z.string().optional(),
});

// === Variant ===
export const createVariantSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  attributes: z.any().optional(),
  price: z.number().positive().optional(),
});

export const updateVariantSchema = z.object({
  name: z.string().optional(),
  barcode: z.string().optional(),
  attributes: z.any().optional(),
  price: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

// === Specification ===
export const addSpecificationSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional(),
  value: z.string().min(1),
  valueAr: z.string().optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export const updateSpecificationSchema = addSpecificationSchema.partial();

// === Data Sheet ===
export const uploadDataSheetSchema = z.object({
  title: z.string().min(1),
  fileUrl: z.string().min(1),
  language: z.string().optional().default('en'),
});

// === Safety Sheet ===
export const uploadSafetySheetSchema = z.object({
  title: z.string().min(1),
  fileUrl: z.string().min(1),
  language: z.string().optional().default('en'),
});

// === Image ===
export const uploadImageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isPrimary: z.boolean().optional().default(false),
});

// === Offering ===
export const createOfferingSchema = z.object({
  productId: z.string().min(1),
  supplierId: z.string().min(1),
  supplierSku: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().optional().default('SAR'),
  taxRate: z.number().min(0).optional().default(0),
  contractPrice: z.number().positive().optional(),
  contractMinQty: z.number().positive().optional(),
  tierPricing: z.array(z.object({
    minQty: z.number().positive(),
    price: z.number().positive(),
  })).optional(),
  minOrderQty: z.number().positive().optional().default(1),
  maxOrderQty: z.number().positive().optional(),
  packSize: z.number().positive().optional(),
  moqUnit: z.string().optional(),
  leadTimeDays: z.number().int().positive().optional(),
  availability: z.enum(['IN_STOCK', 'MADE_TO_ORDER', 'PRE_ORDER', 'DISCONTINUED']).optional().default('IN_STOCK'),
  deliveryTerms: z.array(z.enum(['EXW', 'FOB', 'CIF', 'CFR', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'])).optional(),
  deliveryTimeDays: z.number().int().positive().optional(),
  shippingCost: z.number().positive().optional(),
  isAuthorized: z.boolean().optional().default(false),
  authorizationDoc: z.string().optional(),
  warrantyPeriod: z.number().int().positive().optional(),
  returnPolicy: z.string().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateOfferingSchema = createOfferingSchema.partial().omit({ productId: true, supplierId: true });

export const offeringListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  productId: z.string().optional(),
  supplierId: z.string().optional(),
  status: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  availability: z.string().optional(),
});

// === UnitOfMeasure ===
export const createUnitSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional(),
  symbol: z.string().min(1),
  category: z.string().min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type AddSpecificationInput = z.infer<typeof addSpecificationSchema>;
export type UpdateSpecificationInput = z.infer<typeof updateSpecificationSchema>;
export type UploadDataSheetInput = z.infer<typeof uploadDataSheetSchema>;
export type UploadSafetySheetInput = z.infer<typeof uploadSafetySheetSchema>;
export type UploadImageInput = z.infer<typeof uploadImageSchema>;
export type CreateOfferingInput = z.infer<typeof createOfferingSchema>;
export type UpdateOfferingInput = z.infer<typeof updateOfferingSchema>;
export type OfferingListQuery = z.infer<typeof offeringListQuerySchema>;
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
