import { z } from 'zod';
import { PRStatus, PRPriority } from '@/generated/prisma/client';

const prItemSchema = z.object({
  materialName: z.string().min(1, 'Material name is required'),
  description: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  estimatedPrice: z.number().positive().optional(),
  total: z.number().positive().optional(),
});

export const createPRSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(300),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  priority: z.nativeEnum(PRPriority).default('MEDIUM'),
  projectId: z.string().optional(),
  organizationId: z.string().optional(),
  expectedDelivery: z.string().datetime().optional(),
  deliveryLocation: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(prItemSchema).min(1, 'At least one item is required'),
});

export const updatePRSchema = z.object({
  title: z.string().min(2).max(300).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.nativeEnum(PRPriority).optional(),
  status: z.nativeEnum(PRStatus).optional(),
  projectId: z.string().optional(),
  expectedDelivery: z.string().datetime().optional().nullable(),
  deliveryLocation: z.string().optional(),
  notes: z.string().optional(),
});

export const approvePRSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional(),
});

export const prListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(PRStatus).optional(),
  category: z.string().optional(),
  organizationId: z.string().optional(),
  requestedById: z.string().optional(),
  sort: z.string().optional(),
});

export type CreatePRInput = z.infer<typeof createPRSchema>;
export type UpdatePRInput = z.infer<typeof updatePRSchema>;
export type ApprovePRInput = z.infer<typeof approvePRSchema>;
export type PRListQuery = z.infer<typeof prListQuerySchema>;
