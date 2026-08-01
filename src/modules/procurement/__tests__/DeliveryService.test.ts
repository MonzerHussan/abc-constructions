import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    delivery: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    deliveryItem: {
      deleteMany: vi.fn(),
    },
    purchaseOrder: {
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
import { DeliveryService } from '@/modules/procurement/services/DeliveryService';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

const service = new DeliveryService();

function mockDelivery(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'del-1',
    deliveryNumber: 'DEL-001',
    purchaseOrderId: 'po-1',
    supplierId: 'supplier-1',
    driverName: null,
    driverPhone: null,
    vehicleNumber: null,
    status: 'SCHEDULED',
    scheduledDate: null,
    dispatchedAt: null,
    arrivedAt: null,
    notes: null,
    createdById: 'user-1',
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    supplier: { id: 'supplier-1', name: 'Supplier A', companyName: 'SupCo' },
    createdBy: { id: 'user-1', name: 'User One' },
    _count: { items: 2 },
    items: [
      { id: 'di-1', deliveryId: 'del-1', poItemId: 'poi-1', quantity: 50, notes: null, createdAt: new Date('2026-07-01') },
      { id: 'di-2', deliveryId: 'del-1', poItemId: 'poi-2', quantity: 30, notes: 'fragile', createdAt: new Date('2026-07-01') },
    ],
    goodsReceipts: [
      { id: 'gr-1', receiptNumber: 'GR-001', status: 'PENDING' },
    ],
    ...overrides,
  };
}

function mockPO(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'po-1',
    poNumber: 'PO-001',
    supplierId: 'supplier-1',
    status: 'ISSUED',
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    quotationId: null,
    awardId: null,
    projectId: null,
    organizationId: null,
    createdById: 'user-1',
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
    items: [
      { id: 'poi-1', materialName: 'Steel', quantity: 100 },
      { id: 'poi-2', materialName: 'Cement', quantity: 50 },
    ],
    ...overrides,
  };
}

describe('DeliveryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated delivery summaries', async () => {
      const deliveries = [mockDelivery(), mockDelivery({ id: 'del-2', deliveryNumber: 'DEL-002' })];
      vi.mocked(prisma.delivery.findMany).mockResolvedValue(deliveries);
      vi.mocked(prisma.delivery.count).mockResolvedValue(2);

      const result = await service.list({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.items[0].deliveryNumber).toBe('DEL-001');
      expect(result.items[0].itemCount).toBe(2);
    });

    it('should filter by status', async () => {
      vi.mocked(prisma.delivery.findMany).mockResolvedValue([]);
      vi.mocked(prisma.delivery.count).mockResolvedValue(0);

      await service.list({ page: 1, limit: 20, status: 'SCHEDULED' });

      expect(prisma.delivery.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'SCHEDULED' }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return delivery detail', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(mockDelivery());

      const result = await service.findById('del-1');

      expect(result.deliveryNumber).toBe('DEL-001');
      expect(result.items).toHaveLength(2);
      expect(result.goodsReceipts).toHaveLength(1);
    });

    it('should throw NOT_FOUND if delivery does not exist', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(null);

      await expect(service.findById('bad-id')).rejects.toThrow(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND);
    });
  });

  describe('create', () => {
    it('should create delivery with items', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue(mockPO());
      vi.mocked(prisma.delivery.create).mockResolvedValue(mockDelivery());

      const result = await service.create({
        purchaseOrderId: 'po-1',
        supplierId: 'supplier-1',
        items: [
          { poItemId: 'poi-1', quantity: 50 },
          { poItemId: 'poi-2', quantity: 30 },
        ],
      }, 'user-1');

      expect(result.deliveryNumber).toBe('DEL-001');
      expect(result.status).toBe('SCHEDULED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw PO_NOT_FOUND if PO does not exist', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue(null);

      await expect(service.create({
        purchaseOrderId: 'bad-po',
        supplierId: 'supplier-1',
        items: [{ poItemId: 'poi-1', quantity: 50 }],
      }, 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_PO_NOT_FOUND);
    });

    it('should throw PO_NOT_FOUND for invalid item', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue(mockPO());

      await expect(service.create({
        purchaseOrderId: 'po-1',
        supplierId: 'supplier-1',
        items: [{ poItemId: 'invalid-item', quantity: 50 }],
      }, 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_PO_NOT_FOUND);
    });
  });

  describe('update', () => {
    it('should update delivery details', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(mockDelivery());
      vi.mocked(prisma.delivery.update).mockResolvedValue(mockDelivery({ driverName: 'John' }));

      const result = await service.update('del-1', { driverName: 'John' });

      expect(prisma.delivery.update).toHaveBeenCalledOnce();
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw NOT_FOUND if delivery does not exist', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(null);

      await expect(service.update('bad-id', { driverName: 'John' })).rejects.toThrow(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND);
    });

    it('should throw CANNOT_MODIFY if not SCHEDULED', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(mockDelivery({ status: 'DISPATCHED' }));

      await expect(service.update('del-1', { driverName: 'John' })).rejects.toThrow(ErrorCodes.PROCUREMENT_DELIVERY_CANNOT_MODIFY);
    });
  });

  describe('delete', () => {
    it('should delete delivery when SCHEDULED', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(mockDelivery());
      vi.mocked(prisma.deliveryItem.deleteMany).mockResolvedValue({ count: 2 });
      vi.mocked(prisma.delivery.delete).mockResolvedValue(mockDelivery());

      await service.delete('del-1');

      expect(prisma.deliveryItem.deleteMany).toHaveBeenCalledWith({ where: { deliveryId: 'del-1' } });
      expect(prisma.delivery.delete).toHaveBeenCalledWith({ where: { id: 'del-1' } });
    });

    it('should throw NOT_FOUND if delivery does not exist', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(null);

      await expect(service.delete('bad-id')).rejects.toThrow(ErrorCodes.PROCUREMENT_DELIVERY_NOT_FOUND);
    });

    it('should throw CANNOT_DELETE if not SCHEDULED', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(mockDelivery({ status: 'COMPLETED' }));

      await expect(service.delete('del-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_DELIVERY_CANNOT_DELETE);
    });
  });

  describe('dispatch', () => {
    it('should dispatch delivery', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(mockDelivery());
      vi.mocked(prisma.delivery.update).mockResolvedValue(mockDelivery({ status: 'DISPATCHED', dispatchedAt: new Date() }));

      const result = await service.dispatch('del-1');

      expect(result.status).toBe('DISPATCHED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });

  describe('markInTransit', () => {
    it('should mark delivery in transit', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(mockDelivery({ status: 'DISPATCHED' }));
      vi.mocked(prisma.delivery.update).mockResolvedValue(mockDelivery({ status: 'IN_TRANSIT' }));

      const result = await service.markInTransit('del-1');

      expect(result.status).toBe('IN_TRANSIT');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });

  describe('arrive', () => {
    it('should mark delivery arrived', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(mockDelivery({ status: 'IN_TRANSIT' }));
      vi.mocked(prisma.delivery.update).mockResolvedValue(mockDelivery({ status: 'ARRIVED', arrivedAt: new Date() }));

      const result = await service.arrive('del-1');

      expect(result.status).toBe('ARRIVED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });

  describe('receive', () => {
    it('should partially receive delivery', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(mockDelivery({ status: 'ARRIVED' }));
      vi.mocked(prisma.delivery.update).mockResolvedValue(mockDelivery({ status: 'PARTIALLY_RECEIVED' }));

      const result = await service.receive('del-1');

      expect(result.status).toBe('PARTIALLY_RECEIVED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });

  describe('complete', () => {
    it('should complete delivery from ARRIVED', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(mockDelivery({ status: 'ARRIVED' }));
      vi.mocked(prisma.delivery.update).mockResolvedValue(mockDelivery({ status: 'COMPLETED' }));

      const result = await service.complete('del-1');

      expect(result.status).toBe('COMPLETED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });

  describe('cancel', () => {
    it('should cancel delivery from SCHEDULED', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(mockDelivery());
      vi.mocked(prisma.delivery.update).mockResolvedValue(mockDelivery({ status: 'CANCELLED' }));

      const result = await service.cancel('del-1');

      expect(result.status).toBe('CANCELLED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw INVALID_TRANSITION from COMPLETED', async () => {
      vi.mocked(prisma.delivery.findUnique).mockResolvedValue(mockDelivery({ status: 'COMPLETED' }));

      await expect(service.cancel('del-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_DELIVERY_INVALID_TRANSITION);
    });
  });
});
