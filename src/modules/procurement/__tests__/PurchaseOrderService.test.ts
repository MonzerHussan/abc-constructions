import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    purchaseOrder: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    pOItem: {
      deleteMany: vi.fn(),
    },
    quotation: {
      findUnique: vi.fn(),
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
import { PurchaseOrderService } from '@/modules/procurement/services/PurchaseOrderService';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

const service = new PurchaseOrderService();

function mockPO(overrides: Record<string, unknown> = {}) {
  return {
    id: 'po-1',
    poNumber: 'PO-001',
    quotationId: null,
    awardId: null,
    projectId: null,
    organizationId: null,
    supplierId: 'supplier-1',
    createdById: 'user-1',
    status: 'DRAFT',
    subtotal: 5000,
    taxAmount: 0,
    totalAmount: 5000,
    orderDate: new Date('2026-07-01'),
    expectedDelivery: null,
    deliveryDate: null,
    deliveryAddress: null,
    deliveryInstructions: null,
    paymentTerms: null,
    notes: null,
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    supplier: { id: 'supplier-1', name: 'Supplier A', companyName: 'SupCo' },
    items: [
      { id: 'item-1', materialName: 'Steel', description: null, quantity: 100, unit: 'kg', unitPrice: 50, totalPrice: 5000, deliveredQuantity: 0, balanceQuantity: 100 },
    ],
    ...overrides,
  };
}

describe('PurchaseOrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated PO summaries', async () => {
      const pos = [mockPO(), mockPO({ id: 'po-2', poNumber: 'PO-002' })];
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValue(pos as never);
      vi.mocked(prisma.purchaseOrder.count).mockResolvedValue(2);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.items[0]).toHaveProperty('id');
      expect(result.items[0]).toHaveProperty('poNumber');
      expect(result.items[0]).toHaveProperty('status');
    });

    it('should filter by status', async () => {
      vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.purchaseOrder.count).mockResolvedValue(0);

      await service.list({ page: 1, limit: 10, status: 'DRAFT' });

      expect(prisma.purchaseOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'DRAFT' }) }),
      );
    });
  });

  describe('findById', () => {
    it('should return full PO detail', async () => {
      const po = mockPO();
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue(po as never);

      const result = await service.findById('po-1');

      expect(result.id).toBe('po-1');
      expect(result.poNumber).toBe('PO-001');
      expect(result.items).toHaveLength(1);
      expect(result.status).toBe('DRAFT');
    });

    it('should throw NOT_FOUND', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue(null);
      await expect(service.findById('missing')).rejects.toThrow(ErrorCodes.PROCUREMENT_PO_NOT_FOUND);
    });
  });

  describe('create', () => {
    const validInput = {
      poNumber: 'PO-100',
      supplierId: 'supplier-1',
      items: [{ materialName: 'Cement', quantity: 500, unit: 'bags', unitPrice: 20, totalPrice: 10000 }],
    };

    it('should create PO with items', async () => {
      const created = mockPO({ id: 'po-new', poNumber: 'PO-100' });
      vi.mocked(prisma.purchaseOrder.create).mockResolvedValue(created as never);

      const result = await service.create(validInput, 'user-1');

      expect(result.poNumber).toBe('PO-100');
      expect(result.status).toBe('DRAFT');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.PO.Created' }),
      );
    });

    it('should validate quotation supplier if quotationId provided', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({ id: 'q-1', status: 'ACCEPTED', supplierId: 'other-supplier' } as never);

      await expect(service.create({ ...validInput, quotationId: 'q-1' }, 'user-1')).rejects.toThrow(ErrorCodes.CORE_USER_FORBIDDEN);
    });

    it('should throw QUOTATION_NOT_FOUND if quotation missing', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(null);

      await expect(service.create({ ...validInput, quotationId: 'q-1' }, 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    });
  });

  describe('update', () => {
    it('should update PO in DRAFT status', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({ id: 'po-1', status: 'DRAFT', createdById: 'user-1', poNumber: 'PO-001' } as never);
      vi.mocked(prisma.purchaseOrder.update).mockResolvedValue(mockPO() as never);

      const result = await service.update('po-1', { notes: 'Updated notes' }, 'user-1');

      expect(result.status).toBe('DRAFT');
    });

    it('should throw FORBIDDEN if not creator', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({ id: 'po-1', status: 'DRAFT', createdById: 'user-2', poNumber: 'PO-001' } as never);

      await expect(service.update('po-1', { notes: 'Hacked' }, 'user-1')).rejects.toThrow(ErrorCodes.CORE_USER_FORBIDDEN);
    });

    it('should throw CANNOT_MODIFY if not DRAFT', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({ id: 'po-1', status: 'ISSUED', createdById: 'user-1', poNumber: 'PO-001' } as never);

      await expect(service.update('po-1', { notes: 'Nope' }, 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_PO_CANNOT_MODIFY);
    });
  });

  describe('delete', () => {
    it('should delete PO in DRAFT status', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({ id: 'po-1', status: 'DRAFT', createdById: 'user-1' } as never);
      vi.mocked(prisma.pOItem.deleteMany).mockResolvedValue({ count: 1 } as never);
      vi.mocked(prisma.purchaseOrder.delete).mockResolvedValue({} as never);

      await service.delete('po-1', 'user-1');

      expect(prisma.purchaseOrder.delete).toHaveBeenCalledWith({ where: { id: 'po-1' } });
    });

    it('should throw CANNOT_DELETE if not DRAFT', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({ id: 'po-1', status: 'ISSUED', createdById: 'user-1' } as never);

      await expect(service.delete('po-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_PO_CANNOT_DELETE);
    });
  });

  describe('issue', () => {
    it('should transition DRAFT -> ISSUED', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({ id: 'po-1', status: 'DRAFT', createdById: 'user-1', poNumber: 'PO-001', supplierId: 's-1' } as never);
      vi.mocked(prisma.purchaseOrder.update).mockResolvedValue(mockPO({ status: 'ISSUED' }) as never);

      const result = await service.issue('po-1', 'user-1');

      expect(result.status).toBe('ISSUED');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.PO.Issued' }),
      );
    });

    it('should throw FORBIDDEN if not creator', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({ id: 'po-1', status: 'DRAFT', createdById: 'user-2', poNumber: 'PO-001', supplierId: 's-1' } as never);

      await expect(service.issue('po-1', 'user-1')).rejects.toThrow(ErrorCodes.CORE_USER_FORBIDDEN);
    });

    it('should throw INVALID_TRANSITION if already issued', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({ id: 'po-1', status: 'ISSUED', createdById: 'user-1', poNumber: 'PO-001', supplierId: 's-1' } as never);

      await expect(service.issue('po-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION);
    });
  });

  describe('acknowledge', () => {
    it('should transition ISSUED -> ACKNOWLEDGED', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({ id: 'po-1', status: 'ISSUED', supplierId: 'supplier-1', poNumber: 'PO-001' } as never);
      vi.mocked(prisma.purchaseOrder.update).mockResolvedValue(mockPO({ status: 'ACKNOWLEDGED' }) as never);

      const result = await service.acknowledge('po-1', 'supplier-1');

      expect(result.status).toBe('ACKNOWLEDGED');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.PO.Acknowledged' }),
      );
    });

    it('should throw FORBIDDEN if not supplier', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({ id: 'po-1', status: 'ISSUED', supplierId: 'supplier-1', poNumber: 'PO-001' } as never);

      await expect(service.acknowledge('po-1', 'other-user')).rejects.toThrow(ErrorCodes.CORE_USER_FORBIDDEN);
    });
  });

  describe('cancel', () => {
    it('should transition ISSUED -> CANCELLED', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({ id: 'po-1', status: 'ISSUED', createdById: 'user-1', poNumber: 'PO-001', supplierId: 's-1' } as never);
      vi.mocked(prisma.purchaseOrder.update).mockResolvedValue(mockPO({ status: 'CANCELLED' }) as never);

      const result = await service.cancel('po-1', 'user-1');

      expect(result.status).toBe('CANCELLED');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.PO.Cancelled' }),
      );
    });

    it('should throw INVALID_TRANSITION for COMPLETED PO', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({ id: 'po-1', status: 'COMPLETED', createdById: 'user-1', poNumber: 'PO-001', supplierId: 's-1' } as never);

      await expect(service.cancel('po-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION);
    });
  });

  describe('complete', () => {
    it('should transition ACKNOWLEDGED -> COMPLETED when all delivered', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({
        id: 'po-1',
        status: 'ACKNOWLEDGED',
        createdById: 'user-1',
        poNumber: 'PO-001',
        items: [{ id: 'item-1', quantity: 100, deliveredQuantity: 100 }],
      } as never);
      vi.mocked(prisma.purchaseOrder.update).mockResolvedValue(mockPO({ status: 'COMPLETED' }) as never);

      const result = await service.complete('po-1', 'user-1');

      expect(result.status).toBe('COMPLETED');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.PO.Completed' }),
      );
    });

    it('should throw if not fully delivered', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({
        id: 'po-1',
        status: 'ACKNOWLEDGED',
        createdById: 'user-1',
        poNumber: 'PO-001',
        items: [{ id: 'item-1', quantity: 100, deliveredQuantity: 50 }],
      } as never);

      await expect(service.complete('po-1', 'user-1')).rejects.toThrow('PROCUREMENT_PO_NOT_FULLY_DELIVERED');
    });

    it('should throw INVALID_TRANSITION from DRAFT', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue({
        id: 'po-1',
        status: 'DRAFT',
        createdById: 'user-1',
        poNumber: 'PO-001',
        items: [{ id: 'item-1', quantity: 100, deliveredQuantity: 100 }],
      } as never);

      await expect(service.complete('po-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_PO_INVALID_TRANSITION);
    });
  });
});
