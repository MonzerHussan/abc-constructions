import type { InspectionStatus } from '@/modules/quality/workflow/state-machines/QualityStateMachine';

export interface InspectionItemDTO {
  id: string;
  inspectionId: string;
  deliveryItemId: string | null;
  poItemId: string;
  specification: string;
  expectedValue: string | null;
  actualValue: string | null;
  result: string | null;
  remarks: string | null;
  createdAt: string;
}

export interface InspectionAttachmentDTO {
  id: string;
  inspectionId: string;
  type: string;
  url: string;
  fileName: string;
  uploadedById: string;
  createdAt: string;
}

export interface NCRDTO {
  id: string;
  ncrNumber: string;
  inspectionId: string;
  severity: string;
  category: string;
  description: string;
  correctiveAction: string | null;
  dueDate: string | null;
  status: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcceptanceCertificateDTO {
  id: string;
  certificateNumber: string;
  inspectionId: string;
  acceptedById: string;
  acceptedByName: string;
  acceptedAt: string;
  remarks: string | null;
  createdAt: string;
}

export interface InspectionSummaryDTO {
  id: string;
  inspectionNumber: string;
  type: string;
  status: InspectionStatus;
  referenceType: string;
  referenceId: string;
  inspectorId: string;
  itemCount: number;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface InspectionDetailDTO {
  id: string;
  inspectionNumber: string;
  type: string;
  status: InspectionStatus;
  referenceType: string;
  referenceId: string;
  inspectorId: string;
  inspectorName: string;
  scheduledAt: string | null;
  completedAt: string | null;
  notes: string | null;
  items: InspectionItemDTO[];
  attachments: InspectionAttachmentDTO[];
  ncrs: NCRDTO[];
  certificates: AcceptanceCertificateDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInspectionDTO {
  type: string;
  referenceType: string;
  referenceId: string;
  inspectorId: string;
  scheduledAt?: string;
  notes?: string;
  items?: { poItemId: string; specification: string; expectedValue?: string; remarks?: string }[];
}
