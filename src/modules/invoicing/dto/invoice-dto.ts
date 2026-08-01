export interface InvoiceItemDTO {
  id: string;
  invoiceId: string;
  poItemId: string | null;
  deliveryItemId: string | null;
  description: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
}

export interface InvoiceDTO {
  id: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  supplierId: string;
  buyerId: string | null;
  status: string;
  invoiceDate: string;
  dueDate: string | null;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  attachment: string | null;
  notes: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  matchedAt: string | null;
  authorizedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItemDTO[];
  matches: InvoiceMatchDTO[];
}

export interface InvoiceMatchDTO {
  id: string;
  invoiceId: string;
  referenceType: string;
  referenceId: string;
  status: string;
  poQuantity: number | null;
  deliveryQuantity: number | null;
  acceptedQuantity: number | null;
  invoiceQuantity: number | null;
  poAmount: number | null;
  deliveryAmount: number | null;
  invoiceAmount: number | null;
  varianceQuantity: number | null;
  varianceAmount: number | null;
  notes: string | null;
  matchedAt: string | null;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}