import { z } from 'zod';

export const createQuotationItemSchema = z.object({
  rfqItemId: z.string().optional(),
  materialName: z.string().min(1, 'Material name is required'),
  description: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  totalPrice: z.number().nonnegative('Total price must be non-negative'),
});

export const createQuotationSchema = z.object({
  rfqId: z.string().min(1, 'RFQ ID is required'),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  coverLetter: z.string().optional(),
  deliveryTime: z.string().optional(),
  validUntil: z.string().optional(),
  currency: z.string().optional().default('SAR'),
  notes: z.string().optional(),
  items: z.array(createQuotationItemSchema).min(1, 'At least one item is required'),
});

export const updateQuotationSchema = z.object({
  referenceNumber: z.string().optional(),
  coverLetter: z.string().optional(),
  deliveryTime: z.string().optional(),
  validUntil: z.string().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(createQuotationItemSchema).optional(),
});

export const quotationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  rfqId: z.string().optional(),
  supplierId: z.string().optional(),
  sort: z.string().optional(),
});

export const acceptQuotationSchema = z.object({
  notes: z.string().optional(),
});

export const rejectQuotationSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;
export type QuotationListQuery = z.infer<typeof quotationListQuerySchema>;
export type AcceptQuotationInput = z.infer<typeof acceptQuotationSchema>;
export type RejectQuotationInput = z.infer<typeof rejectQuotationSchema>;
