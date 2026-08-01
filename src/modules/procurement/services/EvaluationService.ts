import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import type { CreateCriteriaInput, UpdateCriterionInput, SubmitScoresInput, EvaluationListQuery, CreateApprovalInput, ApproveDecisionInput } from '@/modules/procurement/validators/evaluation-schemas';

export class EvaluationService {
  async list(query: EvaluationListQuery) {
    const { page, limit, status, quotationId, evaluatorId, rfqId, sort } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (quotationId) where.quotationId = quotationId;
    if (evaluatorId) where.evaluatorId = evaluatorId;
    const orderBy = sort
      ? { [sort.split(':')[0]]: sort.split(':')[1] || 'desc' }
      : { createdAt: 'desc' as const };

    const evaluations = await prisma.quotationEvaluation.findMany({
      where: rfqId ? { quotation: { rfqId } } : where,
      include: {
        evaluator: { select: { id: true, name: true } },
        quotation: { select: { id: true, referenceNumber: true, supplier: { select: { name: true, companyName: true } } } },
        scores: { select: { id: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });
    const total = await prisma.quotationEvaluation.count({
      where: rfqId ? { quotation: { rfqId } } : where,
    });

    const items = evaluations.map((e) => ({
      id: e.id,
      quotationId: e.quotationId,
      status: e.status,
      totalScore: e.totalScore,
      evaluatorName: e.evaluator.name,
      supplierName: e.quotation.supplier.name ?? e.quotation.supplier.companyName,
      quotationRef: e.quotation.referenceNumber,
      scoreCount: e.scores.length,
      createdAt: e.createdAt.toISOString(),
    }));

    return { items, total, page, limit };
  }

  async findById(id: string) {
    const evaluation = await prisma.quotationEvaluation.findUnique({
      where: { id },
      include: {
        evaluator: { select: { id: true, name: true, email: true } },
        quotation: {
          select: {
            id: true,
            referenceNumber: true,
            totalAmount: true,
            grandTotal: true,
            currency: true,
            supplier: { select: { name: true, companyName: true } },
          },
        },
        scores: {
          include: {
            criterion: { select: { id: true, name: true, maxScore: true } },
          },
        },
        approvalRequest: {
          include: {
            requestedBy: { select: { id: true, name: true } },
            history: {
              include: { actionBy: { select: { id: true, name: true } } },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!evaluation) throw new Error(ErrorCodes.PROCUREMENT_EVALUATION_NOT_FOUND);

    return {
      id: evaluation.id,
      quotationId: evaluation.quotationId,
      evaluatorId: evaluation.evaluatorId,
      evaluatorName: evaluation.evaluator.name,
      status: evaluation.status,
      totalScore: evaluation.totalScore,
      notes: evaluation.notes,
      createdAt: evaluation.createdAt.toISOString(),
      updatedAt: evaluation.updatedAt.toISOString(),
      scores: evaluation.scores.map((s) => ({
        id: s.id,
        criterionId: s.criterionId,
        criterionName: s.criterion.name,
        maxScore: s.criterion.maxScore,
        score: s.score,
        comment: s.comment,
      })),
      quotationRef: evaluation.quotation.referenceNumber,
      totalAmount: evaluation.quotation.totalAmount,
      grandTotal: evaluation.quotation.grandTotal,
      currency: evaluation.quotation.currency,
      supplierName: evaluation.quotation.supplier.name ?? evaluation.quotation.supplier.companyName,
      approvalRequest: evaluation.approvalRequest
        ? {
            id: evaluation.approvalRequest.id,
            status: evaluation.approvalRequest.status,
            notes: evaluation.approvalRequest.notes,
            requestedByName: evaluation.approvalRequest.requestedBy.name,
            history: evaluation.approvalRequest.history.map((h) => ({
              id: h.id,
              action: h.action,
              comment: h.comment,
              actionByName: h.actionBy.name,
              createdAt: h.createdAt.toISOString(),
            })),
            createdAt: evaluation.approvalRequest.createdAt.toISOString(),
          }
        : null,
    };
  }

  async createCriteria(input: CreateCriteriaInput) {
    const criteria = await Promise.all(
      input.criteria.map((c) =>
        prisma.evaluationCriterion.create({
          data: {
            rfqId: input.rfqId ?? null,
            name: c.name,
            description: c.description,
            maxScore: c.maxScore,
            weight: c.weight,
            orderIndex: c.orderIndex,
          },
        })
      ),
    );

    logger.info('Evaluation criteria created', { count: criteria.length });
    return criteria.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      maxScore: c.maxScore,
      weight: c.weight,
      orderIndex: c.orderIndex,
    }));
  }

  async updateCriterion(id: string, input: UpdateCriterionInput) {
    const existing = await prisma.evaluationCriterion.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_CRITERION_NOT_FOUND);

    const updated = await prisma.evaluationCriterion.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.maxScore !== undefined && { maxScore: input.maxScore }),
        ...(input.weight !== undefined && { weight: input.weight }),
        ...(input.orderIndex !== undefined && { orderIndex: input.orderIndex }),
      },
    });

    return updated;
  }

  async deleteCriterion(id: string) {
    const existing = await prisma.evaluationCriterion.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_CRITERION_NOT_FOUND);

    await prisma.evaluationCriterion.delete({ where: { id } });
    logger.info('Evaluation criterion deleted', { criterionId: id });
  }

  async listCriteria(rfqId?: string) {
    const where = rfqId ? { OR: [{ rfqId }, { rfqId: null }] } : {};
    const criteria = await prisma.evaluationCriterion.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
    });

    return criteria.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      maxScore: c.maxScore,
      weight: c.weight,
      orderIndex: c.orderIndex,
    }));
  }

  async start(quotationId: string, evaluatorId: string, note?: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      select: { id: true, status: true, rfqId: true, referenceNumber: true, supplierId: true },
    });
    if (!quotation) throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    if (quotation.status !== 'SUBMITTED') throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION);

    const existing = await prisma.quotationEvaluation.findFirst({ where: { quotationId } });
    if (existing) return this.findById(existing.id);

    const evaluation = await prisma.quotationEvaluation.create({
      data: {
        quotationId,
        evaluatorId,
        status: 'PENDING',
        notes: note ?? null,
      },
      include: {
        evaluator: { select: { id: true, name: true } },
        quotation: {
          select: { id: true, referenceNumber: true, supplier: { select: { name: true, companyName: true } } },
        },
      },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'Evaluation', 'Started'),
      version: 1,
      payload: { evaluationId: evaluation.id, quotationId, rfqId: quotation.rfqId, evaluatorId },
      metadata: { timestamp: new Date(), correlationId: `eval_${evaluation.id}_${Date.now()}`, source: 'procurement', userId: evaluatorId },
    });

    logger.info('Evaluation started', { evaluationId: evaluation.id, quotationId, evaluatorId });
    return {
      id: evaluation.id,
      quotationId: evaluation.quotationId,
      status: evaluation.status,
      notes: evaluation.notes,
      createdAt: evaluation.createdAt.toISOString(),
    };
  }

  async submitScores(evaluationId: string, input: SubmitScoresInput, userId: string) {
    const evaluation = await prisma.quotationEvaluation.findUnique({
      where: { id: evaluationId },
      include: { scores: { select: { id: true } } },
    });
    if (!evaluation) throw new Error(ErrorCodes.PROCUREMENT_EVALUATION_NOT_FOUND);
    if (evaluation.evaluatorId !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);
    if (evaluation.status === 'COMPLETED') throw new Error(ErrorCodes.PROCUREMENT_EVALUATION_ALREADY_COMPLETED);

    const criteria = await prisma.evaluationCriterion.findMany({
      where: { id: { in: input.scores.map((s) => s.criterionId) } },
    });
    const criterionMap = new Map(criteria.map((c) => [c.id, c]));
    for (const s of input.scores) {
      const criterion = criterionMap.get(s.criterionId);
      if (!criterion) throw new Error(ErrorCodes.PROCUREMENT_CRITERION_NOT_FOUND);
      if (s.score > criterion.maxScore) throw new Error(ErrorCodes.PROCUREMENT_SCORE_EXCEEDS_MAX);
    }

    await prisma.evaluationScore.deleteMany({ where: { quotationEvaluationId: evaluationId } });

    await Promise.all(
      input.scores.map((s) =>
        prisma.evaluationScore.create({
          data: {
            quotationEvaluationId: evaluationId,
            criterionId: s.criterionId,
            score: s.score,
            comment: s.comment,
          },
        })
      ),
    );

    const weightSum = criteria.reduce((sum, c) => sum + c.weight, 0) || 1;
    const weightedScore = input.scores.reduce((sum, s) => {
      const c = criterionMap.get(s.criterionId)!;
      return sum + (s.score / c.maxScore) * c.weight;
    }, 0);
    const normalizedScore = Math.round((weightedScore / weightSum) * 1000) / 10;

    const status: 'IN_PROGRESS' | 'COMPLETED' = input.notes ? 'COMPLETED' : 'IN_PROGRESS';

    const updated = await prisma.quotationEvaluation.update({
      where: { id: evaluationId },
      data: {
        totalScore: normalizedScore,
        status,
        ...(input.notes !== undefined && { notes: input.notes }),
      },
      include: {
        scores: {
          include: { criterion: { select: { id: true, name: true, maxScore: true } } },
        },
      },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'Evaluation', status === 'COMPLETED' ? 'Completed' : 'Scored'),
      version: 1,
      payload: { evaluationId, totalScore: normalizedScore, scoreCount: input.scores.length },
      metadata: { timestamp: new Date(), correlationId: `eval_${evaluationId}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Evaluation scores submitted', { evaluationId, totalScore: normalizedScore });
    return {
      id: updated.id,
      quotationId: updated.quotationId,
      status: updated.status,
      totalScore: updated.totalScore,
      scoreCount: updated.scores.length,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async complete(evaluationId: string, userId: string, notes?: string) {
    const evaluation = await prisma.quotationEvaluation.findUnique({
      where: { id: evaluationId },
      include: { scores: { select: { id: true } } },
    });
    if (!evaluation) throw new Error(ErrorCodes.PROCUREMENT_EVALUATION_NOT_FOUND);
    if (evaluation.evaluatorId !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);
    if (evaluation.status === 'COMPLETED') throw new Error(ErrorCodes.PROCUREMENT_EVALUATION_ALREADY_COMPLETED);

    const updated = await prisma.quotationEvaluation.update({
      where: { id: evaluationId },
      data: { status: 'COMPLETED', ...(notes !== undefined && { notes }) },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'Evaluation', 'Completed'),
      version: 1,
      payload: { evaluationId, quotationId: evaluation.quotationId, totalScore: evaluation.totalScore, scoreCount: evaluation.scores.length },
      metadata: { timestamp: new Date(), correlationId: `eval_${evaluationId}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Evaluation completed', { evaluationId });
    return {
      id: updated.id,
      quotationId: updated.quotationId,
      status: updated.status,
      totalScore: updated.totalScore,
      scoreCount: evaluation.scores.length,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async requestApproval(evaluationId: string, userId: string, input?: CreateApprovalInput) {
    const evaluation = await prisma.quotationEvaluation.findUnique({
      where: { id: evaluationId },
      include: { quotation: { select: { rfq: { select: { createdById: true } } } } },
    });
    if (!evaluation) throw new Error(ErrorCodes.PROCUREMENT_EVALUATION_NOT_FOUND);
    if (evaluation.status !== 'COMPLETED') throw new Error(ErrorCodes.PROCUREMENT_EVALUATION_INVALID_TRANSITION);
    if (evaluation.quotation.rfq.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);

    const existing = await prisma.approvalRequest.findUnique({
      where: { quotationEvaluationId: evaluationId },
    });
    if (existing) throw new Error(ErrorCodes.PROCUREMENT_APPROVAL_ALREADY_PROCESSED);

    const approval = await prisma.approvalRequest.create({
      data: {
        quotationEvaluationId: evaluationId,
        requestedById: userId,
        notes: input?.notes ?? null,
      },
      include: {
        requestedBy: { select: { name: true } },
        quotationEvaluation: { select: { quotation: { select: { referenceNumber: true } } } },
      },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'Approval', 'Requested'),
      version: 1,
      payload: { approvalId: approval.id, evaluationId, quotationRef: approval.quotationEvaluation.quotation.referenceNumber, requestedBy: userId },
      metadata: { timestamp: new Date(), correlationId: `approval_${approval.id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Approval requested', { evaluationId, approvalId: approval.id });
    return {
      id: approval.id,
      quotationEvaluationId: approval.quotationEvaluationId,
      status: approval.status,
      notes: approval.notes,
      requestedByName: approval.requestedBy.name,
      history: [],
      createdAt: approval.createdAt.toISOString(),
    };
  }

  async decideApproval(approvalId: string, userId: string, input: ApproveDecisionInput) {
    const approval = await prisma.approvalRequest.findUnique({
      where: { id: approvalId },
      include: { quotationEvaluation: { include: { quotation: { select: { rfq: { select: { createdById: true } } } } } } },
    });
    if (!approval) throw new Error(ErrorCodes.PROCUREMENT_APPROVAL_NOT_FOUND);
    if (approval.status !== 'PENDING') throw new Error(ErrorCodes.PROCUREMENT_APPROVAL_ALREADY_PROCESSED);

    const [updated, history] = await Promise.all([
      prisma.approvalRequest.update({
        where: { id: approvalId },
        data: { status: input.action },
        include: {
          requestedBy: { select: { name: true } },
          history: {
            include: { actionBy: { select: { name: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      prisma.approvalHistory.create({
        data: {
          approvalRequestId: approvalId,
          action: input.action,
          comment: input.comment ?? null,
          actionById: userId,
        },
      }),
    ]);

    if (input.action === 'APPROVED') {
      await prisma.quotation.update({
        where: { id: approval.quotationEvaluation.quotationId },
        data: { status: 'ACCEPTED' },
      });
    }

    const eventAction = input.action === 'APPROVED' ? 'Approved' : 'Rejected';
    await eventBus.publish({
      name: buildEventName('Procurement', 'Approval', eventAction),
      version: 1,
      payload: { approvalId, evaluationId: approval.quotationEvaluationId, action: input.action, comment: input.comment, decisionBy: userId },
      metadata: { timestamp: new Date(), correlationId: `approval_${approvalId}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info(`Approval ${input.action}`, { approvalId, userId });
    return {
      id: updated.id,
      quotationEvaluationId: updated.quotationEvaluationId,
      status: updated.status,
      notes: updated.notes,
      requestedByName: updated.requestedBy.name,
      history: updated.history.map((h) => ({
        id: h.id,
        action: h.action,
        comment: h.comment,
        actionByName: h.actionBy.name,
        createdAt: h.createdAt.toISOString(),
      })),
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async listCriteriaForEvaluation(quotationId: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      select: { rfqId: true },
    });
    if (!quotation) throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    return this.listCriteria(quotation.rfqId);
  }
}
