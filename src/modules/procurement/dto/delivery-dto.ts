import type { DeliveryStatus } from '@/modules/procurement/workflow/state-machines/DeliveryStateMachine';

export interface DeliveryItemDTO {
  id: string;
  deliveryId: string;
  poItemId: string;
  quantity: number;
  notes: string | null;
  createdAt: string;
}

export interface DeliverySummaryDTO {
  id: string;
  deliveryNumber: string;
  purchaseOrderId: string;
  supplierId: string;
  status: DeliveryStatus;
  driverName: string | null;
  driverPhone: string | null;
  vehicleNumber: string | null;
  scheduledDate: string | null;
  notes: string | null;
  itemCount: number;
  createdAt: string;
}

export interface DeliveryDetailDTO {
  id: string;
  deliveryNumber: string;
  purchaseOrderId: string;
  supplierId: string;
  supplierName: string;
  supplierCompanyName: string | null;
  status: DeliveryStatus;
  driverName: string | null;
  driverPhone: string | null;
  vehicleNumber: string | null;
  scheduledDate: string | null;
  dispatchedAt: string | null;
  arrivedAt: string | null;
  notes: string | null;
  createdById: string;
  createdByName: string;
  items: DeliveryItemDTO[];
  goodsReceipts: { id: string; receiptNumber: string; status: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryDTO {
  purchaseOrderId: string;
  supplierId: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  scheduledDate?: string;
  notes?: string;
  items: { poItemId: string; quantity: number; notes?: string }[];
}
