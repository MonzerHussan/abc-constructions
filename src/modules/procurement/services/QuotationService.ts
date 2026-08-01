import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { QuotationStateMachine } from '@/modules/procurement/workflow/state-machines/QuotationStateMachine';
import type { QuotationStatus } from '@/modules/procurement/workflow/state-machines/QuotationStateMachine';
import type { CreateQuotationInput, UpdateQuotationInput, QuotationListQuery, AcceptQuotationInput, RejectQuotationInput } from '@/modules/procurement/validators/quotation-schemas';

export class QuotationService {
  async list(query: QuotationListQuery) {
    const { page, limit, search, status, rfqId, supplierId, sort } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (rfqId) where.rfqId = rfqId;
    if (supplierId) where.supplierId = supplierId;
    if (search) {
      where.OR = [
        { referenceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    const orderBy = sort
      ? { [sort.split(':')[0]]: sort.split(':')[1] || 'desc' }
      : { createdAt: 'desc' as const };

    const [items, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        include: {
          supplier: { select: { id: true, name: true, companyName: true } },
          items: { select: { id: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.quotation.count({ where }),
    ]);

    const summaries = items.map((item) => ({
      id: item.id,
      rfqId: item.rfqId,
      referenceNumber: item.referenceNumber,
      status: item.status,
      totalAmount: item.totalAmount,
      grandTotal: item.grandTotal,
      currency: item.currency,
      supplierName: item.supplier.name,
      supplierCompanyName: item.supplier.companyName,
      itemCount: item.items.length,
      submittedAt: item.submittedAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
    }));

    return { items: summaries, total, page, limit };
  }

  async findById(id: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, name: true, email: true, companyName: true } },
        rfq: { select: { id: true, title: true, referenceNumber: true, deadlineDate: true } },
        items: true,
      },
    });

    if (!quotation) throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);

    return {
      id: quotation.id,
      rfqId: quotation.rfqId,
      supplierId: quotation.supplierId,
      referenceNumber: quotation.referenceNumber,
      status: quotation.status,
      coverLetter: quotation.coverLetter,
      deliveryTime: quotation.deliveryTime,
      validUntil: quotation.validUntil?.toISOString() ?? null,
      totalAmount: quotation.totalAmount,
      taxAmount: quotation.taxAmount,
      grandTotal: quotation.grandTotal,
      currency: quotation.currency,
      notes: quotation.notes,
      submittedAt: quotation.submittedAt?.toISOString() ?? null,
      createdAt: quotation.createdAt.toISOString(),
      updatedAt: quotation.updatedAt.toISOString(),
      supplier: {
        id: quotation.supplier.id,
        name: quotation.supplier.name,
        companyName: quotation.supplier.companyName,
      },
      rfq: quotation.rfq,
      items: quotation.items.map((item) => ({
        id: item.id,
        rfqItemId: item.rfqItemId,
        materialName: item.materialName,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    };
  }

  async create(input: CreateQuotationInput, userId: string) {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: input.rfqId },
      select: { id: true, status: true, organizationId: true, deadlineDate: true },
    });
    if (!rfq) throw new Error(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND);
    if (rfq.status !== 'OPEN') throw new Error(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION);
    if (rfq.deadlineDate < new Date()) throw new Error(ErrorCodes.PROCUREMENT_RFQ_DEADLINE_PASSED);

    const totalAmount = input.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = 0;
    const grandTotal = totalAmount + taxAmount;

    const quotation = await prisma.quotation.create({
      data: {
        rfqId: input.rfqId,
        supplierId: userId,
        organizationId: rfq.organizationId,
        referenceNumber: input.referenceNumber,
        coverLetter: input.coverLetter,
        deliveryTime: input.deliveryTime,
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
        currency: input.currency || 'SAR',
        totalAmount,
        taxAmount,
        grandTotal,
        notes: input.notes,
        items: {
          create: input.items.map((item) => ({
            rfqItemId: item.rfqItemId,
            materialName: item.materialName,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        supplier: { select: { id: true, name: true, companyName: true } },
        items: { select: { id: true } },
      },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'Quotation', 'Created'),
      version: 1,
      payload: {
        quotationId: quotation.id,
        rfqId: quotation.rfqId,
        supplierId: userId,
        totalAmount: quotation.totalAmount,
        grandTotal: quotation.grandTotal,
        currency: quotation.currency,
        itemsCount: quotation.items.length,
      },
      metadata: { timestamp: new Date(), correlationId: `quotation_${quotation.id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Quotation created', { quotationId: quotation.id, rfqId: input.rfqId, userId });
    return {
      id: quotation.id,
      rfqId: quotation.rfqId,
      referenceNumber: quotation.referenceNumber,
      status: quotation.status,
      totalAmount: quotation.totalAmount,
      taxAmount: quotation.taxAmount,
      grandTotal: quotation.grandTotal,
      currency: quotation.currency,
      itemCount: quotation.items.length,
      createdAt: quotation.createdAt.toISOString(),
    };
  }

  async update(id: string, input: UpdateQuotationInput, userId: string) {
    const existing = await prisma.quotation.findUnique({
      where: { id },
      select: { id: true, status: true, supplierId: true, rfqId: true },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    if (existing.supplierId !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);
    if (existing.status !== 'DRAFT') throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_CANNOT_MODIFY);

    const updateData: Record<string, unknown> = {};
    if (input.referenceNumber !== undefined) updateData.referenceNumber = input.referenceNumber;
    if (input.coverLetter !== undefined) updateData.coverLetter = input.coverLetter;
    if (input.deliveryTime !== undefined) updateData.deliveryTime = input.deliveryTime;
    if (input.validUntil !== undefined) updateData.validUntil = input.validUntil ? new Date(input.validUntil) : null;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.notes !== undefined) updateData.notes = input.notes;

    if (input.items) {
      const totalAmount = input.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxAmount = 0;
      const grandTotal = totalAmount + taxAmount;
      updateData.totalAmount = totalAmount;
      updateData.taxAmount = taxAmount;
      updateData.grandTotal = grandTotal;

      await prisma.quotationItem.deleteMany({ where: { quotationId: id } });
      updateData.items = {
        create: input.items.map((item) => ({
          rfqItemId: item.rfqItemId,
          materialName: item.materialName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      };
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: updateData,
      include: {
        supplier: { select: { id: true, name: true, companyName: true } },
        items: { select: { id: true } },
      },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'Quotation', 'Updated'),
      version: 1,
      payload: { quotationId: id, rfqId: existing.rfqId, changes: Object.keys(input) },
      metadata: { timestamp: new Date(), correlationId: `quotation_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Quotation updated', { quotationId: id, userId });
    return {
      id: updated.id,
      referenceNumber: updated.referenceNumber,
      status: updated.status,
      totalAmount: updated.totalAmount,
      grandTotal: updated.grandTotal,
      currency: updated.currency,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async delete(id: string, userId: string) {
    const existing = await prisma.quotation.findUnique({
      where: { id },
      select: { id: true, status: true, supplierId: true },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    if (existing.supplierId !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);
    if (existing.status !== 'DRAFT') throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_CANNOT_DELETE);

    await prisma.quotationItem.deleteMany({ where: { quotationId: id } });
    await prisma.quotation.delete({ where: { id } });
    logger.info('Quotation deleted', { quotationId: id, userId });
  }

  async submit(id: string, userId: string) {
    const existing = await prisma.quotation.findUnique({
      where: { id },
      include: { items: { select: { id: true } } },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    if (existing.supplierId !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);

    const sm = new QuotationStateMachine(existing.status as QuotationStatus);
    if (!sm.can('submit')) throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION);

    if (existing.items.length === 0) throw new Error(ErrorCodes.PROCUREMENT_RFQ_NO_ITEMS);

    await prisma.rFQ.findUniqueOrThrow({ where: { id: existing.rfqId }, select: { id: true } });

    const nextStatus = sm.transition('submit') as QuotationStatus;
    const updated = await prisma.quotation.update({
      where: { id },
      data: { status: nextStatus, submittedAt: new Date() },
      include: {
        supplier: { select: { id: true, name: true } },
        items: { select: { id: true, materialName: true, quantity: true } },
      },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'Quotation', 'Submitted'),
      version: 1,
      payload: { quotationId: id, rfqId: existing.rfqId, submittedBy: userId, referenceNumber: existing.referenceNumber },
      metadata: { timestamp: new Date(), correlationId: `quotation_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Quotation submitted', { quotationId: id, userId });
    return {
      id: updated.id,
      rfqId: updated.rfqId,
      referenceNumber: updated.referenceNumber,
      status: updated.status,
      totalAmount: updated.totalAmount,
      grandTotal: updated.grandTotal,
      currency: updated.currency,
      submittedAt: updated.submittedAt?.toISOString(),
    };
  }

  async withdraw(id: string, userId: string) {
    const existing = await prisma.quotation.findUnique({
      where: { id },
      select: { id: true, status: true, supplierId: true, rfqId: true, referenceNumber: true },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    if (existing.supplierId !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);

    const sm = new QuotationStateMachine(existing.status as QuotationStatus);
    if (!sm.can('withdraw')) throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION);

    const nextStatus = sm.transition('withdraw') as QuotationStatus;
    const updated = await prisma.quotation.update({
      where: { id },
      data: { status: nextStatus },
      select: { id: true, status: true, referenceNumber: true, updatedAt: true },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'Quotation', 'Withdrawn'),
      version: 1,
      payload: { quotationId: id, rfqId: existing.rfqId, withdrawnBy: userId, referenceNumber: existing.referenceNumber },
      metadata: { timestamp: new Date(), correlationId: `quotation_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Quotation withdrawn', { quotationId: id, userId });
    return {
      id: updated.id,
      status: updated.status,
      referenceNumber: updated.referenceNumber,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async accept(id: string, userId: string, input?: AcceptQuotationInput) {
    const existing = await prisma.quotation.findUnique({
      where: { id },
      include: {
        rfq: { select: { id: true, createdById: true } },
      },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    if (existing.rfq.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);

    const sm = new QuotationStateMachine(existing.status as QuotationStatus);
    if (!sm.can('accept')) throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION);

    const nextStatus = sm.transition('accept') as QuotationStatus;
    const updated = await prisma.quotation.update({
      where: { id },
      data: { status: nextStatus, notes: input?.notes ?? existing.notes },
      select: { id: true, status: true, referenceNumber: true, totalAmount: true, grandTotal: true, currency: true, updatedAt: true },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'Quotation', 'Accepted'),
      version: 1,
      payload: { quotationId: id, rfqId: existing.rfqId, acceptedBy: userId, referenceNumber: existing.referenceNumber },
      metadata: { timestamp: new Date(), correlationId: `quotation_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Quotation accepted', { quotationId: id, userId });
    return {
      id: updated.id,
      status: updated.status,
      referenceNumber: updated.referenceNumber,
      totalAmount: updated.totalAmount,
      grandTotal: updated.grandTotal,
      currency: updated.currency,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async reject(id: string, userId: string, input: RejectQuotationInput) {
    const existing = await prisma.quotation.findUnique({
      where: { id },
      include: {
        rfq: { select: { id: true, createdById: true } },
      },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    if (existing.rfq.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);

    const sm = new QuotationStateMachine(existing.status as QuotationStatus);
    if (!sm.can('reject')) throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION);

    const nextStatus = sm.transition('reject') as QuotationStatus;
    const updated = await prisma.quotation.update({
      where: { id },
      data: { status: nextStatus, notes: input.reason },
      select: { id: true, status: true, referenceNumber: true, updatedAt: true },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'Quotation', 'Rejected'),
      version: 1,
      payload: { quotationId: id, rfqId: existing.rfqId, rejectedBy: userId, reason: input.reason, referenceNumber: existing.referenceNumber },
      metadata: { timestamp: new Date(), correlationId: `quotation_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Quotation rejected', { quotationId: id, userId, reason: input.reason });
    return {
      id: updated.id,
      status: updated.status,
      referenceNumber: updated.referenceNumber,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
