import { z } from 'zod';

export const workflowTransitionSchema = z.object({
  entityType: z.enum(['RFQ', 'Quotation', 'PO', 'Delivery', 'PurchaseRequest', 'Evaluation', 'Award']),
  entityId: z.string().min(1, 'entityId is required'),
  action: z.string().min(1, 'action is required'),
  reason: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const workflowHistoryQuerySchema = z.object({
  entityType: z.enum(['RFQ', 'Quotation', 'PO', 'Delivery', 'PurchaseRequest', 'Evaluation', 'Award']).optional(),
  entityId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const workflowDefinitionsQuerySchema = z.object({});

export type WorkflowTransitionInput = z.infer<typeof workflowTransitionSchema>;
export type WorkflowHistoryQuery = z.infer<typeof workflowHistoryQuerySchema>;
