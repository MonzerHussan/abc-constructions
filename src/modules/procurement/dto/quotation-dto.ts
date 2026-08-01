export interface QuotationItemDTO {
  id: string;
  rfqItemId: string | null;
  materialName: string;
  description: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface QuotationSummaryDTO {
  id: string;
  rfqId: string;
  referenceNumber: string;
  status: string;
  totalAmount: number;
  grandTotal: number;
  currency: string;
  supplierName: string;
  supplierCompanyName: string | null;
  itemCount: number;
  submittedAt: string | null;
  createdAt: string;
}

export interface QuotationDetailDTO {
  id: string;
  rfqId: string;
  supplierId: string;
  referenceNumber: string;
  status: string;
  coverLetter: string | null;
  deliveryTime: string | null;
  validUntil: string | null;
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
  notes: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  supplier: {
    id: string;
    name: string;
    companyName: string | null;
  };
  items: QuotationItemDTO[];
}

export interface CreateQuotationDTO {
  id: string;
  rfqId: string;
  referenceNumber: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
  itemCount: number;
  createdAt: string;
}

export interface UpdateQuotationDTO {
  id: string;
  referenceNumber: string;
  status: string;
  totalAmount: number;
  grandTotal: number;
  currency: string;
  updatedAt: string;
}
