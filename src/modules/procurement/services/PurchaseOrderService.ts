import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { POStateMachine } from '@/modules/procurement/workflow/state-machines/POStateMachine';
import type { POStatus } from '@/modules/procurement/workflow/state-machines/POStateMachine';
import type { CreatePOInput, UpdatePOInput, POListQuery } from '@/modules/procurement/validators/po-schemas';

export class PurchaseOrderService {
  async list(query: POListQuery) {
    const { page, limit, search, status, supplierId, projectId, sort } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (projectId) where.projectId = projectId;
    if (search) {
      where.OR = [
        { poNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    const orderBy = sort
      ? { [sort.split(':')[0]]: sort.split(':')[1] || 'desc' }
      : { createdAt: 'desc' as const };

    const [items, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: { select: { id: true, name: true, companyName: true } },
          items: { select: { id: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    const summaries = items.map((item) => ({
      id: item.id,
      poNumber: item.poNumber,
      status: item.status,
      totalAmount: item.totalAmount,
      supplierName: item.supplier.name,
      supplierCompanyName: item.supplier.companyName,
      itemCount: item.items.length,
      orderDate: item.orderDate.toISOString(),
      expectedDelivery: item.expectedDelivery?.toISOString() ?? null,
    }));

    return { items: summaries, total, page, limit };
  }

  async findById(id: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, name: true, email: true, companyName: true } },
        quotation: { select: { id: true, referenceNumber: true } },
        award: { select: { id: true } },
        project: { select: { id: true, title: true } },
        items: true,
      },
    });

    if (!po) throw new Error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND);

    return {
      id: po.id,
      poNumber: po.poNumber,
      quotationId: po.quotationId,
      awardId: po.awardId,
      projectId: po.projectId,
      supplierId: po.supplierId,
      status: po.status,
      subtotal: po.subtotal,
      taxAmount: po.taxAmount,
      totalAmount: po.totalAmount,
      currency: 'SAR',
      orderDate: po.orderDate.toISOString(),
      expectedDelivery: po.expectedDelivery?.toISOString() ?? null,
      deliveryDate: po.deliveryDate?.toISOString() ?? null,
      deliveryAddress: po.deliveryAddress,
      deliveryInstructions: po.deliveryInstructions,
      paymentTerms: po.paymentTerms,
      notes: po.notes,
      createdAt: po.createdAt.toISOString(),
      updatedAt: po.updatedAt.toISOString(),
      supplier: {
        id: po.supplier.id,
        name: po.supplier.name,
        companyName: po.supplier.companyName,
      },
      items: po.items.map((item) => ({
        id: item.id,
        materialName: item.materialName,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        deliveredQuantity: item.deliveredQuantity,
        balanceQuantity: item.balanceQuantity,
      })),
    };
  }

  async create(input: CreatePOInput, userId: string) {
    const totalAmount = input.items.reduce((sum, item) => sum + item.totalPrice, 0);

    if (input.quotationId) {
      const quotation = await prisma.quotation.findUnique({
        where: { id: input.quotationId },
        select: { id: true, status: true, supplierId: true },
      });
      if (!quotation) throw new Error(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
      if (quotation.supplierId !== input.supplierId) {
        throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);
      }
    }

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: input.poNumber,
        quotationId: input.quotationId ?? null,
        awardId: input.awardId ?? null,
        projectId: input.projectId ?? null,
        organizationId: input.organizationId ?? null,
        supplierId: input.supplierId,
        createdById: userId,
        subtotal: totalAmount,
        taxAmount: 0,
        totalAmount,
        expectedDelivery: input.expectedDelivery ? new Date(input.expectedDelivery) : null,
        deliveryAddress: input.deliveryAddress,
        deliveryInstructions: input.deliveryInstructions,
        paymentTerms: input.paymentTerms,
        notes: input.notes,
        items: {
          create: input.items.map((item) => ({
            materialName: item.materialName,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            balanceQuantity: item.quantity,
          })),
        },
      },
      include: {
        supplier: { select: { id: true, name: true } },
        items: { select: { id: true } },
      },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'PO', 'Created'),
      version: 1,
      payload: { poId: po.id, poNumber: po.poNumber, supplierId: input.supplierId, totalAmount, itemCount: po.items.length },
      metadata: { timestamp: new Date(), correlationId: `po_${po.id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Purchase Order created', { poId: po.id, poNumber: po.poNumber, userId });
    return {
      id: po.id,
      poNumber: po.poNumber,
      status: po.status,
      totalAmount: po.totalAmount,
      itemCount: po.items.length,
      createdAt: po.createdAt.toISOString(),
    };
  }

  async update(id: string, input: UpdatePOInput, userId: string) {
    const existing = await prisma.purchaseOrder.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true, poNumber: true },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND);
    if (existing.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);
    if (existing.status !== 'DRAFT') throw new Error(ErrorCodes.PROCUREMENT_PO_CANNOT_MODIFY);

    const updateData: Record<string, unknown> = {};
    if (input.expectedDelivery !== undefined) updateData.expectedDelivery = input.expectedDelivery ? new Date(input.expectedDelivery) : null;
    if (input.deliveryAddress !== undefined) updateData.deliveryAddress = input.deliveryAddress;
    if (input.deliveryInstructions !== undefined) updateData.deliveryInstructions = input.deliveryInstructions;
    if (input.paymentTerms !== undefined) updateData.paymentTerms = input.paymentTerms;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: {
        supplier: { select: { id: true, name: true } },
        items: { select: { id: true } },
      },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'PO', 'Updated'),
      version: 1,
      payload: { poId: id, poNumber: existing.poNumber, changes: Object.keys(input) },
      metadata: { timestamp: new Date(), correlationId: `po_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Purchase Order updated', { poId: id, userId });
    return {
      id: updated.id,
      poNumber: updated.poNumber,
      status: updated.status,
      totalAmount: updated.totalAmount,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async delete(id: string, userId: string) {
    const existing = await prisma.purchaseOrder.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND);
    if (existing.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);
    if (existing.status !== 'DRAFT') throw new Error(ErrorCodes.PROCUREMENT_PO_CANNOT_DELETE);

    await prisma.pOItem.deleteMany({ where: { purchaseOrderId: id } });
    await prisma.purchaseOrder.delete({ where: { id } });
    logger.info('Purchase Order deleted', { poId: id, userId });
  }

  async issue(id: string, userId: string) {
    const existing = await prisma.purchaseOrder.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true, poNumber: true, supplierId: true },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND);
    if (existing.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);

    const sm = new POStateMachine(existing.status as POStatus);
    if (!sm.can('issue')) throw new Error(ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION);

    const nextStatus = sm.transition('issue') as POStatus;
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: nextStatus },
      select: { id: true, poNumber: true, status: true, totalAmount: true, updatedAt: true },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'PO', 'Issued'),
      version: 1,
      payload: { poId: id, poNumber: existing.poNumber, supplierId: existing.supplierId, issuedBy: userId },
      metadata: { timestamp: new Date(), correlationId: `po_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Purchase Order issued', { poId: id, userId });
    return {
      id: updated.id,
      poNumber: updated.poNumber,
      status: updated.status,
      totalAmount: updated.totalAmount,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async acknowledge(id: string, userId: string) {
    const existing = await prisma.purchaseOrder.findUnique({
      where: { id },
      select: { id: true, status: true, supplierId: true, poNumber: true },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND);
    if (existing.supplierId !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);

    const sm = new POStateMachine(existing.status as POStatus);
    if (!sm.can('acknowledge')) throw new Error(ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION);

    const nextStatus = sm.transition('acknowledge') as POStatus;
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: nextStatus },
      select: { id: true, poNumber: true, status: true, updatedAt: true },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'PO', 'Acknowledged'),
      version: 1,
      payload: { poId: id, poNumber: existing.poNumber, acknowledgedBy: userId },
      metadata: { timestamp: new Date(), correlationId: `po_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Purchase Order acknowledged', { poId: id, userId });
    return {
      id: updated.id,
      poNumber: updated.poNumber,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async cancel(id: string, userId: string, reason?: string) {
    const existing = await prisma.purchaseOrder.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true, poNumber: true, supplierId: true },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND);
    if (existing.createdById !== userId && existing.supplierId !== userId) {
      throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);
    }

    const sm = new POStateMachine(existing.status as POStatus);
    if (!sm.can('cancel')) throw new Error(ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION);

    const nextStatus = sm.transition('cancel') as POStatus;
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: nextStatus },
      select: { id: true, poNumber: true, status: true, updatedAt: true },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'PO', 'Cancelled'),
      version: 1,
      payload: { poId: id, poNumber: existing.poNumber, cancelledBy: userId, reason },
      metadata: { timestamp: new Date(), correlationId: `po_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Purchase Order cancelled', { poId: id, userId, reason });
    return {
      id: updated.id,
      poNumber: updated.poNumber,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async complete(id: string, userId: string) {
    const existing = await prisma.purchaseOrder.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true, poNumber: true, items: { select: { id: true, quantity: true, deliveredQuantity: true } } },
    });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND);
    if (existing.createdById !== userId) throw new Error(ErrorCodes.CORE_USER_FORBIDDEN);

    const sm = new POStateMachine(existing.status as POStatus);
    if (!sm.can('complete')) throw new Error(ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION);

    const allDelivered = existing.items.every((item) => item.deliveredQuantity >= item.quantity);
    if (!allDelivered) throw new Error('PROCUREMENT_PO_NOT_FULLY_DELIVERED');

    const nextStatus = sm.transition('complete') as POStatus;
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: nextStatus, deliveryDate: new Date() },
      select: { id: true, poNumber: true, status: true, totalAmount: true, updatedAt: true },
    });

    await eventBus.publish({
      name: buildEventName('Procurement', 'PO', 'Completed'),
      version: 1,
      payload: { poId: id, poNumber: existing.poNumber, completedBy: userId },
      metadata: { timestamp: new Date(), correlationId: `po_${id}_${Date.now()}`, source: 'procurement', userId },
    });

    logger.info('Purchase Order completed', { poId: id, userId });
    return {
      id: updated.id,
      poNumber: updated.poNumber,
      status: updated.status,
      totalAmount: updated.totalAmount,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
