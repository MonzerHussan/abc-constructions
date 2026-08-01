export interface RFQCreatedPayload {
  rfqId: string;
  title: string;
  referenceNumber: string;
  orgId?: string;
  itemsCount: number;
  supplierCount: number;
}

export interface RFQSubmittedPayload {
  rfqId: string;
  submittedBy: string;
  referenceNumber: string;
}

export interface RFQSentPayload {
  rfqId: string;
  referenceNumber: string;
  supplierIds: string[];
  deadlineDate: string;
}

export interface SupplierInvitedPayload {
  rfqId: string;
  referenceNumber: string;
  supplierId: string;
  invitedBy: string;
}

export interface RFQAwardedPayload {
  rfqId: string;
  referenceNumber: string;
  supplierId: string;
  quotationId: string;
  awardedBy: string;
}

export interface RFQClosedPayload {
  rfqId: string;
  referenceNumber: string;
  closedBy: string;
}

export interface RFQCancelledPayload {
  rfqId: string;
  referenceNumber: string;
  cancelledBy: string;
  reason?: string;
}
