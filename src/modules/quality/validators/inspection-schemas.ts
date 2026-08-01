import { z } from 'zod';

export const inspectionItemSchema = z.object({
  deliveryItemId: z.string().optional(),
  poItemId: z.string().min(1, 'PO item ID is required'),
  specification: z.string().min(1, 'Specification is required'),
  expectedValue: z.string().optional(),
  actualValue: z.string().optional(),
  result: z.enum(['PASS', 'FAIL', 'N_A']).optional(),
  remarks: z.string().optional(),
});

export const createInspectionSchema = z.object({
  type: z.string().min(1, 'Inspection type is required'),
  referenceType: z.string().min(1, 'Reference type is required'),
  referenceId: z.string().min(1, 'Reference ID is required'),
  inspectorId: z.string().min(1, 'Inspector ID is required'),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(inspectionItemSchema).optional(),
});

export const updateInspectionSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const inspectionListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  type: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  inspectorId: z.string().optional(),
  sort: z.string().optional(),
});

export const addInspectionItemSchema = z.object({
  deliveryItemId: z.string().optional(),
  poItemId: z.string().min(1, 'PO item ID is required'),
  specification: z.string().min(1, 'Specification is required'),
  expectedValue: z.string().optional(),
  actualValue: z.string().optional(),
  result: z.enum(['PASS', 'FAIL', 'N_A']).optional(),
  remarks: z.string().optional(),
});

export const updateInspectionItemSchema = z.object({
  actualValue: z.string().optional(),
  result: z.enum(['PASS', 'FAIL', 'N_A']),
  remarks: z.string().optional(),
});

export const createNCRSchema = z.object({
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  correctiveAction: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export const createCertificateSchema = z.object({
  remarks: z.string().optional(),
});

export const addAttachmentSchema = z.object({
  type: z.string().min(1, 'Attachment type is required'),
  url: z.string().min(1, 'URL is required'),
  fileName: z.string().min(1, 'File name is required'),
});

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;
export type UpdateInspectionInput = z.infer<typeof updateInspectionSchema>;
export type InspectionListQuery = z.infer<typeof inspectionListQuerySchema>;
export type AddInspectionItemInput = z.infer<typeof addInspectionItemSchema>;
export type UpdateInspectionItemInput = z.infer<typeof updateInspectionItemSchema>;
export type CreateNCRInput = z.infer<typeof createNCRSchema>;
export type CreateCertificateInput = z.infer<typeof createCertificateSchema>;
export type AddAttachmentInput = z.infer<typeof addAttachmentSchema>;
