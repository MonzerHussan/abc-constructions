import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { InvoicingErrors } from '@/modules/shared/errors/invoicing.errors';
import { InvoiceStateMachine } from '@/modules/invoicing/workflow/state-machines/InvoiceStateMachine';
import { InvoiceEvents } from '@/modules/invoicing/events';
import type { InvoiceStatusType } from '@/modules/invoicing/workflow/state-machines/InvoiceStateMachine';
import type { CreateInvoiceInput, UpdateInvoiceInput, InvoiceListQuery, RejectInvoiceInput, MatchInvoiceInput } from '@/modules/invoicing/validators/invoice-schemas';
import type { InvoiceDTO, InvoiceMatchDTO, PaginatedResult } from '@/modules/invoicing/dto/invoice-dto';

function mapItem(i: { id: string; invoiceId: string; poItemId: string | null; deliveryItemId: string | null; description: string | null; quantity: number; unitPrice: number; totalPrice: number; taxRate: number }) {
  return { id: i.id, invoiceId: i.invoiceId, poItemId: i.poItemId, deliveryItemId: i.deliveryItemId, description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.totalPrice, taxRate: i.taxRate };
}

function mapInvoice(i: Record<string, unknown>, items?: unknown[], matches?: unknown[]): InvoiceDTO {
  return {
    id: i.id as string, invoiceNumber: i.invoiceNumber as string, purchaseOrderId: i.purchaseOrderId as string,
    supplierId: i.supplierId as string, buyerId: (i.buyerId as string) ?? null, status: i.status as string,
    invoiceDate: (i.invoiceDate as Date).toISOString(), dueDate: (i.dueDate as Date)?.toISOString() ?? null,
    amount: i.amount as number, taxAmount: i.taxAmount as number, totalAmount: i.totalAmount as number,
    paidAmount: i.paidAmount as number, balanceAmount: i.balanceAmount as number,
    attachment: (i.attachment as string) ?? null, notes: (i.notes as string) ?? null,
    submittedAt: (i.submittedAt as Date)?.toISOString() ?? null, verifiedAt: (i.verifiedAt as Date)?.toISOString() ?? null,
    matchedAt: (i.matchedAt as Date)?.toISOString() ?? null, authorizedAt: (i.authorizedAt as Date)?.toISOString() ?? null,
    createdAt: (i.createdAt as Date).toISOString(), updatedAt: (i.updatedAt as Date).toISOString(),
    items: (items ?? []) as InvoiceItemDTO[], matches: (matches ?? []) as InvoiceMatchDTO[],
  };
}

interface InvoiceItemDTO {
  id: string; invoiceId: string; poItemId: string | null; deliveryItemId: string | null;
  description: string | null; quantity: number; unitPrice: number; totalPrice: number; taxRate: number;
}

export class InvoicingService {
  async listInvoices(query: InvoiceListQuery): Promise<PaginatedResult<InvoiceDTO>> {
    const { page, limit, status, purchaseOrderId, supplierId } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (purchaseOrderId) where.purchaseOrderId = purchaseOrderId;
    if (supplierId) where.supplierId = supplierId;

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
        include: { items: true, matches: true },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      items: items.map((i) => mapInvoice(i, i.items, i.matches)),
      total, page, limit,
    };
  }

  async findInvoiceById(id: string): Promise<InvoiceDTO> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true, matches: true },
    });
    if (!invoice) throw new Error(InvoicingErrors.INVOICING_INVOICE_NOT_FOUND);
    return mapInvoice(invoice, invoice.items, invoice.matches);
  }

  async createInvoice(input: CreateInvoiceInput, userId: string): Promise<{ id: string; invoiceNumber: string; status: string }> {
    const po = await prisma.purchaseOrder.findUnique({ where: { id: input.purchaseOrderId } });
    if (!po) throw new Error(InvoicingErrors.INVOICING_PURCHASE_ORDER_NOT_FOUND);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        purchaseOrderId: input.purchaseOrderId,
        supplierId: input.supplierId,
        buyerId: userId,
        amount: input.amount,
        taxAmount: input.taxAmount,
        totalAmount: input.totalAmount,
        balanceAmount: input.totalAmount,
        invoiceDate: input.invoiceDate ? new Date(input.invoiceDate) : new Date(),
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        notes: input.notes ?? null,
        items: {
          create: input.items.map((item) => ({
            poItemId: item.poItemId,
            description: item.description ?? null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            taxRate: item.taxRate,
          })),
        },
      },
      include: { items: true },
    });

    logger.info(`Invoice ${invoice.invoiceNumber} created`);

    await eventBus.publish({
      name: InvoiceEvents.Created,
      version: 1,
      payload: { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber, poId: input.purchaseOrderId, totalAmount: input.totalAmount },
      metadata: { timestamp: new Date(), correlationId: `inv_${invoice.id}_${Date.now()}`, source: 'invoicing', userId },
    });

    return { id: invoice.id, invoiceNumber: invoice.invoiceNumber, status: invoice.status };
  }

  async updateInvoice(id: string, input: UpdateInvoiceInput, userId: string): Promise<{ id: string; status: string }> {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) throw new Error(InvoicingErrors.INVOICING_INVOICE_NOT_FOUND);
    if (existing.status !== 'DRAFT') throw new Error(InvoicingErrors.INVOICING_INVOICE_CANNOT_MODIFY);

    const data: Record<string, unknown> = {};
    if (input.amount !== undefined) data.amount = input.amount;
    if (input.taxAmount !== undefined) data.taxAmount = input.taxAmount;
    if (input.totalAmount !== undefined) { data.totalAmount = input.totalAmount; data.balanceAmount = input.totalAmount; }
    if (input.dueDate !== undefined) data.dueDate = new Date(input.dueDate);
    if (input.notes !== undefined) data.notes = input.notes;

    if (input.items) {
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await prisma.invoiceItem.createMany({
        data: input.items.map((item) => ({
          invoiceId: id, poItemId: item.poItemId, description: item.description ?? null,
          quantity: item.quantity, unitPrice: item.unitPrice, totalPrice: item.totalPrice, taxRate: item.taxRate,
        })),
      });
    }

    const invoice = await prisma.invoice.update({ where: { id }, data });
    return { id: invoice.id, status: invoice.status };
  }

  async submitInvoice(id: string, userId: string): Promise<{ id: string; status: string }> {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) throw new Error(InvoicingErrors.INVOICING_INVOICE_NOT_FOUND);

    const machine = new InvoiceStateMachine(existing.status);
    const newStatus = machine.transition('submit') as InvoiceStatusType;

    const invoice = await prisma.invoice.update({
      where: { id }, data: { status: newStatus, submittedAt: new Date() },
    });

    await eventBus.publish({
      name: InvoiceEvents.Submitted, version: 1,
      payload: { invoiceId: id, invoiceNumber: existing.invoiceNumber, poId: existing.purchaseOrderId },
      metadata: { timestamp: new Date(), correlationId: `inv_${id}_${Date.now()}`, source: 'invoicing', userId },
    });

    return { id: invoice.id, status: invoice.status };
  }

  async verifyInvoice(id: string, userId: string): Promise<{ id: string; status: string }> {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) throw new Error(InvoicingErrors.INVOICING_INVOICE_NOT_FOUND);

    const machine = new InvoiceStateMachine(existing.status);
    const newStatus = machine.transition('verify') as InvoiceStatusType;

    const invoice = await prisma.invoice.update({
      where: { id }, data: { status: newStatus, verifiedAt: new Date() },
    });

    await eventBus.publish({
      name: InvoiceEvents.Verified, version: 1,
      payload: { invoiceId: id, invoiceNumber: existing.invoiceNumber, poId: existing.purchaseOrderId },
      metadata: { timestamp: new Date(), correlationId: `inv_${id}_${Date.now()}`, source: 'invoicing', userId },
    });

    return { id: invoice.id, status: invoice.status };
  }

  async rejectInvoice(id: string, input: RejectInvoiceInput, userId: string): Promise<{ id: string; status: string }> {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) throw new Error(InvoicingErrors.INVOICING_INVOICE_NOT_FOUND);

    const machine = new InvoiceStateMachine(existing.status);
    const newStatus = machine.transition('reject') as InvoiceStatusType;

    const invoice = await prisma.invoice.update({
      where: { id }, data: { status: newStatus },
    });

    await eventBus.publish({
      name: InvoiceEvents.Rejected, version: 1,
      payload: { invoiceId: id, invoiceNumber: existing.invoiceNumber, poId: existing.purchaseOrderId, reason: input.reason },
      metadata: { timestamp: new Date(), correlationId: `inv_${id}_${Date.now()}`, source: 'invoicing', userId },
    });

    return { id: invoice.id, status: invoice.status };
  }

  async cancelInvoice(id: string, userId: string): Promise<{ id: string; status: string }> {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) throw new Error(InvoicingErrors.INVOICING_INVOICE_NOT_FOUND);

    const machine = new InvoiceStateMachine(existing.status);
    const newStatus = machine.transition('cancel') as InvoiceStatusType;

    const invoice = await prisma.invoice.update({
      where: { id }, data: { status: newStatus },
    });

    await eventBus.publish({
      name: InvoiceEvents.Cancelled, version: 1,
      payload: { invoiceId: id, invoiceNumber: existing.invoiceNumber, poId: existing.purchaseOrderId },
      metadata: { timestamp: new Date(), correlationId: `inv_${id}_${Date.now()}`, source: 'invoicing', userId },
    });

    return { id: invoice.id, status: invoice.status };
  }

  async approveInvoice(id: string, userId: string): Promise<{ id: string; status: string }> {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) throw new Error(InvoicingErrors.INVOICING_INVOICE_NOT_FOUND);
    if (existing.status !== 'MATCHED' && existing.status !== 'PARTIALLY_MATCHED') {
      throw new Error(InvoicingErrors.INVOICING_INVOICE_NOT_MATCHED);
    }

    const machine = new InvoiceStateMachine(existing.status);
    const newStatus = machine.transition('approve') as InvoiceStatusType;

    const invoice = await prisma.invoice.update({
      where: { id }, data: { status: newStatus },
    });

    await eventBus.publish({
      name: InvoiceEvents.Approved, version: 1,
      payload: { invoiceId: id, invoiceNumber: existing.invoiceNumber, poId: existing.purchaseOrderId },
      metadata: { timestamp: new Date(), correlationId: `inv_${id}_${Date.now()}`, source: 'invoicing', userId },
    });

    return { id: invoice.id, status: invoice.status };
  }

  async authorizeInvoice(id: string, userId: string): Promise<{ id: string; status: string }> {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) throw new Error(InvoicingErrors.INVOICING_INVOICE_NOT_FOUND);
    if (existing.status !== 'APPROVED') throw new Error(InvoicingErrors.INVOICING_CANNOT_AUTHORIZE);

    const machine = new InvoiceStateMachine(existing.status);
    const newStatus = machine.transition('authorize') as InvoiceStatusType;

    const invoice = await prisma.invoice.update({
      where: { id }, data: { status: newStatus, authorizedAt: new Date() },
    });

    await eventBus.publish({
      name: InvoiceEvents.Authorized, version: 1,
      payload: { invoiceId: id, invoiceNumber: existing.invoiceNumber, poId: existing.purchaseOrderId },
      metadata: { timestamp: new Date(), correlationId: `inv_${id}_${Date.now()}`, source: 'invoicing', userId },
    });

    return { id: invoice.id, status: invoice.status };
  }

  async matchInvoice(id: string, input: MatchInvoiceInput, userId: string): Promise<{ matchId: string; status: string }> {
    const existing = await prisma.invoice.findUnique({ where: { id }, include: { items: true } });
    if (!existing) throw new Error(InvoicingErrors.INVOICING_INVOICE_NOT_FOUND);
    if (existing.status !== 'VERIFIED') throw new Error(InvoicingErrors.INVOICING_INVOICE_CANNOT_MODIFY);

    const { referenceType, referenceId } = input;
    let varianceQuantity: number | null = null;
    let varianceAmount: number | null = null;
    let matchStatus: 'MATCHED' | 'MISMATCH' | 'PENDING' = 'PENDING';
    let poQuantity: number | null = null;
    let deliveryQuantity: number | null = null;
    let acceptedQuantity: number | null = null;
    let invoiceQuantity: number | null = null;
    let poAmount: number | null = null;
    let deliveryAmount: number | null = null;
    let invoiceAmount: number | null = null;
    let notes: string | null = null;

    const invoiceTotalQty = existing.items.reduce((sum, item) => sum + item.quantity, 0);
    invoiceQuantity = invoiceTotalQty;
    const invoiceSubtotal = existing.items.reduce((sum, item) => sum + item.totalPrice, 0);
    invoiceAmount = invoiceSubtotal;

    if (referenceType === 'PO') {
      const po = await prisma.purchaseOrder.findUnique({
        where: { id: referenceId },
        include: { items: true },
      });
      if (!po) throw new Error(InvoicingErrors.INVOICING_PURCHASE_ORDER_NOT_FOUND);

      poQuantity = po.items.reduce((sum, item) => sum + item.quantity, 0);
      poAmount = po.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

      varianceQuantity = invoiceQuantity - poQuantity;
      varianceAmount = (invoiceAmount ?? 0) - poAmount;
      matchStatus = varianceQuantity === 0 && varianceAmount === 0 ? 'MATCHED' : 'MISMATCH';
    } else if (referenceType === 'DELIVERY') {
      const delivery = await prisma.delivery.findUnique({
        where: { id: referenceId },
        include: { items: true },
      });
      if (!delivery) throw new Error(InvoicingErrors.INVOICING_MATCH_NOT_FOUND);

      deliveryQuantity = delivery.items.reduce((sum, item) => sum + item.quantity, 0);
      deliveryAmount = null;

      const poItems = await prisma.purchaseOrder.findUnique({
        where: { id: delivery.purchaseOrderId },
        select: { items: { select: { id: true, unitPrice: true, quantity: true } } },
      });
      if (poItems) {
        deliveryAmount = delivery.items.reduce((sum, item) => {
          const poItem = poItems.items.find((p) => p.id === item.poItemId);
          return sum + (poItem ? poItem.unitPrice * item.quantity : 0);
        }, 0);
      }

      varianceQuantity = invoiceQuantity - deliveryQuantity;
      varianceAmount = deliveryAmount !== null ? (invoiceAmount ?? 0) - deliveryAmount : null;
      matchStatus = varianceQuantity === 0 && (varianceAmount === null || varianceAmount === 0) ? 'MATCHED' : 'MISMATCH';
    } else if (referenceType === 'INSPECTION') {
      const inspection = await prisma.inspection.findUnique({
        where: { id: referenceId },
        include: { items: { include: { deliveryItem: { select: { quantity: true, poItemId: true } } } } },
      });
      if (!inspection) throw new Error(InvoicingErrors.INVOICING_MATCH_NOT_FOUND);

      acceptedQuantity = inspection.items
        .filter((item) => item.result === 'PASS')
        .reduce((sum, item) => sum + (item.deliveryItem?.quantity ?? 0), 0);

      varianceQuantity = invoiceQuantity - acceptedQuantity;
      matchStatus = varianceQuantity === 0 ? 'MATCHED' : 'MISMATCH';
    }

    const match = await prisma.invoiceMatch.upsert({
      where: { invoiceId_referenceType_referenceId: { invoiceId: id, referenceType, referenceId } },
      update: { status: matchStatus, poQuantity, deliveryQuantity, acceptedQuantity, invoiceQuantity, poAmount, deliveryAmount, invoiceAmount, varianceQuantity, varianceAmount, notes, matchedAt: matchStatus === 'MATCHED' ? new Date() : null },
      create: { invoiceId: id, referenceType, referenceId, status: matchStatus, poQuantity, deliveryQuantity, acceptedQuantity, invoiceQuantity, poAmount, deliveryAmount, invoiceAmount, varianceQuantity, varianceAmount, notes, matchedAt: matchStatus === 'MATCHED' ? new Date() : null },
    });

    if (matchStatus === 'MISMATCH') {
      notes = `Mismatch detected: qty variance=${varianceQuantity}, amount variance=${varianceAmount}`;
      logger.warn(`Invoice ${existing.invoiceNumber} mismatch with ${referenceType} ${referenceId}`, { varianceQuantity, varianceAmount });
    }

    await eventBus.publish({
      name: matchStatus === 'MATCHED' ? InvoiceEvents.Matched : InvoiceEvents.PartiallyMatched,
      version: 1,
      payload: { invoiceId: id, invoiceNumber: existing.invoiceNumber, referenceType, referenceId, matchStatus, varianceQuantity, varianceAmount },
      metadata: { timestamp: new Date(), correlationId: `inv_${id}_${Date.now()}`, source: 'invoicing', userId },
    });

    const allMatches = await prisma.invoiceMatch.findMany({ where: { invoiceId: id } });
    const anyMismatch = allMatches.some((m) => m.status === 'MISMATCH');
    const allMatched = allMatches.every((m) => m.status === 'MATCHED') && allMatches.length > 0;

    if (allMatched && existing.status === 'VERIFIED') {
      await prisma.invoice.update({ where: { id }, data: { status: 'MATCHED', matchedAt: new Date() } });
    } else if (anyMismatch && existing.status === 'VERIFIED') {
      await prisma.invoice.update({ where: { id }, data: { status: 'PARTIALLY_MATCHED' } });
    }

    return { matchId: match.id, status: matchStatus };
  }

  async getMatches(id: string): Promise<InvoiceMatchDTO[]> {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) throw new Error(InvoicingErrors.INVOICING_INVOICE_NOT_FOUND);

    const matches = await prisma.invoiceMatch.findMany({ where: { invoiceId: id }, orderBy: { createdAt: 'desc' } });
    return matches.map((m) => ({
      id: m.id, invoiceId: m.invoiceId, referenceType: m.referenceType, referenceId: m.referenceId,
      status: m.status, poQuantity: m.poQuantity, deliveryQuantity: m.deliveryQuantity,
      acceptedQuantity: m.acceptedQuantity, invoiceQuantity: m.invoiceQuantity,
      poAmount: m.poAmount, deliveryAmount: m.deliveryAmount, invoiceAmount: m.invoiceAmount,
      varianceQuantity: m.varianceQuantity, varianceAmount: m.varianceAmount,
      notes: m.notes, matchedAt: m.matchedAt?.toISOString() ?? null, createdAt: m.createdAt.toISOString(),
    }));
  }
}