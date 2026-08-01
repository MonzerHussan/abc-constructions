export interface CreateRFQDTO {
  title: string;
  description?: string;
  referenceNumber: string;
  purchaseRequestId?: string;
  projectId?: string;
  organizationId?: string;
  deadlineDate: string;
  deliveryDate?: string;
  deliveryLocation?: string;
  termsAndConditions?: string;
  attachments?: string[];
  items: CreateRFQItemDTO[];
  supplierIds?: string[];
}

export interface CreateRFQItemDTO {
  materialName: string;
  description?: string;
  quantity: number;
  unit: string;
  specifications?: string;
}

export interface UpdateRFQDTO {
  title?: string;
  description?: string;
  referenceNumber?: string;
  projectId?: string;
  deadlineDate?: string;
  deliveryDate?: string;
  deliveryLocation?: string;
  termsAndConditions?: string;
  attachments?: string[];
  items?: CreateRFQItemDTO[];
}

export interface InviteSupplierDTO {
  supplierId: string;
}

export interface RFQSummaryDTO {
  id: string;
  title: string;
  referenceNumber: string;
  status: string;
  deadlineDate: string;
  createdAt: string;
  createdBy: { id: string; name: string | null; companyName: string | null } | null;
  itemsCount: number;
  suppliersCount: number;
  quotationsCount: number;
}

export interface RFQDetailDTO {
  id: string;
  title: string;
  description: string | null;
  referenceNumber: string;
  status: string;
  purchaseRequestId: string | null;
  projectId: string | null;
  organizationId: string | null;
  issueDate: string | null;
  deadlineDate: string;
  deliveryDate: string | null;
  deliveryLocation: string | null;
  termsAndConditions: string | null;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string | null; email: string | null; companyName: string | null } | null;
  project: { id: string; name: string } | null;
  purchaseRequest: { id: string; title: string; referenceNumber: string } | null;
  items: RFQItemDTO[];
  suppliers: RFQSupplierDTO[];
  quotations: { id: string; supplierName: string | null; totalAmount: number; status: string }[];
  evaluations: { id: string; evaluatorName: string | null; status: string }[];
  awards: { id: string; supplierName: string | null; totalAmount: number }[];
  _count: { quotations: number; suppliers: number };
}

export interface RFQItemDTO {
  id: string;
  materialName: string;
  description: string | null;
  quantity: number;
  unit: string;
  specifications: string | null;
}

export interface RFQSupplierDTO {
  id: string;
  supplierId: string;
  supplierName: string | null;
  companyName: string | null;
  invitedAt: string;
  responded: boolean;
  respondedAt: string | null;
}
