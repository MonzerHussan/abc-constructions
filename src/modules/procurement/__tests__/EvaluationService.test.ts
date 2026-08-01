import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    quotationEvaluation: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    evaluationScore: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    evaluationCriterion: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    approvalRequest: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    approvalHistory: {
      create: vi.fn(),
    },
    quotation: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/modules/shared/events/event-bus', () => ({
  eventBus: {
    publish: vi.fn(),
  },
}));

vi.mock('@/modules/shared/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { prisma } from '@/lib/prisma';
import { eventBus } from '@/modules/shared/events/event-bus';
import { EvaluationService } from '@/modules/procurement/services/EvaluationService';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

const service = new EvaluationService();

function mockEvaluation(overrides: Record<string, unknown> = {}) {
  return {
    id: 'eval-1',
    quotationId: 'q-1',
    evaluatorId: 'user-1',
    status: 'PENDING',
    totalScore: null,
    notes: null,
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    evaluator: { id: 'user-1', name: 'Evaluator One', email: 'eval@test.com' },
    quotation: {
      id: 'q-1',
      referenceNumber: 'Q-001',
      totalAmount: 1000,
      grandTotal: 1000,
      currency: 'SAR',
      supplier: { name: 'Supplier A', companyName: 'SupCo' },
      rfq: { createdById: 'buyer-1' },
    },
    scores: [],
    approvalRequest: null,
    ...overrides,
  };
}

function mockCriterion(overrides: Record<string, unknown> = {}) {
  return {
    id: 'crit-1',
    rfqId: null,
    name: 'Price',
    description: null,
    maxScore: 100,
    weight: 50,
    orderIndex: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('EvaluationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated evaluations', async () => {
      const evals = [mockEvaluation(), mockEvaluation({ id: 'eval-2', quotationId: 'q-2' })];
      vi.mocked(prisma.quotationEvaluation.findMany).mockResolvedValue(evals as never);
      vi.mocked(prisma.quotationEvaluation.count).mockResolvedValue(2);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.items[0]).toHaveProperty('id');
      expect(result.items[0]).toHaveProperty('status');
    });

    it('should filter by status', async () => {
      vi.mocked(prisma.quotationEvaluation.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.quotationEvaluation.count).mockResolvedValue(0);

      await service.list({ page: 1, limit: 10, status: 'COMPLETED' });

      expect(prisma.quotationEvaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'COMPLETED' }) }),
      );
    });

    it('should filter by rfqId through quotation relation', async () => {
      vi.mocked(prisma.quotationEvaluation.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.quotationEvaluation.count).mockResolvedValue(0);

      await service.list({ page: 1, limit: 10, rfqId: 'rfq-1' });

      const whereArg = { quotation: { rfqId: 'rfq-1' } };
      expect(prisma.quotationEvaluation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: whereArg }),
      );
    });
  });

  describe('findById', () => {
    it('should return full evaluation detail', async () => {
      const evaluation = mockEvaluation({ status: 'COMPLETED', totalScore: 85 });
      vi.mocked(prisma.quotationEvaluation.findUnique).mockResolvedValue(evaluation as never);

      const result = await service.findById('eval-1');

      expect(result.id).toBe('eval-1');
      expect(result.status).toBe('COMPLETED');
      expect(result.totalScore).toBe(85);
      expect(result.supplierName).toBe('Supplier A');
    });

    it('should throw NOT_FOUND', async () => {
      vi.mocked(prisma.quotationEvaluation.findUnique).mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(ErrorCodes.PROCUREMENT_EVALUATION_NOT_FOUND);
    });
  });

  describe('createCriteria', () => {
    it('should create multiple criteria', async () => {
      vi.mocked(prisma.evaluationCriterion.create).mockResolvedValue(mockCriterion() as never);

      const result = await service.createCriteria({
        criteria: [{ name: 'Price', maxScore: 100, weight: 50, orderIndex: 0 }],
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Price');
    });
  });

  describe('updateCriterion', () => {
    it('should update a criterion', async () => {
      vi.mocked(prisma.evaluationCriterion.findUnique).mockResolvedValue(mockCriterion() as never);
      vi.mocked(prisma.evaluationCriterion.update).mockResolvedValue(mockCriterion({ name: 'Updated Price' }) as never);

      const result = await service.updateCriterion('crit-1', { name: 'Updated Price' });

      expect(result.name).toBe('Updated Price');
    });

    it('should throw NOT_FOUND', async () => {
      vi.mocked(prisma.evaluationCriterion.findUnique).mockResolvedValue(null);

      await expect(service.updateCriterion('missing', { name: 'X' })).rejects.toThrow(ErrorCodes.PROCUREMENT_CRITERION_NOT_FOUND);
    });
  });

  describe('deleteCriterion', () => {
    it('should delete a criterion', async () => {
      vi.mocked(prisma.evaluationCriterion.findUnique).mockResolvedValue(mockCriterion() as never);
      vi.mocked(prisma.evaluationCriterion.delete).mockResolvedValue({} as never);

      await service.deleteCriterion('crit-1');

      expect(prisma.evaluationCriterion.delete).toHaveBeenCalledWith({ where: { id: 'crit-1' } });
    });

    it('should throw NOT_FOUND', async () => {
      vi.mocked(prisma.evaluationCriterion.findUnique).mockResolvedValue(null);

      await expect(service.deleteCriterion('missing')).rejects.toThrow(ErrorCodes.PROCUREMENT_CRITERION_NOT_FOUND);
    });
  });

  describe('listCriteria', () => {
    it('should list all criteria', async () => {
      vi.mocked(prisma.evaluationCriterion.findMany).mockResolvedValue([mockCriterion()] as never);

      const result = await service.listCriteria();

      expect(result).toHaveLength(1);
    });

    it('should filter by rfqId', async () => {
      vi.mocked(prisma.evaluationCriterion.findMany).mockResolvedValue([] as never);

      await service.listCriteria('rfq-1');

      expect(prisma.evaluationCriterion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { OR: [{ rfqId: 'rfq-1' }, { rfqId: null }] } }),
      );
    });
  });

  describe('start', () => {
    it('should start evaluation for a submitted quotation', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({ id: 'q-1', status: 'SUBMITTED', rfqId: 'rfq-1', referenceNumber: 'Q-001', supplierId: 's-1' } as never);
      vi.mocked(prisma.quotationEvaluation.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.quotationEvaluation.create).mockResolvedValue({
        id: 'eval-new',
        quotationId: 'q-1',
        evaluatorId: 'user-1',
        status: 'PENDING',
        notes: null,
        createdAt: new Date(),
        evaluator: { id: 'user-1', name: 'Eval' },
        quotation: { id: 'q-1', referenceNumber: 'Q-001', supplier: { name: 'Sup', companyName: null } },
      } as never);

      const result = await service.start('q-1', 'user-1');

      expect(result.status).toBe('PENDING');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.Evaluation.Started' }),
      );
    });

    it('should throw if quotation not SUBMITTED', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({ id: 'q-1', status: 'DRAFT', rfqId: 'rfq-1', referenceNumber: 'Q-001', supplierId: 's-1' } as never);

      await expect(service.start('q-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION);
    });

    it('should return existing evaluation if already started', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({ id: 'q-1', status: 'SUBMITTED', rfqId: 'rfq-1', referenceNumber: 'Q-001', supplierId: 's-1' } as never);
      vi.mocked(prisma.quotationEvaluation.findFirst).mockResolvedValue({ id: 'eval-existing', quotationId: 'q-1' } as never);
      vi.mocked(prisma.quotationEvaluation.findUnique).mockResolvedValue({
        id: 'eval-existing',
        quotationId: 'q-1',
        evaluatorId: 'user-1',
        evaluator: { id: 'user-1', name: 'Eval', email: 'e@t.com' },
        status: 'PENDING',
        totalScore: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        scores: [],
        quotation: {
          id: 'q-1',
          referenceNumber: 'Q-001',
          totalAmount: 1000,
          grandTotal: 1000,
          currency: 'SAR',
          supplier: { name: 'Sup', companyName: null },
        },
        approvalRequest: null,
      } as never);

      const result = await service.start('q-1', 'user-1');

      expect(result.id).toBe('eval-existing');
    });
  });

  describe('submitScores', () => {
    it('should submit scores and compute weighted total', async () => {
      const existing = mockEvaluation({ scores: [] });
      vi.mocked(prisma.quotationEvaluation.findUnique).mockResolvedValue(existing as never);
      vi.mocked(prisma.evaluationCriterion.findMany).mockResolvedValue([
        { id: 'crit-1', maxScore: 100, weight: 50 },
        { id: 'crit-2', maxScore: 100, weight: 50 },
      ] as never);
      vi.mocked(prisma.evaluationScore.deleteMany).mockResolvedValue({ count: 0 } as never);
      vi.mocked(prisma.evaluationScore.create).mockResolvedValue({} as never);
      vi.mocked(prisma.quotationEvaluation.update).mockResolvedValue({
        ...existing,
        status: 'IN_PROGRESS',
        totalScore: 75,
        scores: [
          { id: 's-1', criterionId: 'crit-1', score: 80, comment: null, criterion: { name: 'Price', maxScore: 100 } },
        ],
      } as never);

      const result = await service.submitScores('eval-1', {
        scores: [
          { criterionId: 'crit-1', score: 80 },
          { criterionId: 'crit-2', score: 70 },
        ],
      }, 'user-1');

      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should throw if score exceeds maxScore', async () => {
      vi.mocked(prisma.quotationEvaluation.findUnique).mockResolvedValue(mockEvaluation() as never);
      vi.mocked(prisma.evaluationCriterion.findMany).mockResolvedValue([{ id: 'crit-1', maxScore: 100, weight: 50 }] as never);

      await expect(service.submitScores('eval-1', { scores: [{ criterionId: 'crit-1', score: 150 }] }, 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_SCORE_EXCEEDS_MAX);
    });

    it('should throw FORBIDDEN if not the evaluator', async () => {
      vi.mocked(prisma.quotationEvaluation.findUnique).mockResolvedValue(mockEvaluation({ evaluatorId: 'other-user' }) as never);

      await expect(service.submitScores('eval-1', { scores: [{ criterionId: 'crit-1', score: 80 }] }, 'user-1')).rejects.toThrow(ErrorCodes.CORE_USER_FORBIDDEN);
    });
  });

  describe('complete', () => {
    it('should mark evaluation as COMPLETED', async () => {
      vi.mocked(prisma.quotationEvaluation.findUnique).mockResolvedValue(mockEvaluation({ status: 'IN_PROGRESS', scores: [{ id: 's-1' }] }) as never);
      vi.mocked(prisma.quotationEvaluation.update).mockResolvedValue(mockEvaluation({ status: 'COMPLETED', totalScore: 85 }) as never);

      const result = await service.complete('eval-1', 'user-1');

      expect(result.status).toBe('COMPLETED');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.Evaluation.Completed' }),
      );
    });

    it('should throw ALREADY_COMPLETED', async () => {
      vi.mocked(prisma.quotationEvaluation.findUnique).mockResolvedValue(mockEvaluation({ status: 'COMPLETED' }) as never);

      await expect(service.complete('eval-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_EVALUATION_ALREADY_COMPLETED);
    });
  });

  describe('requestApproval', () => {
    it('should create an approval request', async () => {
      vi.mocked(prisma.quotationEvaluation.findUnique).mockResolvedValue({
        ...mockEvaluation({ status: 'COMPLETED', totalScore: 85 }),
        quotation: { rfq: { createdById: 'buyer-1' } },
      } as never);
      vi.mocked(prisma.approvalRequest.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.approvalRequest.create).mockResolvedValue({
        id: 'apr-1',
        quotationEvaluationId: 'eval-1',
        status: 'PENDING',
        notes: null,
        requestedBy: { name: 'Buyer' },
        quotationEvaluation: { quotation: { referenceNumber: 'Q-001' } },
        createdAt: new Date(),
      } as never);

      const result = await service.requestApproval('eval-1', 'buyer-1');

      expect(result.status).toBe('PENDING');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.Approval.Requested' }),
      );
    });

    it('should throw if evaluation not COMPLETED', async () => {
      vi.mocked(prisma.quotationEvaluation.findUnique).mockResolvedValue({
        ...mockEvaluation(),
        quotation: { rfq: { createdById: 'buyer-1' } },
      } as never);

      await expect(service.requestApproval('eval-1', 'buyer-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_EVALUATION_INVALID_TRANSITION);
    });
  });

  describe('decideApproval', () => {
    it('should approve and update quotation status', async () => {
      vi.mocked(prisma.approvalRequest.findUnique).mockResolvedValue({
        id: 'apr-1',
        quotationEvaluationId: 'eval-1',
        status: 'PENDING',
        notes: null,
        requestedBy: { name: 'Buyer' },
        quotationEvaluation: { quotationId: 'q-1', quotation: { rfq: { createdById: 'buyer-1' } } },
        history: [],
        createdAt: new Date(),
      } as never);
      vi.mocked(prisma.approvalRequest.update).mockResolvedValue({
        id: 'apr-1',
        quotationEvaluationId: 'eval-1',
        status: 'APPROVED',
        notes: null,
        requestedBy: { name: 'Buyer' },
        history: [{ id: 'h-1', action: 'APPROVED', comment: null, actionBy: { name: 'Approver' }, createdAt: new Date() }],
        createdAt: new Date(),
      } as never);
      vi.mocked(prisma.approvalHistory.create).mockResolvedValue({} as never);
      vi.mocked(prisma.quotation.update).mockResolvedValue({} as never);

      const result = await service.decideApproval('apr-1', 'approver-1', { action: 'APPROVED' });

      expect(result.status).toBe('APPROVED');
      expect(prisma.quotation.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'q-1' }, data: { status: 'ACCEPTED' } }),
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.Approval.Approved' }),
      );
    });

    it('should throw ALREADY_PROCESSED', async () => {
      vi.mocked(prisma.approvalRequest.findUnique).mockResolvedValue({
        id: 'apr-1',
        status: 'APPROVED',
        quotationEvaluation: { quotation: { rfq: { createdById: 'u-1' } } },
      } as never);

      await expect(service.decideApproval('apr-1', 'u-1', { action: 'APPROVED' })).rejects.toThrow(ErrorCodes.PROCUREMENT_APPROVAL_ALREADY_PROCESSED);
    });
  });
});
