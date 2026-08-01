import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    quotation: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    quotationItem: {
      deleteMany: vi.fn(),
    },
    rFQ: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
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
import { QuotationService } from '@/modules/procurement/services/QuotationService';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

const service = new QuotationService();

function mockQuotation(overrides: Record<string, unknown> = {}) {
  return {
    id: 'q-1',
    rfqId: 'rfq-1',
    supplierId: 'user-1',
    organizationId: 'org-1',
    referenceNumber: 'Q-001',
    status: 'DRAFT',
    coverLetter: null,
    deliveryTime: null,
    validUntil: null,
    totalAmount: 1000,
    taxAmount: 0,
    grandTotal: 1000,
    currency: 'SAR',
    notes: null,
    submittedAt: null,
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    supplier: { id: 'user-1', name: 'Test Supplier', companyName: 'TestCo' },
    rfq: { id: 'rfq-1', title: 'Test RFQ', referenceNumber: 'RFQ-001', deadlineDate: new Date('2026-12-31') },
    items: [
      { id: 'item-1', rfqItemId: 'rfi-1', materialName: 'Steel', description: null, quantity: 100, unit: 'kg', unitPrice: 10, totalPrice: 1000 },
    ],
    ...overrides,
  };
}

describe('QuotationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated quotation summaries', async () => {
      const quotations = [mockQuotation(), mockQuotation({ id: 'q-2', referenceNumber: 'Q-002' })];
      vi.mocked(prisma.quotation.findMany).mockResolvedValue(quotations as never);
      vi.mocked(prisma.quotation.count).mockResolvedValue(2);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.items[0]).toHaveProperty('id');
      expect(result.items[0]).toHaveProperty('rfqId');
      expect(result.items[0]).toHaveProperty('status');
    });

    it('should filter by status', async () => {
      vi.mocked(prisma.quotation.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.quotation.count).mockResolvedValue(0);

      await service.list({ page: 1, limit: 10, status: 'DRAFT' });

      expect(prisma.quotation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'DRAFT' }),
        }),
      );
    });

    it('should filter by rfqId', async () => {
      vi.mocked(prisma.quotation.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.quotation.count).mockResolvedValue(0);

      await service.list({ page: 1, limit: 10, rfqId: 'rfq-1' });

      expect(prisma.quotation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ rfqId: 'rfq-1' }),
        }),
      );
    });

    it('should use correct pagination', async () => {
      vi.mocked(prisma.quotation.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.quotation.count).mockResolvedValue(25);

      await service.list({ page: 3, limit: 10 });

      expect(prisma.quotation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });

  describe('findById', () => {
    it('should return full quotation detail', async () => {
      const quotation = mockQuotation();
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(quotation as never);

      const result = await service.findById('q-1');

      expect(result.id).toBe('q-1');
      expect(result.referenceNumber).toBe('Q-001');
      expect(result.items).toHaveLength(1);
      expect(result.status).toBe('DRAFT');
    });

    it('should throw NOT_FOUND for missing quotation', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    });
  });

  describe('create', () => {
    const validInput = {
      rfqId: 'rfq-1',
      referenceNumber: 'Q-100',
      currency: 'SAR',
      items: [{ materialName: 'Cement', quantity: 500, unit: 'bags', unitPrice: 20, totalPrice: 10000 }],
    };

    it('should create quotation with items', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({ id: 'rfq-1', status: 'OPEN', organizationId: 'org-1', deadlineDate: new Date('2026-12-31') } as never);
      const created = mockQuotation({ id: 'q-new', referenceNumber: 'Q-100', status: 'DRAFT', items: [{ id: 'item-x' }] });
      vi.mocked(prisma.quotation.create).mockResolvedValue(created as never);

      const result = await service.create(validInput, 'user-1');

      expect(result.referenceNumber).toBe('Q-100');
      expect(result.status).toBe('DRAFT');
      expect(eventBus.publish).toHaveBeenCalled();
    });

    it('should throw RFQ_NOT_FOUND if RFQ does not exist', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(null);

      await expect(service.create(validInput, 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND);
    });

    it('should throw INVALID_TRANSITION if RFQ not OPEN', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({ id: 'rfq-1', status: 'DRAFT', organizationId: 'org-1', deadlineDate: new Date('2026-12-31') } as never);

      await expect(service.create(validInput, 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION);
    });

    it('should throw DEADLINE_PASSED if RFQ deadline has passed', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({ id: 'rfq-1', status: 'OPEN', organizationId: 'org-1', deadlineDate: new Date('2020-01-01') } as never);

      await expect(service.create(validInput, 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_RFQ_DEADLINE_PASSED);
    });
  });

  describe('update', () => {
    it('should update quotation in DRAFT status', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({ id: 'q-1', status: 'DRAFT', supplierId: 'user-1', rfqId: 'rfq-1' } as never);
      vi.mocked(prisma.quotation.update).mockResolvedValue(mockQuotation({ referenceNumber: 'Q-002' }) as never);

      const result = await service.update('q-1', { referenceNumber: 'Q-002' }, 'user-1');

      expect(result.referenceNumber).toBe('Q-002');
    });

    it('should throw FORBIDDEN if not the owner', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({ id: 'q-1', status: 'DRAFT', supplierId: 'user-2', rfqId: 'rfq-1' } as never);

      await expect(service.update('q-1', { referenceNumber: 'Hacked' }, 'user-1')).rejects.toThrow(ErrorCodes.CORE_USER_FORBIDDEN);
    });

    it('should throw CANNOT_MODIFY if not DRAFT', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({ id: 'q-1', status: 'SUBMITTED', supplierId: 'user-1', rfqId: 'rfq-1' } as never);

      await expect(service.update('q-1', { referenceNumber: 'Nope' }, 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_QUOTATION_CANNOT_MODIFY);
    });

    it('should replace items when items are provided', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({ id: 'q-1', status: 'DRAFT', supplierId: 'user-1', rfqId: 'rfq-1' } as never);
      vi.mocked(prisma.quotationItem.deleteMany).mockResolvedValue({ count: 1 } as never);
      vi.mocked(prisma.quotation.update).mockResolvedValue(mockQuotation() as never);

      await service.update('q-1', { items: [{ materialName: 'New Item', quantity: 10, unit: 'pcs', unitPrice: 5, totalPrice: 50 }] }, 'user-1');

      expect(prisma.quotationItem.deleteMany).toHaveBeenCalledWith({ where: { quotationId: 'q-1' } });
    });
  });

  describe('delete', () => {
    it('should delete quotation in DRAFT status', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({ id: 'q-1', status: 'DRAFT', supplierId: 'user-1' } as never);
      vi.mocked(prisma.quotationItem.deleteMany).mockResolvedValue({ count: 1 } as never);
      vi.mocked(prisma.quotation.delete).mockResolvedValue({} as never);

      await service.delete('q-1', 'user-1');

      expect(prisma.quotation.delete).toHaveBeenCalledWith({ where: { id: 'q-1' } });
    });

    it('should throw CANNOT_DELETE if not DRAFT', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({ id: 'q-1', status: 'SUBMITTED', supplierId: 'user-1' } as never);

      await expect(service.delete('q-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_QUOTATION_CANNOT_DELETE);
    });
  });

  describe('submit', () => {
    it('should transition DRAFT -> SUBMITTED', async () => {
      const existing = mockQuotation({ items: [{ id: 'item-1' }] });
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(existing as never);
      vi.mocked(prisma.rFQ.findUniqueOrThrow).mockResolvedValue({ id: 'rfq-1' } as never);
      vi.mocked(prisma.quotation.update).mockResolvedValue({ ...existing, status: 'SUBMITTED', submittedAt: new Date() } as never);

      const result = await service.submit('q-1', 'user-1');

      expect(result.status).toBe('SUBMITTED');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.Quotation.Submitted' }),
      );
    });

    it('should throw NOT_FOUND if quotation does not exist', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(null);

      await expect(service.submit('missing', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    });

    it('should throw FORBIDDEN if not the owner', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(mockQuotation({ supplierId: 'user-2' }) as never);

      await expect(service.submit('q-1', 'user-1')).rejects.toThrow(ErrorCodes.CORE_USER_FORBIDDEN);
    });

    it('should throw INVALID_TRANSITION if already submitted', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(mockQuotation({ status: 'SUBMITTED' }) as never);

      await expect(service.submit('q-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION);
    });
  });

  describe('withdraw', () => {
    it('should transition SUBMITTED -> WITHDRAWN', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(mockQuotation({ status: 'SUBMITTED' }) as never);
      vi.mocked(prisma.quotation.update).mockResolvedValue(mockQuotation({ status: 'WITHDRAWN' }) as never);

      const result = await service.withdraw('q-1', 'user-1');

      expect(result.status).toBe('WITHDRAWN');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.Quotation.Withdrawn' }),
      );
    });

    it('should throw INVALID_TRANSITION if in DRAFT', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(mockQuotation() as never);

      await expect(service.withdraw('q-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_QUOTATION_INVALID_TRANSITION);
    });
  });

  describe('accept', () => {
    it('should transition SUBMITTED -> ACCEPTED', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({
        ...mockQuotation({ status: 'SUBMITTED' }),
        rfq: { id: 'rfq-1', createdById: 'buyer-1' },
      } as never);
      vi.mocked(prisma.quotation.update).mockResolvedValue(mockQuotation({ status: 'ACCEPTED' }) as never);

      const result = await service.accept('q-1', 'buyer-1');

      expect(result.status).toBe('ACCEPTED');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.Quotation.Accepted' }),
      );
    });

    it('should throw FORBIDDEN if not RFQ creator', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({
        ...mockQuotation({ status: 'SUBMITTED' }),
        rfq: { id: 'rfq-1', createdById: 'other-buyer' },
      } as never);

      await expect(service.accept('q-1', 'buyer-1')).rejects.toThrow(ErrorCodes.CORE_USER_FORBIDDEN);
    });
  });

  describe('reject', () => {
    it('should transition SUBMITTED -> REJECTED', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({
        ...mockQuotation({ status: 'SUBMITTED' }),
        rfq: { id: 'rfq-1', createdById: 'buyer-1' },
      } as never);
      vi.mocked(prisma.quotation.update).mockResolvedValue(mockQuotation({ status: 'REJECTED' }) as never);

      const result = await service.reject('q-1', 'buyer-1', { reason: 'Too expensive' });

      expect(result.status).toBe('REJECTED');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.Quotation.Rejected' }),
      );
    });

    it('should throw NOT_FOUND for missing quotation', async () => {
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(null);

      await expect(service.reject('missing', 'buyer-1', { reason: 'N/A' })).rejects.toThrow(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    });
  });
});
