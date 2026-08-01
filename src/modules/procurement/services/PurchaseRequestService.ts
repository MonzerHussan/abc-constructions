import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import type { CreatePRInput, UpdatePRInput, ApprovePRInput, PRListQuery } from '@/modules/procurement/validators/purchase-request-schemas';

export class PurchaseRequestService {
  async list(query: PRListQuery) {
    const { page, limit, search, status, category, organizationId, requestedById, sort } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (organizationId) where.organizationId = organizationId;
    if (requestedById) where.requestedById = requestedById;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    const orderBy = sort ? { [sort.split(':')[0]]: sort.split(':')[1] || 'desc' } : { createdAt: 'desc' as const };
    const [items, total] = await Promise.all([
      prisma.purchaseRequest.findMany({
        where,
        include: {
          requestedBy: { select: { id: true, name: true, companyName: true } },
          approvedBy: { select: { id: true, name: true } },
          items: true,
          _count: { select: { items: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.purchaseRequest.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string) {
    const pr = await prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        requestedBy: { select: { id: true, name: true, email: true, companyName: true } },
        approvedBy: { select: { id: true, name: true } },
        project: true,
        items: true,
      },
    });
    if (!pr) throw new Error('PROCUREMENT_PR_NOT_FOUND');
    return pr;
  }

  async create(input: CreatePRInput, userId: string) {
    const pr = await prisma.purchaseRequest.create({
      data: {
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        expectedDelivery: input.expectedDelivery ? new Date(input.expectedDelivery) : null,
        deliveryLocation: input.deliveryLocation,
        notes: input.notes,
        projectId: input.projectId,
        organizationId: input.organizationId,
        requestedById: userId,
        items: {
          create: input.items.map((item) => ({
            materialName: item.materialName,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            estimatedPrice: item.estimatedPrice,
            total: item.total,
          })),
        },
      },
      include: {
        requestedBy: { select: { id: true, name: true, companyName: true } },
        items: true,
      },
    });
    await eventBus.publish({
      name: buildEventName('Procurement', 'PR', 'Created'),
      version: 1,
      payload: { prId: pr.id, orgId: input.organizationId, items: input.items, totalAmount: input.items.reduce((s, i) => s + (i.total || i.estimatedPrice || 0), 0) },
      metadata: { timestamp: new Date(), correlationId: `pr_${pr.id}_${Date.now()}`, source: 'procurement', userId },
    });
    logger.info('Purchase Request created', { prId: pr.id, userId });
    return pr;
  }

  async submit(id: string, userId: string) {
    const existing = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!existing) throw new Error('PROCUREMENT_PR_NOT_FOUND');
    if (existing.requestedById !== userId) throw new Error('CORE_USER_FORBIDDEN');
    if (existing.status !== 'DRAFT') throw new Error('PROCUREMENT_PR_ALREADY_SUBMITTED');
    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL' },
      include: {
        requestedBy: { select: { id: true, name: true, companyName: true } },
        items: true,
      },
    });
    await eventBus.publish({
      name: buildEventName('Procurement', 'PR', 'Submitted'),
      version: 1,
      payload: { prId: id, submittedBy: userId },
      metadata: { timestamp: new Date(), correlationId: `pr_${id}_${Date.now()}`, source: 'procurement', userId },
    });
    logger.info('Purchase Request submitted', { prId: id, userId });
    return updated;
  }

  async update(id: string, input: UpdatePRInput, userId: string) {
    const existing = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!existing) throw new Error('PROCUREMENT_PR_NOT_FOUND');
    if (existing.requestedById !== userId) throw new Error('CORE_USER_FORBIDDEN');
    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.projectId !== undefined && { projectId: input.projectId }),
        ...(input.expectedDelivery !== undefined && { expectedDelivery: input.expectedDelivery ? new Date(input.expectedDelivery) : null }),
        ...(input.deliveryLocation !== undefined && { deliveryLocation: input.deliveryLocation }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
      include: {
        requestedBy: { select: { id: true, name: true, companyName: true } },
        approvedBy: { select: { id: true, name: true } },
        project: true,
        items: true,
      },
    });
    await eventBus.publish({
      name: buildEventName('Procurement', 'PR', 'Updated'),
      version: 1,
      payload: { prId: id, changes: Object.keys(input) },
      metadata: { timestamp: new Date(), correlationId: `pr_${id}_${Date.now()}`, source: 'procurement', userId },
    });
    return updated;
  }

  async approve(id: string, input: ApprovePRInput, userId: string) {
    const existing = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!existing) throw new Error('PROCUREMENT_PR_NOT_FOUND');
    if (existing.status === 'APPROVED') throw new Error('PROCUREMENT_PR_ALREADY_APPROVED');
    if (existing.status === 'REJECTED') throw new Error('PROCUREMENT_PR_ALREADY_REJECTED');
    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: {
        status: input.status,
        approvedById: userId,
        notes: input.notes !== undefined ? input.notes : undefined,
      },
      include: {
        requestedBy: { select: { id: true, name: true, companyName: true } },
        approvedBy: { select: { id: true, name: true } },
        items: true,
      },
    });
    const eventAction = input.status === 'APPROVED' ? 'Approved' : 'Rejected';
    await eventBus.publish({
      name: buildEventName('Procurement', 'PR', eventAction),
      version: 1,
      payload: { prId: id, approvedBy: userId, reason: input.notes },
      metadata: { timestamp: new Date(), correlationId: `pr_${id}_${Date.now()}`, source: 'procurement', userId },
    });
    logger.info(`Purchase Request ${input.status}`, { prId: id, userId });
    return updated;
  }

  async delete(id: string, userId: string) {
    const existing = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!existing) throw new Error('PROCUREMENT_PR_NOT_FOUND');
    if (existing.requestedById !== userId) throw new Error('CORE_USER_FORBIDDEN');
    await prisma.purchaseRequestItem.deleteMany({ where: { purchaseRequestId: id } });
    await prisma.purchaseRequest.delete({ where: { id } });
    logger.info('Purchase Request deleted', { prId: id, userId });
  }
}
