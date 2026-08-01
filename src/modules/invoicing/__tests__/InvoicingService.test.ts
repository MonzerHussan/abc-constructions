import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    invoice: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    invoiceItem: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    invoiceMatch: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    purchaseOrder: {
      findUnique: vi.fn(),
    },
    delivery: {
      findUnique: vi.fn(),
    },
    inspection: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/modules/shared/events/event-bus', () => ({
  eventBus: { publish: vi.fn() },
}));

vi.mock('@/modules/shared/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

import { prisma } from '@/lib/prisma';
import { eventBus } from '@/modules/shared/events/event-bus';
import { InvoicingService } from '@/modules/invoicing/services/InvoicingService';
import { InvoicingErrors } from '@/modules/shared/errors/invoicing.errors';

const service = new InvoicingService();

function mockInvoice(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'inv-1',
    invoiceNumber: 'INV-001',
    purchaseOrderId: 'po-1',
    supplierId: 'supplier-1',
    buyerId: 'user-1',
    status: 'DRAFT',
    invoiceDate: new Date('2026-07-01'),
    dueDate: null,
    amount: 10000,
    taxAmount: 1500,
    totalAmount: 11500,
    paidAmount: 0,
    balanceAmount: 11500,
    attachment: null,
    notes: null,
    submittedAt: null,
    verifiedAt: null,
    matchedAt: null,
    authorizedAt: null,
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    items: [{
      id: 'item-1', invoiceId: 'inv-1', poItemId: 'po-item-1',
      deliveryItemId: null, description: 'Test item', quantity: 10,
      unitPrice: 1000, totalPrice: 10000, taxRate: 0,
    }],
    matches: [],
    ...overrides,
  };
}

function mockPO(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'po-1',
    poNumber: 'PO-001',
    supplierId: 'supplier-1',
    status: 'ISSUED',
    totalAmount: 11500,
    items: [{ id: 'po-item-1', quantity: 10, unitPrice: 1000, totalPrice: 10000 }],
    ...overrides,
  };
}

function mockDelivery(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'del-1',
    deliveryNumber: 'DEL-001',
    purchaseOrderId: 'po-1',
    items: [{ id: 'del-item-1', poItemId: 'po-item-1', quantity: 10 }],
    ...overrides,
  };
}

function mockInspection(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'insp-1',
    inspectionNumber: 'INSP-001',
    items: [{ id: 'insp-item-1', result: 'PASS', deliveryItem: { quantity: 10, poItemId: 'po-item-1' } }],
    ...overrides,
  };
}

describe('InvoicingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listInvoices', () => {
    it('should return paginated invoices', async () => {
      vi.mocked(prisma.invoice.findMany).mockResolvedValue([mockInvoice()]);
      vi.mocked(prisma.invoice.count).mockResolvedValue(1);

      const result = await service.listInvoices({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findInvoiceById', () => {
    it('should return invoice detail', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice());

      const result = await service.findInvoiceById('inv-1');

      expect(result.invoiceNumber).toBe('INV-001');
    });

    it('should throw NOT_FOUND', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(null);

      await expect(service.findInvoiceById('bad-id')).rejects.toThrow(InvoicingErrors.INVOICING_INVOICE_NOT_FOUND);
    });
  });

  describe('createInvoice', () => {
    it('should create invoice with items', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue(mockPO());
      vi.mocked(prisma.invoice.create).mockResolvedValue(mockInvoice());

      const result = await service.createInvoice({
        purchaseOrderId: 'po-1',
        supplierId: 'supplier-1',
        amount: 10000,
        taxAmount: 1500,
        totalAmount: 11500,
        items: [{ poItemId: 'po-item-1', quantity: 10, unitPrice: 1000, totalPrice: 10000, taxRate: 0 }],
      }, 'user-1');

      expect(result.invoiceNumber).toBe('INV-001');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw if purchase order not found', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue(null);

      await expect(service.createInvoice({
        purchaseOrderId: 'bad-po',
        supplierId: 'supplier-1',
        amount: 10000, taxAmount: 0, totalAmount: 10000,
        items: [{ poItemId: 'item-1', quantity: 1, unitPrice: 10000, totalPrice: 10000, taxRate: 0 }],
      }, 'user-1')).rejects.toThrow(InvoicingErrors.INVOICING_PURCHASE_ORDER_NOT_FOUND);
    });
  });

  describe('updateInvoice', () => {
    it('should update invoice in DRAFT status', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice());
      vi.mocked(prisma.invoice.update).mockResolvedValue(mockInvoice({ notes: 'Updated' }));

      const result = await service.updateInvoice('inv-1', { notes: 'Updated' }, 'user-1');

      expect(result.status).toBe('DRAFT');
    });

    it('should throw if not DRAFT', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice({ status: 'SUBMITTED' }));

      await expect(service.updateInvoice('inv-1', { notes: 'Updated' }, 'user-1')).rejects.toThrow(InvoicingErrors.INVOICING_INVOICE_CANNOT_MODIFY);
    });
  });

  describe('submitInvoice', () => {
    it('should transition from DRAFT to SUBMITTED', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice());
      vi.mocked(prisma.invoice.update).mockResolvedValue(mockInvoice({ status: 'SUBMITTED', submittedAt: new Date() }));

      const result = await service.submitInvoice('inv-1', 'user-1');

      expect(result.status).toBe('SUBMITTED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });

  describe('verifyInvoice', () => {
    it('should transition from SUBMITTED to VERIFIED', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice({ status: 'SUBMITTED' }));
      vi.mocked(prisma.invoice.update).mockResolvedValue(mockInvoice({ status: 'VERIFIED', verifiedAt: new Date() }));

      const result = await service.verifyInvoice('inv-1', 'user-1');

      expect(result.status).toBe('VERIFIED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });

  describe('rejectInvoice', () => {
    it('should transition to REJECTED', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice({ status: 'SUBMITTED' }));
      vi.mocked(prisma.invoice.update).mockResolvedValue(mockInvoice({ status: 'REJECTED' }));

      const result = await service.rejectInvoice('inv-1', { reason: 'Invalid items' }, 'user-1');

      expect(result.status).toBe('REJECTED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });

  describe('cancelInvoice', () => {
    it('should transition to CANCELLED', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice());
      vi.mocked(prisma.invoice.update).mockResolvedValue(mockInvoice({ status: 'CANCELLED' }));

      const result = await service.cancelInvoice('inv-1', 'user-1');

      expect(result.status).toBe('CANCELLED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });

  describe('approveInvoice', () => {
    it('should transition from MATCHED to APPROVED', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice({ status: 'MATCHED' }));
      vi.mocked(prisma.invoice.update).mockResolvedValue(mockInvoice({ status: 'APPROVED' }));

      const result = await service.approveInvoice('inv-1', 'user-1');

      expect(result.status).toBe('APPROVED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw if not matched', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice({ status: 'DRAFT' }));

      await expect(service.approveInvoice('inv-1', 'user-1')).rejects.toThrow(InvoicingErrors.INVOICING_INVOICE_NOT_MATCHED);
    });
  });

  describe('authorizeInvoice', () => {
    it('should transition from APPROVED to AUTHORIZED', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice({ status: 'APPROVED' }));
      vi.mocked(prisma.invoice.update).mockResolvedValue(mockInvoice({ status: 'AUTHORIZED', authorizedAt: new Date() }));

      const result = await service.authorizeInvoice('inv-1', 'user-1');

      expect(result.status).toBe('AUTHORIZED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw if not APPROVED', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice({ status: 'DRAFT' }));

      await expect(service.authorizeInvoice('inv-1', 'user-1')).rejects.toThrow(InvoicingErrors.INVOICING_CANNOT_AUTHORIZE);
    });
  });

  describe('matchInvoice', () => {
    it('should match invoice against PO', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice({ status: 'VERIFIED' }));
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue(mockPO());
      vi.mocked(prisma.invoiceMatch.upsert).mockResolvedValue({ id: 'match-1', status: 'MATCHED' } as any);
      vi.mocked(prisma.invoiceMatch.findMany).mockResolvedValue([{ id: 'match-1', status: 'MATCHED' }] as any);
      vi.mocked(prisma.invoice.update).mockResolvedValue(mockInvoice({ status: 'MATCHED', matchedAt: new Date() }));

      const result = await service.matchInvoice('inv-1', { referenceType: 'PO', referenceId: 'po-1' }, 'user-1');

      expect(result.status).toBe('MATCHED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should detect mismatch', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice({ status: 'VERIFIED' }));
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue(mockPO({ items: [{ id: 'po-item-1', quantity: 5, unitPrice: 1000, totalPrice: 5000 }] }));
      vi.mocked(prisma.invoiceMatch.upsert).mockResolvedValue({ id: 'match-1', status: 'MISMATCH' } as any);
      vi.mocked(prisma.invoiceMatch.findMany).mockResolvedValue([{ id: 'match-1', status: 'MISMATCH' }] as any);
      vi.mocked(prisma.invoice.update).mockResolvedValue(mockInvoice({ status: 'PARTIALLY_MATCHED' }));

      const result = await service.matchInvoice('inv-1', { referenceType: 'PO', referenceId: 'po-1' }, 'user-1');

      expect(result.status).toBe('MISMATCH');
    });

    it('should match invoice against delivery', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice({ status: 'VERIFIED' }));
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(mockDelivery());
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue(mockPO());
      vi.mocked(prisma.invoiceMatch.upsert).mockResolvedValue({ id: 'match-1', status: 'MATCHED' } as any);
      vi.mocked(prisma.invoiceMatch.findMany).mockResolvedValue([{ id: 'match-1', status: 'MATCHED' }] as any);
      vi.mocked(prisma.invoice.update).mockResolvedValue(mockInvoice({ status: 'MATCHED', matchedAt: new Date() }));

      const result = await service.matchInvoice('inv-1', { referenceType: 'DELIVERY', referenceId: 'del-1' }, 'user-1');

      expect(result.status).toBe('MATCHED');
    });

    it('should match invoice against inspection', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice({ status: 'VERIFIED' }));
      vi.mocked(prisma.inspection.findUnique).mockResolvedValue(mockInspection());
      vi.mocked(prisma.invoiceMatch.upsert).mockResolvedValue({ id: 'match-1', status: 'MATCHED' } as any);
      vi.mocked(prisma.invoiceMatch.findMany).mockResolvedValue([{ id: 'match-1', status: 'MATCHED' }] as any);
      vi.mocked(prisma.invoice.update).mockResolvedValue(mockInvoice({ status: 'MATCHED', matchedAt: new Date() }));

      const result = await service.matchInvoice('inv-1', { referenceType: 'INSPECTION', referenceId: 'insp-1' }, 'user-1');

      expect(result.status).toBe('MATCHED');
    });

    it('should throw if invoice not found', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(null);

      await expect(service.matchInvoice('bad-id', { referenceType: 'PO', referenceId: 'po-1' }, 'user-1')).rejects.toThrow(InvoicingErrors.INVOICING_INVOICE_NOT_FOUND);
    });
  });

  describe('getMatches', () => {
    it('should return match results', async () => {
      vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice());
      vi.mocked(prisma.invoiceMatch.findMany).mockResolvedValue([{
        id: 'match-1', invoiceId: 'inv-1', referenceType: 'PO', referenceId: 'po-1',
        status: 'MATCHED', poQuantity: 10, deliveryQuantity: null, acceptedQuantity: null,
        invoiceQuantity: 10, poAmount: 10000, deliveryAmount: null, invoiceAmount: 11500,
        varianceQuantity: 0, varianceAmount: 1500, notes: null, matchedAt: new Date(), createdAt: new Date(),
      }] as any);

      const result = await service.getMatches('inv-1');

      expect(result).toHaveLength(1);
      expect(result[0].referenceType).toBe('PO');
      expect(result[0].status).toBe('MATCHED');
    });
  });
});