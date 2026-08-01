import { z } from 'zod';

const warehouseStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CLOSED']);
const transactionTypeEnum = z.enum(['RECEIVED', 'SHIPPED', 'ADJUSTED', 'RESERVED', 'UNRESERVED', 'RETURNED', 'TRANSFERRED_IN', 'TRANSFERRED_OUT', 'DAMAGED', 'EXPIRED']);
const importStatusEnum = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'PARTIALLY_COMPLETED', 'FAILED']);

export const createWarehouseSchema = z.object({
  supplierId: z.string().min(1),
  name: z.string().min(1),
  nameAr: z.string().optional(),
  address: z.string().min(1),
  cityId: z.string().optional(),
  countryId: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z.string().optional(),
  managerName: z.string().optional(),
  isPrimary: z.boolean().optional().default(false),
});

export const updateWarehouseSchema = createWarehouseSchema.partial().omit({ supplierId: true });

export const warehouseListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  supplierId: z.string().optional(),
  status: warehouseStatusEnum.optional(),
  isPrimary: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export const createStockItemSchema = z.object({
  warehouseId: z.string().min(1),
  offeringId: z.string().min(1),
  physicalQty: z.number().nonnegative().default(0),
  reservedQty: z.number().nonnegative().default(0),
  availableQty: z.number().nonnegative().default(0),
  damagedQty: z.number().nonnegative().default(0),
  minStockLevel: z.number().nonnegative().default(0),
  reorderPoint: z.number().nonnegative().default(0),
  maxStockQty: z.number().positive().optional(),
  unitCost: z.number().positive().optional(),
  currency: z.string().optional().default('SAR'),
  batch: z.string().optional(),
  lotNumber: z.string().optional(),
  expiryDate: z.string().datetime().optional(),
});

export const updateStockItemSchema = createStockItemSchema.partial().omit({ warehouseId: true, offeringId: true });

export const stockItemListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  warehouseId: z.string().optional(),
  offeringId: z.string().optional(),
  lowStock: z.coerce.boolean().optional(),
  expiryDateBefore: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const adjustStockSchema = z.object({
  quantity: z.number(),
  reason: z.string().min(1),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
});

export const transferStockSchema = z.object({
  fromWarehouseId: z.string().min(1),
  toWarehouseId: z.string().min(1),
  offeringId: z.string().min(1),
  quantity: z.number().positive(),
  notes: z.string().optional(),
});

export const createTransactionSchema = z.object({
  stockItemId: z.string().min(1),
  type: transactionTypeEnum,
  quantity: z.number(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});

export const transactionListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  stockItemId: z.string().optional(),
  type: transactionTypeEnum.optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const createImportSchema = z.object({
  supplierId: z.string().min(1),
  fileName: z.string().min(1),
  fileUrl: z.string().min(1),
  format: z.string().optional().default('xlsx'),
});

export const updateImportStatusSchema = z.object({
  status: importStatusEnum,
  totalRows: z.number().int().nonnegative().optional(),
  successRows: z.number().int().nonnegative().optional(),
  errorRows: z.number().int().nonnegative().optional(),
  errors: z.any().optional(),
});

export const importListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  supplierId: z.string().optional(),
  status: importStatusEnum.optional(),
});

export const stockLevelQuerySchema = z.object({
  warehouseId: z.string().optional(),
  offeringId: z.string().optional(),
  lowStock: z.coerce.boolean().optional(),
});

export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>;
export type WarehouseListQuery = z.infer<typeof warehouseListQuerySchema>;
export type CreateStockItemInput = z.infer<typeof createStockItemSchema>;
export type UpdateStockItemInput = z.infer<typeof updateStockItemSchema>;
export type StockItemListQuery = z.infer<typeof stockItemListQuerySchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type TransferStockInput = z.infer<typeof transferStockSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type TransactionListQuery = z.infer<typeof transactionListQuerySchema>;
export type CreateImportInput = z.infer<typeof createImportSchema>;
export type UpdateImportStatusInput = z.infer<typeof updateImportStatusSchema>;
export type ImportListQuery = z.infer<typeof importListQuerySchema>;
export type StockLevelQuery = z.infer<typeof stockLevelQuerySchema>;
