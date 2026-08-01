import { z } from 'zod';
import type { DeliveryStatus } from '@/modules/procurement/workflow/state-machines/DeliveryStateMachine';

export const createDeliveryItemSchema = z.object({
  poItemId: z.string().min(1, 'PO item ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
  notes: z.string().optional(),
});

export const createDeliverySchema = z.object({
  purchaseOrderId: z.string().min(1, 'Purchase order ID is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  vehicleNumber: z.string().optional(),
  scheduledDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(createDeliveryItemSchema).min(1, 'At least one item is required'),
});

export const updateDeliverySchema = z.object({
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  vehicleNumber: z.string().optional(),
  scheduledDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const deliveryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  supplierId: z.string().optional(),
  purchaseOrderId: z.string().optional(),
  sort: z.string().optional(),
});

export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
export type UpdateDeliveryInput = z.infer<typeof updateDeliverySchema>;
export type CreateDeliveryItemInput = z.infer<typeof createDeliveryItemSchema>;
export type DeliveryListQuery = z.infer<typeof deliveryListQuerySchema>;
