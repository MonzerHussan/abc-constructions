import { z } from 'zod';

export const createInvoiceSchema = z.object({
  purchaseOrderId: z.string().min(1, 'Purchase order ID is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  invoiceDate: z.string().optional(),
  dueDate: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  taxAmount: z.number().min(0).default(0),
  totalAmount: z.number().positive('Total amount must be positive'),
  notes: z.string().optional(),
  items: z.array(z.object({
    poItemId: z.string().min(1, 'PO item ID is required'),
    description: z.string().optional(),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    totalPrice: z.number().positive('Total price must be positive'),
    taxRate: z.number().min(0).default(0),
  })).min(1, 'At least one item is required'),
});

export const updateInvoiceSchema = z.object({
  amount: z.number().positive().optional(),
  taxAmount: z.number().min(0).optional(),
  totalAmount: z.number().positive().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    poItemId: z.string().min(1),
    description: z.string().optional(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive(),
    taxRate: z.number().min(0).default(0),
  })).optional(),
});

export const invoiceListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  purchaseOrderId: z.string().optional(),
  supplierId: z.string().optional(),
});

export const rejectInvoiceSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});

export const matchInvoiceSchema = z.object({
  referenceType: z.enum(['PO', 'DELIVERY', 'INSPECTION']),
  referenceId: z.string().min(1),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceListQuery = z.infer<typeof invoiceListQuerySchema>;
export type RejectInvoiceInput = z.infer<typeof rejectInvoiceSchema>;
export type MatchInvoiceInput = z.infer<typeof matchInvoiceSchema>;