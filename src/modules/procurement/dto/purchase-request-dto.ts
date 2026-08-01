export interface PRItemDTO {
  id: string;
  materialName: string;
  description: string | null;
  quantity: number;
  unit: string;
  estimatedPrice: number | null;
  total: number | null;
}

export interface PRSummaryDTO {
  id: string;
  title: string;
  status: string;
  category: string;
  priority: string;
  createdAt: Date;
  requestedBy: { id: string; name: string | null; companyName: string | null } | null;
  items: PRItemDTO[];
  _count: { items: number };
}

export interface PRDetailDTO {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  expectedDelivery: Date | null;
  deliveryLocation: string | null;
  notes: string | null;
  projectId: string | null;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  requestedBy: { id: string; name: string | null; email: string | null; companyName: string | null } | null;
  approvedBy: { id: string; name: string | null } | null;
  project: { id: string; name: string; nameAr: string | null } | null;
  items: PRItemDTO[];
}
