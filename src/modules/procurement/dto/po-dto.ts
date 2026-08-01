export interface POItemDTO {
  id: string;
  materialName: string;
  description: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  deliveredQuantity: number;
  balanceQuantity: number;
}

export interface POSummaryDTO {
  id: string;
  poNumber: string;
  status: string;
  totalAmount: number;
  supplierName: string;
  supplierCompanyName: string | null;
  itemCount: number;
  orderDate: string;
  expectedDelivery: string | null;
}

export interface PODetailDTO {
  id: string;
  poNumber: string;
  quotationId: string | null;
  awardId: string | null;
  projectId: string | null;
  supplierId: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  orderDate: string;
  expectedDelivery: string | null;
  deliveryDate: string | null;
  deliveryAddress: string | null;
  deliveryInstructions: string | null;
  paymentTerms: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  supplier: {
    id: string;
    name: string;
    companyName: string | null;
  };
  items: POItemDTO[];
}

export interface CreatePODTO {
  id: string;
  poNumber: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}
