import { z } from 'zod';

export const createRFQItemSchema = z.object({
  materialName: z.string().min(1, 'Material name is required'),
  description: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  specifications: z.string().optional(),
});

export const createRFQSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  purchaseRequestId: z.string().optional(),
  projectId: z.string().optional(),
  organizationId: z.string().optional(),
  deadlineDate: z.string().min(1, 'Deadline date is required'),
  deliveryDate: z.string().optional(),
  deliveryLocation: z.string().optional(),
  termsAndConditions: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  items: z.array(createRFQItemSchema).min(1, 'At least one item is required'),
  supplierIds: z.array(z.string()).optional(),
});

export const updateRFQSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  referenceNumber: z.string().optional(),
  projectId: z.string().optional(),
  deadlineDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  deliveryLocation: z.string().optional(),
  termsAndConditions: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  items: z.array(createRFQItemSchema).optional(),
});

export const inviteSupplierSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
});

export const rfqListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  projectId: z.string().optional(),
  createdById: z.string().optional(),
  sort: z.string().optional(),
});

export type CreateRFQInput = z.infer<typeof createRFQSchema>;
export type UpdateRFQInput = z.infer<typeof updateRFQSchema>;
export type InviteSupplierInput = z.infer<typeof inviteSupplierSchema>;
export type RFQListQuery = z.infer<typeof rfqListQuerySchema>;
