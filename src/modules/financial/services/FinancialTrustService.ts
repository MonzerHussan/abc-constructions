import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';
import { FinancialTrustStateMachine } from '@/modules/financial/workflow/state-machines/FinancialTrustStateMachine';
import type { PaymentStatus } from '@/modules/financial/workflow/state-machines/FinancialTrustStateMachine';
import type { CreateReservationInput, ReservationListQuery, HoldReservationInput, ReleaseFundsInput, RefundFundsInput, CancelReservationInput } from '@/modules/financial/validators/financial-schemas';

function mapRelease(r: { id: string; reservationId: string; amount: number; type: string; notes: string | null; releasedById: string; releasedAt: Date; createdAt: Date }) {
  return {
    id: r.id,
    reservationId: r.reservationId,
    amount: r.amount,
    type: r.type,
    notes: r.notes,
    releasedById: r.releasedById,
    releasedAt: r.releasedAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
  };
}

export class FinancialTrustService {
  async listReservations(query: ReservationListQuery) {
    const { page, limit, status, purchaseOrderId, supplierId } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (purchaseOrderId) where.purchaseOrderId = purchaseOrderId;
    if (supplierId) where.supplierId = supplierId;
    const orderBy = { createdAt: 'desc' as const };

    const [items, total] = await Promise.all([
      prisma.paymentReservation.findMany({
        where,
        include: { _count: { select: { releases: true } } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.paymentReservation.count({ where }),
    ]);

    type ReservationItem = {
      id: string;
      reservationNumber: string;
      purchaseOrderId: string | null;
      buyerId: string | null;
      supplierId: string | null;
      totalAmount: number;
      heldAmount: number;
      releasedAmount: number;
      currency: string;
      status: string;
      notes: string | null;
      createdAt: Date;
      _count: { releases: number };
    };

    return {
      items: items.map((r: ReservationItem) => ({
        id: r.id, reservationNumber: r.reservationNumber, purchaseOrderId: r.purchaseOrderId,
        supplierId: r.supplierId, totalAmount: r.totalAmount, heldAmount: r.heldAmount,
        releasedAmount: r.releasedAmount, currency: r.currency, status: r.status,
        notes: r.notes, createdAt: r.createdAt.toISOString(),
      })),
      total, page, limit,
    };
  }

  async findReservationById(id: string) {
    const reservation = await prisma.paymentReservation.findUnique({
      where: { id },
      include: {
        releases: { include: { releasedBy: { select: { id: true, name: true } } } },
      },
    });
    if (!reservation) throw new Error(ErrorCodes.FINANCIAL_RESERVATION_NOT_FOUND);

    return {
      id: reservation.id, reservationNumber: reservation.reservationNumber,
      purchaseOrderId: reservation.purchaseOrderId, supplierId: reservation.supplierId,
      buyerId: reservation.buyerId, totalAmount: reservation.totalAmount,
      heldAmount: reservation.heldAmount, releasedAmount: reservation.releasedAmount,
      currency: reservation.currency, status: reservation.status,
      notes: reservation.notes,
      releases: reservation.releases.map(mapRelease),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
    };
  }

  async createReservation(input: CreateReservationInput, userId: string) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id: input.purchaseOrderId } });
    if (!po) throw new Error(ErrorCodes.PROCUREMENT_PO_NOT_FOUND);

    const reservation = await prisma.paymentReservation.create({
      data: {
        reservationNumber: `RES-${Date.now()}`,
        purchaseOrderId: input.purchaseOrderId,
        supplierId: input.supplierId,
        buyerId: userId,
        totalAmount: input.totalAmount,
        currency: input.currency,
        notes: input.notes ?? null,
      },
    });

    logger.info(`Payment reservation ${reservation.reservationNumber} created`);

    await eventBus.publish({
      name: buildEventName('Financial', 'Reservation', 'Created'),
      version: 1,
      payload: { reservationId: reservation.id, reservationNumber: reservation.reservationNumber, poId: input.purchaseOrderId, amount: input.totalAmount, currency: input.currency },
      metadata: { timestamp: new Date(), correlationId: `res_${reservation.id}_${Date.now()}`, source: 'financial', userId },
    });

    return { id: reservation.id, reservationNumber: reservation.reservationNumber, status: reservation.status };
  }

  async holdReservation(id: string, input: HoldReservationInput, userId: string) {
    const existing = await prisma.paymentReservation.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.FINANCIAL_RESERVATION_NOT_FOUND);

    if (input.amount > existing.totalAmount) {
      throw new Error(ErrorCodes.FINANCIAL_RESERVATION_EXCEEDS_TOTAL);
    }

    const machine = new FinancialTrustStateMachine(existing.status);
    const newStatus = machine.transition('hold') as PaymentStatus;

    const reservation = await prisma.paymentReservation.update({
      where: { id },
      data: { status: newStatus, heldAmount: input.amount },
    });

    await eventBus.publish({
      name: buildEventName('Financial', 'Reservation', 'Held'),
      version: 1,
      payload: { reservationId: id, reservationNumber: existing.reservationNumber, poId: existing.purchaseOrderId, amount: input.amount },
      metadata: { timestamp: new Date(), correlationId: `res_${id}_${Date.now()}`, source: 'financial', userId },
    });

    return { id: reservation.id, reservationNumber: reservation.reservationNumber, status: reservation.status, heldAmount: reservation.heldAmount };
  }

  async releaseFunds(id: string, input: ReleaseFundsInput, userId: string) {
    const existing = await prisma.paymentReservation.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.FINANCIAL_RESERVATION_NOT_FOUND);

    const newHeldAmount = existing.heldAmount - input.amount;
    if (newHeldAmount < 0) {
      throw new Error(ErrorCodes.FINANCIAL_INSUFFICIENT_HELD);
    }

    const machine = new FinancialTrustStateMachine(existing.status);
    const newStatus = machine.transition('release') as PaymentStatus;
    const isReleased = newHeldAmount === 0 && existing.releasedAmount + input.amount === existing.totalAmount;
    const finalStatus = isReleased ? 'RELEASED' as PaymentStatus : newStatus;

    const reservation = await prisma.paymentReservation.update({
      where: { id },
      data: { status: finalStatus, heldAmount: newHeldAmount, releasedAmount: existing.releasedAmount + input.amount },
    });

    await prisma.paymentRelease.create({
      data: { reservationId: id, amount: input.amount, type: isReleased ? 'FULL' : 'PARTIAL', notes: input.notes ?? null, releasedById: userId },
    });

    const eventAction = isReleased ? 'Released' : 'PartiallyReleased';
    await eventBus.publish({
      name: buildEventName('Financial', 'Reservation', eventAction),
      version: 1,
      payload: { reservationId: id, reservationNumber: existing.reservationNumber, poId: existing.purchaseOrderId, releasedAmount: input.amount, heldAmount: newHeldAmount },
      metadata: { timestamp: new Date(), correlationId: `res_${id}_${Date.now()}`, source: 'financial', userId },
    });

    return { id: reservation.id, reservationNumber: reservation.reservationNumber, status: reservation.status, heldAmount: reservation.heldAmount, releasedAmount: reservation.releasedAmount };
  }

  async refundFunds(id: string, input: RefundFundsInput, userId: string) {
    const existing = await prisma.paymentReservation.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.FINANCIAL_RESERVATION_NOT_FOUND);

    const machine = new FinancialTrustStateMachine(existing.status);
    const newStatus = machine.transition('refund') as PaymentStatus;

    const reservation = await prisma.paymentReservation.update({
      where: { id },
      data: { status: newStatus, heldAmount: 0 },
    });

    await prisma.paymentRelease.create({
      data: { reservationId: id, amount: input.amount, type: 'REFUND', notes: input.notes ?? null, releasedById: userId },
    });

    logger.info(`Payment reservation ${existing.reservationNumber} refunded`);

    await eventBus.publish({
      name: buildEventName('Financial', 'Reservation', 'Refunded'),
      version: 1,
      payload: { reservationId: id, reservationNumber: existing.reservationNumber, poId: existing.purchaseOrderId, amount: input.amount },
      metadata: { timestamp: new Date(), correlationId: `res_${id}_${Date.now()}`, source: 'financial', userId },
    });

    return { id: reservation.id, reservationNumber: reservation.reservationNumber, status: reservation.status };
  }

  async cancelReservation(id: string, input: CancelReservationInput, userId: string) {
    const existing = await prisma.paymentReservation.findUnique({ where: { id } });
    if (!existing) throw new Error(ErrorCodes.FINANCIAL_RESERVATION_NOT_FOUND);

    const machine = new FinancialTrustStateMachine(existing.status);
    const newStatus = machine.transition('cancel') as PaymentStatus;

    const reservation = await prisma.paymentReservation.update({
      where: { id },
      data: { status: newStatus, heldAmount: 0 },
    });

    logger.info(`Payment reservation ${existing.reservationNumber} cancelled`);

    await eventBus.publish({
      name: buildEventName('Financial', 'Reservation', 'Cancelled'),
      version: 1,
      payload: { reservationId: id, reservationNumber: existing.reservationNumber, poId: existing.purchaseOrderId, reason: input.reason },
      metadata: { timestamp: new Date(), correlationId: `res_${id}_${Date.now()}`, source: 'financial', userId },
    });

    return { id: reservation.id, reservationNumber: reservation.reservationNumber, status: reservation.status };
  }
}
