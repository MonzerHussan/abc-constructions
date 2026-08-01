import type { PaymentStatus } from '@/modules/financial/workflow/state-machines/FinancialTrustStateMachine';

export interface PaymentReleaseDTO {
  id: string;
  reservationId: string;
  amount: number;
  type: string;
  notes: string | null;
  releasedById: string;
  releasedAt: string;
  createdAt: string;
}

export interface ReservationSummaryDTO {
  id: string;
  reservationNumber: string;
  purchaseOrderId: string;
  supplierId: string;
  totalAmount: number;
  heldAmount: number;
  releasedAmount: number;
  currency: string;
  status: PaymentStatus;
  notes: string | null;
  createdAt: string;
}

export interface ReservationDetailDTO {
  id: string;
  reservationNumber: string;
  purchaseOrderId: string;
  supplierId: string;
  buyerId: string;
  totalAmount: number;
  heldAmount: number;
  releasedAmount: number;
  currency: string;
  status: PaymentStatus;
  notes: string | null;
  releases: PaymentReleaseDTO[];
  createdAt: string;
  updatedAt: string;
}
