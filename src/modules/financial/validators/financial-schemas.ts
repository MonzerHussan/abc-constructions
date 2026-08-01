import { z } from 'zod';

export const createReservationSchema = z.object({
  purchaseOrderId: z.string().min(1, 'Purchase order ID is required'),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  totalAmount: z.number().positive('Amount must be positive'),
  currency: z.string().optional().default('SAR'),
  notes: z.string().optional(),
});

export const holdReservationSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
});

export const releaseFundsSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
});

export const refundFundsSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
});

export const cancelReservationSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});

export const reservationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  purchaseOrderId: z.string().optional(),
  supplierId: z.string().optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type HoldReservationInput = z.infer<typeof holdReservationSchema>;
export type ReleaseFundsInput = z.infer<typeof releaseFundsSchema>;
export type RefundFundsInput = z.infer<typeof refundFundsSchema>;
export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;
export type ReservationListQuery = z.infer<typeof reservationListQuerySchema>;
