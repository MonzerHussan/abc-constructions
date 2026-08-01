import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { RFQStateMachine } from '@/modules/procurement/workflow/state-machines/RFQStateMachine';
import type { CreateRFQInput, UpdateRFQInput, RFQListQuery } from '@/modules/procurement/validators/rfq-schemas';
import type { RFQStatus } from '@/modules/procurement/workflow/state-machines/RFQStateMachine';

export class RFQService {
  async list(query: RFQListQuery) {
    const { page, limit, search, status, projectId, createdById, sort } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;
    if (createdById) where.createdById = createdById;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    const orderBy = sort
      ? { [sort.split(':')[0]]: sort.split(':')[1] || 'desc' }
      : { createdAt: 'desc' as const };

    const [items, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true, companyName: true } },
          items: { select: { id: true } },
          _count: { select: { quotations: true, suppliers: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.rFQ.count({ where }),
    ]);

    const summaries = items.map((item) => ({
      id: item.id,
      title: item.title,
      referenceNumber: item.referenceNumber,
      status: item.status,
      deadlineDate: item.deadlineDate.toISOString(),
      createdAt: item.createdAt.toISOString(),
      createdBy: item.createdBy,
      itemsCount: item.items.length,
      suppliersCount: item._count.suppliers,
      quotationsCount: item._count.quotations,
    }));

    return { items: summaries, total, page, limit };
  }

  async findById(id: string) {
    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, companyName: true } },
        project: { select: { id: true, title: true } },
        purchaseRequest: { select: { id: true, title: true } },
        items: true,
        suppliers: {
          include: {
            supplier: { select: { id: true, name: true, companyName: true } },
          },
        },
        quotations: {
          include: {
            supplier: { select: { name: true } },
          },
        },
        evaluations: {
          include: {
            evaluator: { select: { name: true } },
          },
        },
        awards: {
          include: {
            supplier: { select: { name: true, companyName: true } },
          },
        },
        _count: { select: { quotations: true, suppliers: true } },
      },
    });

    if (!rfq) throw new Error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND);

    return {
      id: rfq.id,
      title: rfq.title,
      description: rfq.description,
      referenceNumber: rfq.referenceNumber,
      status: rfq.status,
      purchaseRequestId: rfq.purchaseRequestId,
      projectId: rfq.projectId,
      organizationId: rfq.organizationId,
      issueDate: rfq.issueDate?.toISOString() ?? null,
      deadlineDate: rfq.deadlineDate.toISOString(),
      deliveryDate: rfq.deliveryDate?.toISOString() ?? null,
      deliveryLocation: rfq.deliveryLocation,
      termsAndConditions: rfq.termsAndConditions,
      attachments: rfq.attachments,
      createdAt: rfq.createdAt.toISOString(),
      updatedAt: rfq.updatedAt.toISOString(),
      createdBy: rfq.createdBy,
      project: rfq.project ? { id: rfq.project.id, title: rfq.project.title } : null,
      purchaseRequest: rfq.purchaseRequest ? { id: rfq.purchaseRequest.id, title: rfq.purchaseRequest.title } : null,
      items: rfq.items,
      suppliers: rfq.suppliers.map((s) => ({
        id: s.id,
        supplierId: s.supplierId,
        supplierName: s.supplier.name,
        companyName: s.supplier.companyName,
        invitedAt: s.invitedAt.toISOString(),
        responded: s.responded,
        respondedAt: s.respondedAt?.toISOString() ?? null,
      })),
      quotations: rfq.quotations.map((q) => ({
        id: q.id,
        supplierName: q.supplier.name,
        totalAmount: q.totalAmount,
        status: q.status,
      })),
      evaluations: rfq.evaluations.map((e) => ({
        id: e.id,
        evaluatorName: e.evaluator.name,
        status: e.status,
      })),
      awards: rfq.awards.map((a) => ({
        id: a.id,
        supplierName: a.supplier.name ?? a.supplier.companyName,
        totalAmount: a.totalAmount,
      })),
      _count: { quotations: rfq._count.quotations, suppliers: rfq._count.suppliers },
    };
  }

  async create(input: CreateRFQInput, userId: string) {
    const rfq = await prisma.rFQ.create({
      data: {
        title: input.title,
        description: input.description,
        referenceNumber: input.referenceNumber,
        purchaseRequestId: input.purchaseRequestId,
        projectId: input.projectId,
        organizationId: input.organizationId,
        deadlineDate: new Date(input.deadlineDate),
        deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null,
        deliveryLocation: input.deliveryLocation,
        termsAndConditions: input.termsAndConditions,
        attachments: input.attachments || [],
        createdById: userId,
        items: {
          create: input.items.map((item) => ({
            materialName: item.materialName,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            specifications: item.specifications,
          })),
        },
        suppliers: input.supplierIds?.length
          ? {
              create: input.supplierIds.map((supplierId) => ({
                supplierId,
                organizationId: input.organizationId,
              })),
            }
          : undefined,
      },
      include: {
        createdBy: { select: { id: true, name: true, companyName: true } },
        items: true,
        suppliers: { select: { id: true, supplierId: true } },
        _count: { select: { quotations: true, suppliers: true } },
      },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'RFQ', 'Created'),
      version: 1,
      payload: {
        rfqId: rfq.id,
        title: rfq.title,
        referenceNumber: rfq.referenceNumber,
        orgId: input.organizationId,
        itemsCount: rfq.items.length,
        supplierCount: rfq.suppliers.length,
      },
      metadata: { timestamp: new Date(), correlationId: `rfq_${rfq.id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('RFQ created', { rfqId: rfq.id, userId });
    return {
      id: rfq.id,
      title: rfq.title,
      referenceNumber: rfq.referenceNumber,
      status: rfq.status,
      deadlineDate: rfq.deadlineDate.toISOString(),
      createdAt: rfq.createdAt.toISOString(),
      createdBy: rfq.createdBy,
      itemsCount: rfq.items.length,
      suppliersCount: rfq._count.suppliers,
      quotationsCount: rfq._count.quotations,
    };
  }

  async update(id: string, input: UpdateRFQInput, userId: string) {
    const existing = await prisma.rFQ.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND);
    if (existing.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);
    if (existing.status !== 'DRAFT') throw new Error(ErrorCodes.PROCUREMENT_RFQ_CANNOT_MODIFY);

    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.referenceNumber !== undefined) updateData.referenceNumber = input.referenceNumber;
    if (input.projectId !== undefined) updateData.projectId = input.projectId;
    if (input.deadlineDate !== undefined) updateData.deadlineDate = new Date(input.deadlineDate);
    if (input.deliveryDate !== undefined) updateData.deliveryDate = input.deliveryDate ? new Date(input.deliveryDate) : null;
    if (input.deliveryLocation !== undefined) updateData.deliveryLocation = input.deliveryLocation;
    if (input.termsAndConditions !== undefined) updateData.termsAndConditions = input.termsAndConditions;
    if (input.attachments !== undefined) updateData.attachments = input.attachments;

    if (input.items) {
      await prisma.rFQItem.deleteMany({ where: { rfqId: id } });
      updateData.items = {
        create: input.items.map((item) => ({
          materialName: item.materialName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          specifications: item.specifications,
        })),
      };
    }

    const updated = await prisma.rFQ.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, companyName: true } },
        items: true,
        suppliers: { select: { id: true, supplierId: true } },
        _count: { select: { quotations: true, suppliers: true } },
      },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'RFQ', 'Updated'),
      version: 1,
      payload: { rfqId: id, changes: Object.keys(input) },
      metadata: { timestamp: new Date(), correlationId: `rfq_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('RFQ updated', { rfqId: id, userId });
    return {
      id: updated.id,
      title: updated.title,
      referenceNumber: updated.referenceNumber,
      status: updated.status,
      deadlineDate: updated.deadlineDate.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      createdBy: updated.createdBy,
      itemsCount: updated.items.length,
      suppliersCount: updated._count.suppliers,
      quotationsCount: updated._count.quotations,
    };
  }

  async delete(id: string, userId: string) {
    const existing = await prisma.rFQ.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND);
    if (existing.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);
    if (existing.status !== 'DRAFT') throw new Error(ErrorCodes.PROCUREMENT_RFQ_CANNOT_DELETE);

    await prisma.rFQItem.deleteMany({ where: { rfqId: id } });
    await prisma.rFQSupplier.deleteMany({ where: { rfqId: id } });
    await prisma.rFQ.delete({ where: { id } });
    logger.info('RFQ deleted', { rfqId: id, userId });
  }

  async submit(id: string, userId: string) {
    const existing = await prisma.rFQ.findUnique({
      where: { id },
      include: { items: { select: { id: true } } },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND);
    if (existing.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);

    const sm = new RFQStateMachine(existing.status as RFQStatus);
    if (!sm.can('submit')) throw new Error(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION);

    if (existing.items.length === 0) throw new Error(ErrorCodes.PROCUREMENT_RFQ_NO_ITEMS);

    const nextStatus = sm.transition('submit') as any;
    const updated = await prisma.rFQ.update({
      where: { id },
      data: { status: nextStatus },
      include: {
        createdBy: { select: { id: true, name: true, companyName: true } },
        items: { select: { id: true, materialName: true, quantity: true } },
        _count: { select: { quotations: true, suppliers: true } },
      },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'RFQ', 'Submitted'),
      version: 1,
      payload: { rfqId: id, submittedBy: userId, referenceNumber: existing.referenceNumber },
      metadata: { timestamp: new Date(), correlationId: `rfq_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('RFQ submitted', { rfqId: id, userId });
    return {
      id: updated.id,
      title: updated.title,
      referenceNumber: updated.referenceNumber,
      status: updated.status,
      deadlineDate: updated.deadlineDate.toISOString(),
      createdBy: updated.createdBy,
      itemsCount: updated.items.length,
    };
  }

  async send(id: string, userId: string) {
    const existing = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        suppliers: { select: { supplierId: true } },
        items: { select: { id: true } },
      },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND);
    if (existing.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);

    const sm = new RFQStateMachine(existing.status as RFQStatus);
    if (!sm.can('send')) throw new Error(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION);

    if (existing.suppliers.length === 0) {
      throw new Error(ErrorCodes.PROCUREMENT_RFQ_SUPPLIER_NOT_INVITED);
    }

    const nextStatus = sm.transition('send') as any;
    const updated = await prisma.rFQ.update({
      where: { id },
      data: {
        status: nextStatus,
        issueDate: new Date(),
      },
      include: {
        createdBy: { select: { id: true, name: true, companyName: true } },
        items: { select: { id: true, materialName: true, quantity: true } },
        suppliers: { select: { supplierId: true } },
        _count: { select: { quotations: true, suppliers: true } },
      },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'RFQ', 'Sent'),
      version: 1,
      payload: {
        rfqId: id,
        referenceNumber: existing.referenceNumber,
        supplierIds: existing.suppliers.map((s) => s.supplierId),
        deadlineDate: existing.deadlineDate.toISOString(),
      },
      metadata: { timestamp: new Date(), correlationId: `rfq_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('RFQ sent to suppliers', { rfqId: id, userId, supplierCount: existing.suppliers.length });
    return {
      id: updated.id,
      title: updated.title,
      referenceNumber: updated.referenceNumber,
      status: updated.status,
      issueDate: updated.issueDate?.toISOString(),
      deadlineDate: updated.deadlineDate.toISOString(),
      createdBy: updated.createdBy,
      itemsCount: updated.items.length,
      suppliersCount: updated._count.suppliers,
    };
  }

  async inviteSupplier(id: string, supplierId: string, userId: string) {
    const existing = await prisma.rFQ.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true, referenceNumber: true, organizationId: true },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND);
    if (existing.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);
    if (existing.status !== 'DRAFT' && existing.status !== 'SENT') {
      throw new Error(ErrorCodes.PROCUREMENT_RFQ_CANNOT_MODIFY);
    }

    const alreadyInvited = await prisma.rFQSupplier.findFirst({
      where: { rfqId: id, supplierId },
      select: { id: true },
    });
    if (alreadyInvited) throw new Error(ErrorCodes.PROCUREMENT_RFQ_SUPPLIER_ALREADY_INVITED);

    const supplier = await prisma.rFQSupplier.create({
      data: {
        rfqId: id,
        supplierId,
        organizationId: existing.organizationId,
      },
      include: {
        supplier: { select: { id: true, name: true, companyName: true } },
      },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'RFQ', 'SupplierInvited'),
      version: 1,
      payload: { rfqId: id, referenceNumber: existing.referenceNumber, supplierId, invitedBy: userId },
      metadata: { timestamp: new Date(), correlationId: `rfq_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Supplier invited to RFQ', { rfqId: id, supplierId, userId });
    return {
      id: supplier.id,
      supplierId: supplier.supplierId,
      supplierName: supplier.supplier.name,
      companyName: supplier.supplier.companyName,
      invitedAt: supplier.invitedAt.toISOString(),
      responded: supplier.responded,
      respondedAt: supplier.respondedAt?.toISOString() ?? null,
    };
  }

  async award(id: string, quotationId: string, userId: string) {
    const existing = await prisma.rFQ.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true, referenceNumber: true },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND);
    if (existing.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);

    const sm = new RFQStateMachine(existing.status as RFQStatus);
    if (!sm.can('award')) throw new Error(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION);

    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      select: { id: true, supplierId: true, grandTotal: true, rfqId: true },
    });
    if (!quotation || quotation.rfqId !== id) {
      throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    }

    const nextStatus = sm.transition('award');
    const nextStatusCasted = nextStatus as any;
    const [updated] = await Promise.all([
      prisma.rFQ.update({
        where: { id },
        data: { status: nextStatusCasted },
        select: { id: true, title: true, referenceNumber: true, status: true, deadlineDate: true },
      }),
      prisma.award.create({
        data: {
          rfqId: id,
          quotationId,
          supplierId: quotation.supplierId,
          totalAmount: quotation.grandTotal,
          awardedById: userId,
        },
      }),
    ]);

    await eventBus.publish({
      name: buildEventName('Procurement', 'RFQ', 'Awarded'),
      version: 1,
      payload: { rfqId: id, referenceNumber: existing.referenceNumber, supplierId: quotation.supplierId, quotationId, awardedBy: userId },
      metadata: { timestamp: new Date(), correlationId: `rfq_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('RFQ awarded', { rfqId: id, quotationId, supplierId: quotation.supplierId, userId });
    return {
      id: updated.id,
      title: updated.title,
      referenceNumber: updated.referenceNumber,
      status: updated.status,
      deadlineDate: updated.deadlineDate.toISOString(),
      awardedSupplierId: quotation.supplierId,
      totalAmount: quotation.grandTotal,
    };
  }

  async close(id: string, userId: string) {
    const existing = await prisma.rFQ.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true, referenceNumber: true },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND);
    if (existing.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);

    const sm = new RFQStateMachine(existing.status as RFQStatus);
    if (!sm.can('close')) throw new Error(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION);

    const nextStatus = sm.transition('close') as any;
    const updated = await prisma.rFQ.update({
      where: { id },
      data: { status: nextStatus },
      select: { id: true, title: true, referenceNumber: true, status: true, deadlineDate: true },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'RFQ', 'Closed'),
      version: 1,
      payload: { rfqId: id, referenceNumber: existing.referenceNumber, closedBy: userId },
      metadata: { timestamp: new Date(), correlationId: `rfq_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('RFQ closed', { rfqId: id, userId });
    return {
      id: updated.id,
      title: updated.title,
      referenceNumber: updated.referenceNumber,
      status: updated.status,
      deadlineDate: updated.deadlineDate.toISOString(),
    };
  }

  async cancel(id: string, userId: string, reason?: string) {
    const existing = await prisma.rFQ.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true, referenceNumber: true },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND);
    if (existing.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);

    const sm = new RFQStateMachine(existing.status as RFQStatus);
    if (!sm.can('cancel')) throw new Error(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION);

    const nextStatus = sm.transition('cancel') as any;
    const updated = await prisma.rFQ.update({
      where: { id },
      data: { status: nextStatus },
      select: { id: true, title: true, referenceNumber: true, status: true, deadlineDate: true },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'RFQ', 'Cancelled'),
      version: 1,
      payload: { rfqId: id, referenceNumber: existing.referenceNumber, cancelledBy: userId, reason },
      metadata: { timestamp: new Date(), correlationId: `rfq_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('RFQ cancelled', { rfqId: id, userId, reason });
    return {
      id: updated.id,
      title: updated.title,
      referenceNumber: updated.referenceNumber,
      status: updated.status,
      deadlineDate: updated.deadlineDate.toISOString(),
    };
  }
}
