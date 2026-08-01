import { z } from 'zod';

export const createPOItemSchema = z.object({
  materialName: z.string().min(1, 'Material name is required'),
  description: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  totalPrice: z.number().nonnegative('Total price must be non-negative'),
});

export const createPOSchema = z.object({
  poNumber: z.string().min(1, 'PO number is required'),
  quotationId: z.string().optional(),
  awardId: z.string().optional(),
  projectId: z.string().optional(),
  organizationId: z.string().optional(),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  expectedDelivery: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(createPOItemSchema).min(1, 'At least one item is required'),
});

export const updatePOSchema = z.object({
  expectedDelivery: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
});

export const poListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  supplierId: z.string().optional(),
  projectId: z.string().optional(),
  sort: z.string().optional(),
});

export type CreatePOInput = z.infer<typeof createPOSchema>;
export type UpdatePOInput = z.infer<typeof updatePOSchema>;
export type POListQuery = z.infer<typeof poListQuerySchema>;
