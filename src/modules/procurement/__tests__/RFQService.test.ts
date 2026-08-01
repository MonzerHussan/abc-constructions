import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    rFQ: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    rFQItem: {
      deleteMany: vi.fn(),
    },
    rFQSupplier: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
    },
    quotation: {
      findUnique: vi.fn(),
    },
    award: {
      create: vi.fn(),
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
import { RFQService } from '@/modules/procurement/services/RFQService';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

const service = new RFQService();

function mockRFQ(overrides: Record<string, unknown> = {}) {
  return {
    id: 'rfq-1',
    title: 'Test RFQ',
    description: 'Test description',
    referenceNumber: 'RFQ-001',
    status: 'DRAFT',
    purchaseRequestId: null,
    projectId: null,
    organizationId: null,
    issueDate: null,
    deadlineDate: new Date('2026-12-31'),
    deliveryDate: null,
    deliveryLocation: null,
    termsAndConditions: null,
    attachments: [],
    createdById: 'user-1',
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    createdBy: { id: 'user-1', name: 'Test User', email: 'test@test.com', companyName: 'TestCo' },
    project: null,
    purchaseRequest: null,
    items: [
      { id: 'item-1', materialName: 'Steel', description: null, quantity: 100, unit: 'kg', specifications: null },
    ],
    suppliers: [
      { id: 'sup-1', supplierId: 'supplier-1', invitedAt: new Date(), responded: false, respondedAt: null, supplier: { id: 'supplier-1', name: 'Supplier A', companyName: 'SupCo' } },
    ],
    quotations: [],
    evaluations: [],
    awards: [],
    _count: { quotations: 0, suppliers: 1 },
    ...overrides,
  };
}

describe('RFQService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return paginated RFQ summaries', async () => {
      const rfqs = [mockRFQ(), mockRFQ({ id: 'rfq-2', title: 'RFQ 2', referenceNumber: 'RFQ-002' })];
      vi.mocked(prisma.rFQ.findMany).mockResolvedValue(rfqs as never);
      vi.mocked(prisma.rFQ.count).mockResolvedValue(2);

      const result = await service.list({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.items[0]).toHaveProperty('id');
      expect(result.items[0]).toHaveProperty('title');
      expect(result.items[0]).toHaveProperty('status');
    });

    it('should filter by status', async () => {
      vi.mocked(prisma.rFQ.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.rFQ.count).mockResolvedValue(0);

      await service.list({ page: 1, limit: 10, status: 'DRAFT' });

      expect(prisma.rFQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'DRAFT' }),
        }),
      );
    });

    it('should search by title or referenceNumber', async () => {
      vi.mocked(prisma.rFQ.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.rFQ.count).mockResolvedValue(0);

      await service.list({ page: 1, limit: 10, search: 'steel' });

      expect(prisma.rFQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: { contains: 'steel', mode: 'insensitive' } }),
            ]),
          }),
        }),
      );
    });

    it('should use correct pagination', async () => {
      vi.mocked(prisma.rFQ.findMany).mockResolvedValue([] as never);
      vi.mocked(prisma.rFQ.count).mockResolvedValue(25);

      await service.list({ page: 3, limit: 10 });

      expect(prisma.rFQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });

  describe('findById', () => {
    it('should return full RFQ detail', async () => {
      const rfq = mockRFQ();
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(rfq as never);

      const result = await service.findById('rfq-1');

      expect(result.id).toBe('rfq-1');
      expect(result.title).toBe('Test RFQ');
      expect(result.items).toHaveLength(1);
      expect(result.suppliers).toHaveLength(1);
      expect(result.status).toBe('DRAFT');
    });

    it('should throw NOT_FOUND for missing RFQ', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(ErrorCodes.PROCUREMENT_RFQ_NOT_FOUND);
    });
  });

  describe('create', () => {
    const validInput = {
      title: 'New RFQ',
      referenceNumber: 'RFQ-100',
      deadlineDate: '2026-12-31',
      items: [{ materialName: 'Cement', quantity: 500, unit: 'bags' }],
      supplierIds: ['supplier-1'],
    };

    it('should create RFQ with items and suppliers', async () => {
      const created = mockRFQ({ id: 'rfq-new', title: 'New RFQ', referenceNumber: 'RFQ-100', items: [{ id: 'item-x', materialName: 'Cement', quantity: 500, unit: 'bags', description: null, specifications: null }] });
      vi.mocked(prisma.rFQ.create).mockResolvedValue(created as never);

      const result = await service.create(validInput, 'user-1');

      expect(result.title).toBe('New RFQ');
      expect(result.status).toBe('DRAFT');
      expect(eventBus.publish).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update RFQ in DRAFT status', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({ id: 'rfq-1', status: 'DRAFT', createdById: 'user-1' } as never);
      vi.mocked(prisma.rFQ.update).mockResolvedValue(mockRFQ({ title: 'Updated RFQ' }) as never);

      const result = await service.update('rfq-1', { title: 'Updated RFQ' }, 'user-1');

      expect(result.title).toBe('Updated RFQ');
    });

    it('should throw FORBIDDEN if not the creator', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({ id: 'rfq-1', status: 'DRAFT', createdById: 'user-2' } as never);

      await expect(service.update('rfq-1', { title: 'Hacked' }, 'user-1')).rejects.toThrow(ErrorCodes.CORE_USER_FORBIDDEN);
    });

    it('should throw CANNOT_MODIFY if not DRAFT', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({ id: 'rfq-1', status: 'SENT', createdById: 'user-1' } as never);

      await expect(service.update('rfq-1', { title: 'Nope' }, 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_RFQ_CANNOT_MODIFY);
    });

    it('should replace items when items are provided', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({ id: 'rfq-1', status: 'DRAFT', createdById: 'user-1' } as never);
      vi.mocked(prisma.rFQItem.deleteMany).mockResolvedValue({ count: 1 } as never);
      vi.mocked(prisma.rFQ.update).mockResolvedValue(mockRFQ() as never);

      await service.update('rfq-1', { items: [{ materialName: 'New Item', quantity: 10, unit: 'pcs' }] }, 'user-1');

      expect(prisma.rFQItem.deleteMany).toHaveBeenCalledWith({ where: { rfqId: 'rfq-1' } });
    });
  });

  describe('delete', () => {
    it('should delete RFQ in DRAFT status', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({ id: 'rfq-1', status: 'DRAFT', createdById: 'user-1' } as never);
      vi.mocked(prisma.rFQItem.deleteMany).mockResolvedValue({ count: 1 } as never);
      vi.mocked(prisma.rFQSupplier.deleteMany).mockResolvedValue({ count: 1 } as never);
      vi.mocked(prisma.rFQ.delete).mockResolvedValue({} as never);

      await service.delete('rfq-1', 'user-1');

      expect(prisma.rFQ.delete).toHaveBeenCalledWith({ where: { id: 'rfq-1' } });
    });

    it('should throw CANNOT_DELETE if not DRAFT', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({ id: 'rfq-1', status: 'SENT', createdById: 'user-1' } as never);

      await expect(service.delete('rfq-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_RFQ_CANNOT_DELETE);
    });
  });

  describe('submit', () => {
    it('should transition DRAFT -> SENT', async () => {
      const existing = mockRFQ({ items: [{ id: 'item-1', materialName: 'Steel', description: null, quantity: 100, unit: 'kg', specifications: null }] });
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(existing as never);
      vi.mocked(prisma.rFQ.update).mockResolvedValue({ ...existing, status: 'SENT' } as never);

      const result = await service.submit('rfq-1', 'user-1');

      expect(result.status).toBe('SENT');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.RFQ.Submitted' }),
      );
    });

    it('should throw NO_ITEMS if RFQ has no items', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(mockRFQ({ items: [] }) as never);

      await expect(service.submit('rfq-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_RFQ_NO_ITEMS);
    });

    it('should throw INVALID_TRANSITION if already sent', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(mockRFQ({ status: 'SENT' }) as never);

      await expect(service.submit('rfq-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION);
    });

    it('should throw FORBIDDEN if not creator', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(mockRFQ({ createdById: 'user-2' }) as never);

      await expect(service.submit('rfq-1', 'user-1')).rejects.toThrow(ErrorCodes.CORE_USER_FORBIDDEN);
    });
  });

  describe('send', () => {
    it('should transition SENT -> OPEN', async () => {
      const existing = mockRFQ({ status: 'SENT' });
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(existing as never);
      vi.mocked(prisma.rFQ.update).mockResolvedValue({ ...existing, status: 'OPEN', issueDate: new Date() } as never);

      const result = await service.send('rfq-1', 'user-1');

      expect(result.status).toBe('OPEN');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.RFQ.Sent' }),
      );
    });

    it('should throw SUPPLIER_NOT_INVITED if no suppliers', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(mockRFQ({ status: 'SENT', suppliers: [] }) as never);

      await expect(service.send('rfq-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_RFQ_SUPPLIER_NOT_INVITED);
    });
  });

  describe('inviteSupplier', () => {
    it('should add supplier to RFQ in DRAFT', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({ id: 'rfq-1', status: 'DRAFT', createdById: 'user-1', referenceNumber: 'RFQ-001', organizationId: 'org-1' } as never);
      vi.mocked(prisma.rFQSupplier.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.rFQSupplier.create).mockResolvedValue({
        id: 'sup-new',
        supplierId: 'supplier-2',
        invitedAt: new Date(),
        responded: false,
        respondedAt: null,
        supplier: { id: 'supplier-2', name: 'Supplier B', companyName: 'SupB' },
      } as never);

      const result = await service.inviteSupplier('rfq-1', 'supplier-2', 'user-1');

      expect(result.supplierId).toBe('supplier-2');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.RFQ.SupplierInvited' }),
      );
    });

    it('should throw ALREADY_INVITED for duplicate supplier', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue({ id: 'rfq-1', status: 'DRAFT', createdById: 'user-1', referenceNumber: 'RFQ-001', organizationId: 'org-1' } as never);
      vi.mocked(prisma.rFQSupplier.findFirst).mockResolvedValue({ id: 'existing' } as never);

      await expect(service.inviteSupplier('rfq-1', 'supplier-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_RFQ_SUPPLIER_ALREADY_INVITED);
    });
  });

  describe('award', () => {
    it('should transition OPEN -> AWARDED and create Award', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(mockRFQ({ status: 'OPEN' }) as never);
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({ id: 'q-1', supplierId: 'supplier-1', grandTotal: 5000, rfqId: 'rfq-1' } as never);
      vi.mocked(prisma.rFQ.update).mockResolvedValue(mockRFQ({ status: 'AWARDED' }) as never);
      vi.mocked(prisma.award.create).mockResolvedValue({} as never);

      const result = await service.award('rfq-1', 'q-1', 'user-1');

      expect(result.status).toBe('AWARDED');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.RFQ.Awarded' }),
      );
    });

    it('should throw QUOTATION_NOT_FOUND for invalid quotation', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(mockRFQ({ status: 'OPEN' }) as never);
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue(null);

      await expect(service.award('rfq-1', 'bad-q', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    });

    it('should throw QUOTATION_NOT_FOUND if quotation belongs to different RFQ', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(mockRFQ({ status: 'OPEN' }) as never);
      vi.mocked(prisma.quotation.findUnique).mockResolvedValue({ id: 'q-1', supplierId: 's-1', grandTotal: 100, rfqId: 'other-rfq' } as never);

      await expect(service.award('rfq-1', 'q-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_QUOTATION_NOT_FOUND);
    });
  });

  describe('close', () => {
    it('should transition AWARDED -> CLOSED', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(mockRFQ({ status: 'AWARDED' }) as never);
      vi.mocked(prisma.rFQ.update).mockResolvedValue(mockRFQ({ status: 'CLOSED' }) as never);

      const result = await service.close('rfq-1', 'user-1');

      expect(result.status).toBe('CLOSED');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.RFQ.Closed' }),
      );
    });

    it('should throw INVALID_TRANSITION if not AWARDED', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(mockRFQ({ status: 'DRAFT' }) as never);

      await expect(service.close('rfq-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION);
    });
  });

  describe('cancel', () => {
    it('should transition DRAFT -> CANCELLED', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(mockRFQ() as never);
      vi.mocked(prisma.rFQ.update).mockResolvedValue(mockRFQ({ status: 'CANCELLED' }) as never);

      const result = await service.cancel('rfq-1', 'user-1');

      expect(result.status).toBe('CANCELLED');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.RFQ.Cancelled' }),
      );
    });

    it('should throw INVALID_TRANSITION for CLOSED RFQ', async () => {
      vi.mocked(prisma.rFQ.findUnique).mockResolvedValue(mockRFQ({ status: 'CLOSED' }) as never);

      await expect(service.cancel('rfq-1', 'user-1')).rejects.toThrow(ErrorCodes.PROCUREMENT_RFQ_INVALID_TRANSITION);
    });
  });
});
