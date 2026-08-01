import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    paymentReservation: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    paymentRelease: {
      create: vi.fn(),
    },
    purchaseOrder: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/modules/shared/events/event-bus', () => ({
  eventBus: { publish: vi.fn() },
}));

vi.mock('@/modules/shared/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

import { prisma } from '@/lib/prisma';
import { eventBus } from '@/modules/shared/events/event-bus';
import { FinancialTrustService } from '@/modules/financial/services/FinancialTrustService';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

const service = new FinancialTrustService();

function mockReservation(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'res-1',
    reservationNumber: 'RES-001',
    purchaseOrderId: 'po-1',
    supplierId: 'supplier-1',
    buyerId: 'user-1',
    totalAmount: 10000,
    heldAmount: 0,
    releasedAmount: 0,
    currency: 'SAR',
    status: 'RESERVED',
    notes: null,
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    _count: { releases: 0 },
    releases: [],
    ...overrides,
  };
}

function mockPO(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'po-1',
    poNumber: 'PO-001',
    supplierId: 'supplier-1',
    status: 'ISSUED',
    totalAmount: 10000,
    ...overrides,
  };
}

describe('FinancialTrustService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listReservations', () => {
    it('should return paginated reservations', async () => {
      vi.mocked(prisma.paymentReservation.findMany).mockResolvedValue([mockReservation()]);
      vi.mocked(prisma.paymentReservation.count).mockResolvedValue(1);

      const result = await service.listReservations({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findReservationById', () => {
    it('should return reservation detail', async () => {
      vi.mocked(prisma.paymentReservation.findUnique).mockResolvedValue(mockReservation());

      const result = await service.findReservationById('res-1');

      expect(result.reservationNumber).toBe('RES-001');
    });

    it('should throw NOT_FOUND', async () => {
      vi.mocked(prisma.paymentReservation.findUnique).mockResolvedValue(null);

      await expect(service.findReservationById('bad-id')).rejects.toThrow(ErrorCodes.FINANCIAL_RESERVATION_NOT_FOUND);
    });
  });

  describe('createReservation', () => {
    it('should create reservation', async () => {
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValue(mockPO());
      vi.mocked(prisma.paymentReservation.create).mockResolvedValue(mockReservation());

      const result = await service.createReservation({
        purchaseOrderId: 'po-1',
        supplierId: 'supplier-1',
        totalAmount: 10000,
        currency: 'SAR',
      }, 'user-1');

      expect(result.reservationNumber).toBe('RES-001');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });

  describe('holdReservation', () => {
    it('should hold reservation', async () => {
      vi.mocked(prisma.paymentReservation.findUnique).mockResolvedValue(mockReservation());
      vi.mocked(prisma.paymentReservation.update).mockResolvedValue(mockReservation({ status: 'HELD', heldAmount: 5000 }));

      const result = await service.holdReservation('res-1', { amount: 5000 }, 'user-1');

      expect(result.status).toBe('HELD');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should reject amount exceeding total', async () => {
      vi.mocked(prisma.paymentReservation.findUnique).mockResolvedValue(mockReservation());

      await expect(service.holdReservation('res-1', { amount: 20000 }, 'user-1')).rejects.toThrow(ErrorCodes.FINANCIAL_RESERVATION_EXCEEDS_TOTAL);
    });
  });

  describe('releaseFunds', () => {
    it('should release funds partially', async () => {
      vi.mocked(prisma.paymentReservation.findUnique).mockResolvedValue(mockReservation({ status: 'HELD', heldAmount: 5000 }));
      vi.mocked(prisma.paymentReservation.update).mockResolvedValue(mockReservation({ status: 'PARTIALLY_RELEASED', heldAmount: 2500, releasedAmount: 2500 }));
      vi.mocked(prisma.paymentRelease.create).mockResolvedValue({} as any);

      const result = await service.releaseFunds('res-1', { amount: 2500 }, 'user-1');

      expect(result.status).toBe('PARTIALLY_RELEASED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should release fully when held goes to zero', async () => {
      vi.mocked(prisma.paymentReservation.findUnique).mockResolvedValue(mockReservation({ status: 'HELD', heldAmount: 10000 }));
      vi.mocked(prisma.paymentReservation.update).mockResolvedValue(mockReservation({ status: 'RELEASED', heldAmount: 0, releasedAmount: 10000 }));
      vi.mocked(prisma.paymentRelease.create).mockResolvedValue({} as any);

      const result = await service.releaseFunds('res-1', { amount: 10000 }, 'user-1');

      expect(result.status).toBe('RELEASED');
    });

    it('should reject exceeding held amount', async () => {
      vi.mocked(prisma.paymentReservation.findUnique).mockResolvedValue(mockReservation({ status: 'HELD', heldAmount: 3000 }));

      await expect(service.releaseFunds('res-1', { amount: 5000 }, 'user-1')).rejects.toThrow(ErrorCodes.FINANCIAL_INSUFFICIENT_HELD);
    });
  });

  describe('refundFunds', () => {
    it('should refund reservation', async () => {
      vi.mocked(prisma.paymentReservation.findUnique).mockResolvedValue(mockReservation({ status: 'HELD', heldAmount: 5000 }));
      vi.mocked(prisma.paymentReservation.update).mockResolvedValue(mockReservation({ status: 'REFUNDED', heldAmount: 0 }));
      vi.mocked(prisma.paymentRelease.create).mockResolvedValue({} as any);

      const result = await service.refundFunds('res-1', { amount: 5000 }, 'user-1');

      expect(result.status).toBe('REFUNDED');
      expect(eventBus.publish).toHaveBeenCalled();
    });
  });

  describe('cancelReservation', () => {
    it('should cancel reservation', async () => {
      vi.mocked(prisma.paymentReservation.findUnique).mockResolvedValue(mockReservation());
      vi.mocked(prisma.paymentReservation.update).mockResolvedValue(mockReservation({ status: 'CANCELLED' }));

      const result = await service.cancelReservation('res-1', { reason: 'No longer needed' }, 'user-1');

      expect(result.status).toBe('CANCELLED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });
});
