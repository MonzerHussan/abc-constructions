import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { DeliveryStateMachine } from '@/modules/procurement/workflow/state-machines/DeliveryStateMachine';
import type { DeliveryStatus } from '@/modules/procurement/workflow/state-machines/DeliveryStateMachine';
import type { CreateDeliveryInput, UpdateDeliveryInput, DeliveryListQuery } from '@/modules/procurement/validators/delivery-schemas';

function mapDeliveryItem(item: Record<string, unknown>): Record<string, unknown> {
  return {
    id: item.id,
    deliveryId: item.deliveryId,
    poItemId: item.poItemId,
    quantity: item.quantity,
    notes: item.notes ?? null,
    createdAt: (item.createdAt as Date).toISOString(),
  };
}

export class DeliveryService {
  async list(query: DeliveryListQuery) {
    const { page, limit, search, status, supplierId, purchaseOrderId, sort } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (purchaseOrderId) where.purchaseOrderId = purchaseOrderId;
    if (search) {
      where.OR = [
        { deliveryNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    const orderBy = sort
      ? { [sort.split(':')[0]]: sort.split(':')[1] || 'desc' }
      : { createdAt: 'desc' as const };

    const [items, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        include: {
          _count: { select: { items: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.delivery.count({ where }),
    ]);

    const summaries = items.map((item) => ({
      id: item.id,
      deliveryNumber: item.deliveryNumber,
      purchaseOrderId: item.purchaseOrderId,
      supplierId: item.supplierId,
      status: item.status,
      driverName: item.driverName,
      driverPhone: item.driverPhone,
      vehicleNumber: item.vehicleNumber,
      scheduledDate: item.scheduledDate?.toISOString() ?? null,
      notes: item.notes,
      itemCount: item._count.items,
      createdAt: item.createdAt.toISOString(),
    }));

    return { items: summaries, total, page, limit };
  }

  async findById(id: string) {
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, name: true, companyName: true } },
        createdBy: { select: { id: true, name: true } },
        items: { include: { poItem: { select: { id: true, materialName: true } } } },
        goodsReceipts: { select: { id: true, receiptNumber: true, status: true } },
      },
    });

    if (!delivery) throw new Error(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND);

    return {
      id: delivery.id,
      deliveryNumber: delivery.deliveryNumber,
      purchaseOrderId: delivery.purchaseOrderId,
      supplierId: delivery.supplierId,
      supplierName: delivery.supplier.name,
      supplierCompanyName: delivery.supplier.companyName,
      status: delivery.status,
      driverName: delivery.driverName,
      driverPhone: delivery.driverPhone,
      vehicleNumber: delivery.vehicleNumber,
      scheduledDate: delivery.scheduledDate?.toISOString() ?? null,
      dispatchedAt: delivery.dispatchedAt?.toISOString() ?? null,
      arrivedAt: delivery.arrivedAt?.toISOString() ?? null,
      notes: delivery.notes,
      createdById: delivery.createdById,
      createdByName: delivery.createdBy.name,
      items: delivery.items.map(mapDeliveryItem),
      goodsReceipts: delivery.goodsReceipts.map((gr) => ({
        id: gr.id,
        receiptNumber: gr.receiptNumber,
        status: gr.status,
      })),
      createdAt: delivery.createdAt.toISOString(),
      updatedAt: delivery.updatedAt.toISOString(),
    };
  }

  async create(input: CreateDeliveryInput, userId: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: input.purchaseOrderId },
      include: { items: true },
    });
    if (!po) throw new Error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND);

    const poItemIds = new Set(po.items.map((i) => i.id));
    for (const item of input.items) {
      if (!poItemIds.has(item.poItemId)) {
        throw new Error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND);
      }
    }

    const delivery = await prisma.delivery.create({
      data: {
        deliveryNumber: `DEL-${Date.now()}`,
        purchaseOrderId: input.purchaseOrderId,
        supplierId: input.supplierId,
        driverName: input.driverName ?? null,
        driverPhone: input.driverPhone ?? null,
        vehicleNumber: input.vehicleNumber ?? null,
        scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : null,
        notes: input.notes ?? null,
        createdById: userId,
        status: 'SCHEDULED',
        items: {
          create: input.items.map((item) => ({
            poItemId: item.poItemId,
            quantity: item.quantity,
            notes: item.notes ?? null,
          })),
        },
      },
      include: {
        items: true,
        supplier: { select: { id: true, name: true } },
      },
    });

    logger.info(`Delivery ${delivery.deliveryNumber} created for PO ${input.purchaseOrderId}`);

    await eventBus.publish({
      name: buildEventName('Procurement', 'Delivery', 'Created'),
      version: 1,
      payload: { deliveryId: delivery.id, deliveryNumber: delivery.deliveryNumber, purchaseOrderId: input.purchaseOrderId },
      metadata: { timestamp: new Date(), correlationId: `del_${delivery.id}_${Date.now()}`, source: 'procurement', userId },
    });

    return {
      id: delivery.id,
      deliveryNumber: delivery.deliveryNumber,
      status: delivery.status,
      items: delivery.items.map(mapDeliveryItem),
      createdAt: delivery.createdAt.toISOString(),
    };
  }

  async update(id: string, input: UpdateDeliveryInput) {
    const existing = await prisma.delivery.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND);
    if (existing.status !== 'SCHEDULED') {
      throw new Error(ErrorCodes.PROCUREMENT_DELIVERY_CANNOT_MODIFY);
    }

    const delivery = await prisma.delivery.update({
      where: { id },
      data: {
        driverName: input.driverName ?? existing.driverName,
        driverPhone: input.driverPhone ?? existing.driverPhone,
        vehicleNumber: input.vehicleNumber ?? existing.vehicleNumber,
        scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : existing.scheduledDate,
        notes: input.notes ?? existing.notes,
      },
    });

    logger.info(`Delivery ${delivery.deliveryNumber} updated`);

    await eventBus.publish({
      name: buildEventName('Procurement', 'Delivery', 'Updated'),
      version: 1,
      payload: { deliveryId: delivery.id, deliveryNumber: delivery.deliveryNumber },
      metadata: { timestamp: new Date(), correlationId: `del_${delivery.id}_${Date.now()}`, source: 'procurement' },
    });

    return { id: delivery.id, deliveryNumber: delivery.deliveryNumber, status: delivery.status };
  }

  async delete(id: string) {
    const existing = await prisma.delivery.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND);
    if (existing.status !== 'SCHEDULED') {
      throw new Error(ErrorCodes.PROCUREMENT_DELIVERY_CANNOT_DELETE);
    }

    await prisma.deliveryItem.deleteMany({ where: { deliveryId: id } });
    await prisma.delivery.delete({ where: { id } });

    logger.info(`Delivery ${existing.deliveryNumber} deleted`);

    await eventBus.publish({
      name: buildEventName('Procurement', 'Delivery', 'Deleted'),
      version: 1,
      payload: { deliveryId: id, deliveryNumber: existing.deliveryNumber },
      metadata: { timestamp: new Date(), correlationId: `del_${id}_${Date.now()}`, source: 'procurement' },
    });
  }

  async dispatch(id: string) {
    const existing = await prisma.delivery.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND);

    const machine = new DeliveryStateMachine(existing.status);
    const newStatus = machine.transition('dispatch');

    const delivery = await prisma.delivery.update({
      where: { id },
      data: { status: newStatus as DeliveryStatus, dispatchedAt: new Date() },
    });

    logger.info(`Delivery ${delivery.deliveryNumber} dispatched`);

    await eventBus.publish({
      name: buildEventName('Procurement', 'Delivery', 'Dispatched'),
      version: 1,
      payload: { deliveryId: delivery.id, deliveryNumber: delivery.deliveryNumber },
      metadata: { timestamp: new Date(), correlationId: `del_${delivery.id}_${Date.now()}`, source: 'procurement' },
    });

    return { id: delivery.id, deliveryNumber: delivery.deliveryNumber, status: delivery.status };
  }

  async markInTransit(id: string) {
    const existing = await prisma.delivery.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND);

    const machine = new DeliveryStateMachine(existing.status);
    const newStatus = machine.transition('markInTransit');

    const delivery = await prisma.delivery.update({
      where: { id },
      data: { status: newStatus as DeliveryStatus },
    });

    logger.info(`Delivery ${delivery.deliveryNumber} in transit`);

    await eventBus.publish({
      name: buildEventName('Procurement', 'Delivery', 'InTransit'),
      version: 1,
      payload: { deliveryId: delivery.id, deliveryNumber: delivery.deliveryNumber },
      metadata: { timestamp: new Date(), correlationId: `del_${delivery.id}_${Date.now()}`, source: 'procurement' },
    });

    return { id: delivery.id, deliveryNumber: delivery.deliveryNumber, status: delivery.status };
  }

  async arrive(id: string) {
    const existing = await prisma.delivery.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND);

    const machine = new DeliveryStateMachine(existing.status);
    const newStatus = machine.transition('arrive');

    const delivery = await prisma.delivery.update({
      where: { id },
      data: { status: newStatus as DeliveryStatus, arrivedAt: new Date() },
    });

    logger.info(`Delivery ${delivery.deliveryNumber} arrived`);

    await eventBus.publish({
      name: buildEventName('Procurement', 'Delivery', 'Arrived'),
      version: 1,
      payload: { deliveryId: delivery.id, deliveryNumber: delivery.deliveryNumber },
      metadata: { timestamp: new Date(), correlationId: `del_${delivery.id}_${Date.now()}`, source: 'procurement' },
    });

    return { id: delivery.id, deliveryNumber: delivery.deliveryNumber, status: delivery.status };
  }

  async receive(id: string) {
    const existing = await prisma.delivery.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND);

    const machine = new DeliveryStateMachine(existing.status);
    const newStatus = machine.transition('receive');

    const delivery = await prisma.delivery.update({
      where: { id },
      data: { status: newStatus as DeliveryStatus },
    });

    logger.info(`Delivery ${delivery.deliveryNumber} partially received`);

    await eventBus.publish({
      name: buildEventName('Procurement', 'Delivery', 'Received'),
      version: 1,
      payload: { deliveryId: delivery.id, deliveryNumber: delivery.deliveryNumber },
      metadata: { timestamp: new Date(), correlationId: `del_${delivery.id}_${Date.now()}`, source: 'procurement' },
    });

    return { id: delivery.id, deliveryNumber: delivery.deliveryNumber, status: delivery.status };
  }

  async complete(id: string) {
    const existing = await prisma.delivery.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND);

    const machine = new DeliveryStateMachine(existing.status);
    const newStatus = machine.transition('complete');

    const delivery = await prisma.delivery.update({
      where: { id },
      data: { status: newStatus as DeliveryStatus },
    });

    logger.info(`Delivery ${delivery.deliveryNumber} completed`);

    await eventBus.publish({
      name: buildEventName('Procurement', 'Delivery', 'Completed'),
      version: 1,
      payload: { deliveryId: delivery.id, deliveryNumber: delivery.deliveryNumber },
      metadata: { timestamp: new Date(), correlationId: `del_${delivery.id}_${Date.now()}`, source: 'procurement' },
    });

    return { id: delivery.id, deliveryNumber: delivery.deliveryNumber, status: delivery.status };
  }

  async cancel(id: string) {
    const existing = await prisma.delivery.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND);

    const machine = new DeliveryStateMachine(existing.status);
    const newStatus = machine.transition('cancel');

    const delivery = await prisma.delivery.update({
      where: { id },
      data: { status: newStatus as DeliveryStatus },
    });

    logger.info(`Delivery ${delivery.deliveryNumber} cancelled`);

    await eventBus.publish({
      name: buildEventName('Procurement', 'Delivery', 'Cancelled'),
      version: 1,
      payload: { deliveryId: delivery.id, deliveryNumber: delivery.deliveryNumber },
      metadata: { timestamp: new Date(), correlationId: `del_${delivery.id}_${Date.now()}`, source: 'procurement' },
    });

    return { id: delivery.id, deliveryNumber: delivery.deliveryNumber, status: delivery.status };
  }
}
