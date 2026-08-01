import { z } from 'zod';

// === Product Discovery ===
export const marketplaceSearchQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  brandId: z.string().optional(),
  manufacturerId: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  currency: z.string().optional(),
  verificationLevel: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  inStockOnly: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  maxLeadTimeDays: z.coerce.number().int().positive().optional(),
  isAuthorizedOnly: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  supplierId: z.string().optional(),
  sortBy: z.string().optional().default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const categoryNavigationQuerySchema = z.object({
  includeCounts: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  onlyActive: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
});

// === Comparison ===
export const compareProductsSchema = z.object({
  productIds: z.array(z.string().min(1)).min(2).max(4),
});

export const compareProductsQuerySchema = z.object({
  productIds: z
    .string()
    .min(1)
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),
});

export const compareSuppliersQuerySchema = z.object({
  productId: z.string().min(1),
  supplierIds: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined)),
});

// === Favorites ===
export const addFavoriteProductSchema = z.object({
  productId: z.string().min(1),
});

export const addFavoriteSupplierSchema = z.object({
  supplierId: z.string().min(1),
});

export const favoriteListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// === Reviews ===
export const createProductReviewSchema = z.object({
  productId: z.string().min(1),
  offeringId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
  images: z.array(z.string()).optional(),
}).strict();

export const updateProductReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().optional(),
  comment: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const createSupplierReviewSchema = z.object({
  supplierId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
});

export const updateSupplierReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().optional(),
  comment: z.string().optional(),
});

export const reviewListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// === RFQ Gateway ===
export const createRfqFromMarketplaceSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().optional(),
  deadlineDate: z.string().min(1),
  deliveryDate: z.string().optional(),
  deliveryLocation: z.string().optional(),
  organizationId: z.string().optional(),
  projectId: z.string().optional(),
  notes: z.string().optional(),
  supplierIds: z.array(z.string().min(1)).optional(),
  autoMatchSuppliers: z.boolean().optional().default(true),
});

export const supplierMatchQuerySchema = z.object({
  productId: z.string().min(1),
  limit: z.coerce.number().int().positive().max(20).default(5),
});

// === Types ===
export type MarketplaceSearchQuery = z.infer<typeof marketplaceSearchQuerySchema>;
export type CategoryNavigationQuery = z.infer<typeof categoryNavigationQuerySchema>;
export type CompareProductsInput = z.infer<typeof compareProductsSchema>;
export type AddFavoriteProductInput = z.infer<typeof addFavoriteProductSchema>;
export type AddFavoriteSupplierInput = z.infer<typeof addFavoriteSupplierSchema>;
export type FavoriteListQuery = z.infer<typeof favoriteListQuerySchema>;
export type CreateProductReviewInput = z.infer<typeof createProductReviewSchema>;
export type UpdateProductReviewInput = z.infer<typeof updateProductReviewSchema>;
export type CreateSupplierReviewInput = z.infer<typeof createSupplierReviewSchema>;
export type UpdateSupplierReviewInput = z.infer<typeof updateSupplierReviewSchema>;
export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>;
export type CreateRfqFromMarketplaceInput = z.infer<typeof createRfqFromMarketplaceSchema>;
export type SupplierMatchQuery = z.infer<typeof supplierMatchQuerySchema>;
