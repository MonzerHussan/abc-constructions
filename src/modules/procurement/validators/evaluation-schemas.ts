import { z } from 'zod';

export const criterionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  maxScore: z.number().positive('Max score must be positive'),
  weight: z.number().min(0).max(100).optional().default(1),
  orderIndex: z.number().int().nonnegative().optional().default(0),
});

export const createCriteriaSchema = z.object({
  rfqId: z.string().optional(),
  criteria: z.array(criterionSchema).min(1, 'At least one criterion is required'),
});

export const updateCriterionSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  maxScore: z.number().positive().optional(),
  weight: z.number().min(0).max(100).optional(),
  orderIndex: z.number().int().nonnegative().optional(),
});

export const scoreInputSchema = z.object({
  criterionId: z.string().min(1, 'Criterion ID is required'),
  score: z.number().nonnegative('Score must be non-negative'),
  comment: z.string().optional(),
});

export const startEvaluationSchema = z.object({
  quotationId: z.string().min(1, 'Quotation ID is required'),
  note: z.string().optional(),
});

export const submitScoresSchema = z.object({
  scores: z.array(scoreInputSchema).min(1, 'At least one score is required'),
  notes: z.string().optional(),
});

export const completeEvaluationSchema = z.object({
  notes: z.string().optional(),
});

export const evaluationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.string().optional(),
  quotationId: z.string().optional(),
  evaluatorId: z.string().optional(),
  rfqId: z.string().optional(),
  sort: z.string().optional(),
});

export const createApprovalSchema = z.object({
  notes: z.string().optional(),
});

export const approveDecisionSchema = z.object({
  action: z.enum(['APPROVED', 'REJECTED']),
  comment: z.string().optional(),
});

export type CreateCriteriaInput = z.infer<typeof createCriteriaSchema>;
export type UpdateCriterionInput = z.infer<typeof updateCriterionSchema>;
export type ScoreInput = z.infer<typeof scoreInputSchema>;
export type StartEvaluationInput = z.infer<typeof startEvaluationSchema>;
export type SubmitScoresInput = z.infer<typeof submitScoresSchema>;
export type CompleteEvaluationInput = z.infer<typeof completeEvaluationSchema>;
export type EvaluationListQuery = z.infer<typeof evaluationListQuerySchema>;
export type CreateApprovalInput = z.infer<typeof createApprovalSchema>;
export type ApproveDecisionInput = z.infer<typeof approveDecisionSchema>;
