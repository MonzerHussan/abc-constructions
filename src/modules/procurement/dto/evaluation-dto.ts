export interface CriterionDTO {
  id: string;
  name: string;
  description: string | null;
  maxScore: number;
  weight: number;
  orderIndex: number;
}

export interface ScoreDTO {
  id: string;
  criterionId: string;
  criterionName: string;
  maxScore: number;
  score: number;
  comment: string | null;
}

export interface QuotationEvaluationDTO {
  id: string;
  quotationId: string;
  evaluatorId: string;
  evaluatorName: string;
  status: string;
  totalScore: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  scores: ScoreDTO[];
  quotationRef: string;
  supplierName: string;
}

export interface EvaluationSummaryDTO {
  id: string;
  quotationId: string;
  status: string;
  totalScore: number | null;
  evaluatorName: string;
  supplierName: string;
  quotationRef: string;
  scoreCount: number;
  createdAt: string;
}

export interface ApprovalRequestDTO {
  id: string;
  quotationEvaluationId: string;
  status: string;
  notes: string | null;
  requestedByName: string;
  history: ApprovalHistoryDTO[];
  createdAt: string;
}

export interface ApprovalHistoryDTO {
  id: string;
  action: string;
  comment: string | null;
  actionByName: string;
  createdAt: string;
}

export interface StartEvaluationDTO {
  id: string;
  quotationId: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface CompleteEvaluationDTO {
  id: string;
  quotationId: string;
  status: string;
  totalScore: number | null;
  scoreCount: number;
  updatedAt: string;
}
