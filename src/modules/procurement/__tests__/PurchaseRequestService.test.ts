import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PurchaseRequestService } from '@/modules/procurement/services/PurchaseRequestService';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    purchaseRequest: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    purchaseRequestItem: {
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('@/modules/shared/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('@/modules/shared/events/event-bus', () => ({
  eventBus: { publish: vi.fn() },
}));

import { prisma } from '@/lib/prisma';
import { eventBus } from '@/modules/shared/events/event-bus';

const service = new PurchaseRequestService();

const mockPR = {
  id: 'pr_1',
  title: 'Test PR',
  description: 'Test description',
  category: 'Materials',
  priority: 'MEDIUM',
  status: 'DRAFT',
  createdAt: new Date(),
  updatedAt: new Date(),
  requestedById: 'user_1',
  approvedById: null,
  projectId: null,
  organizationId: 'org_1',
  expectedDelivery: null,
  deliveryLocation: null,
  notes: null,
  requestedBy: { id: 'user_1', name: 'User', companyName: 'Company' },
  approvedBy: null,
  items: [{ id: 'item_1', materialName: 'Steel', quantity: 10, unit: 'TON', estimatedPrice: 500, total: 5000 }],
  project: null,
  _count: { items: 1 },
};

describe('PurchaseRequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a purchase request when found', async () => {
      (prisma.purchaseRequest.findUnique as any).mockResolvedValue(mockPR);
      const result = await service.findById('pr_1');
      expect(result).toEqual(mockPR);
      expect(prisma.purchaseRequest.findUnique).toHaveBeenCalledWith({
        where: { id: 'pr_1' },
        include: expect.any(Object),
      });
    });

    it('should throw when not found', async () => {
      (prisma.purchaseRequest.findUnique as any).mockResolvedValue(null);
      await expect(service.findById('pr_nonexistent')).rejects.toThrow('PROCUREMENT_PR_NOT_FOUND');
    });
  });

  describe('create', () => {
    const createInput = {
      title: 'New PR',
      category: 'Materials',
      priority: 'MEDIUM' as const,
      items: [{ materialName: 'Cement', quantity: 50, unit: 'BAG' }],
    };

    it('should create a purchase request and publish event', async () => {
      (prisma.purchaseRequest.create as any).mockResolvedValue(mockPR);
      const result = await service.create(createInput, 'user_1');
      expect(result).toEqual(mockPR);
      expect(prisma.purchaseRequest.create).toHaveBeenCalled();
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Procurement.PR.Created',
        })
      );
    });
  });

  describe('submit', () => {
    it('should change status to PENDING_APPROVAL and publish event', async () => {
      (prisma.purchaseRequest.findUnique as any).mockResolvedValue({ ...mockPR, status: 'DRAFT' });
      (prisma.purchaseRequest.update as any).mockResolvedValue({ ...mockPR, status: 'PENDING_APPROVAL' });
      const result = await service.submit('pr_1', 'user_1');
      expect(result.status).toBe('PENDING_APPROVAL');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.PR.Submitted' })
      );
    });

    it('should throw if already submitted', async () => {
      (prisma.purchaseRequest.findUnique as any).mockResolvedValue({ ...mockPR, status: 'PENDING_APPROVAL' });
      await expect(service.submit('pr_1', 'user_1')).rejects.toThrow('PROCUREMENT_PR_ALREADY_SUBMITTED');
    });

    it('should throw if user is not the owner', async () => {
      (prisma.purchaseRequest.findUnique as any).mockResolvedValue({ ...mockPR, status: 'DRAFT', requestedById: 'user_2' });
      await expect(service.submit('pr_1', 'user_1')).rejects.toThrow('CORE_USER_FORBIDDEN');
    });
  });

  describe('approve', () => {
    it('should approve and publish event', async () => {
      (prisma.purchaseRequest.findUnique as any).mockResolvedValue({ ...mockPR, status: 'PENDING_APPROVAL' });
      (prisma.purchaseRequest.update as any).mockResolvedValue({ ...mockPR, status: 'APPROVED', approvedById: 'user_2' });
      const result = await service.approve('pr_1', { status: 'APPROVED' }, 'user_2');
      expect(result.status).toBe('APPROVED');
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Procurement.PR.Approved' })
      );
    });

    it('should throw if already approved', async () => {
      (prisma.purchaseRequest.findUnique as any).mockResolvedValue({ ...mockPR, status: 'APPROVED' });
      await expect(service.approve('pr_1', { status: 'APPROVED' }, 'user_2')).rejects.toThrow('PROCUREMENT_PR_ALREADY_APPROVED');
    });
  });

  describe('list', () => {
    it('should return paginated results', async () => {
      (prisma.purchaseRequest.findMany as any).mockResolvedValue([mockPR]);
      (prisma.purchaseRequest.count as any).mockResolvedValue(1);
      const result = await service.list({ page: 1, limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete and clean up items', async () => {
      (prisma.purchaseRequest.findUnique as any).mockResolvedValue(mockPR);
      (prisma.purchaseRequestItem.deleteMany as any).mockResolvedValue({ count: 1 });
      (prisma.purchaseRequest.delete as any).mockResolvedValue(mockPR);
      await service.delete('pr_1', 'user_1');
      expect(prisma.purchaseRequestItem.deleteMany).toHaveBeenCalled();
      expect(prisma.purchaseRequest.delete).toHaveBeenCalled();
    });

    it('should throw if not owner', async () => {
      (prisma.purchaseRequest.findUnique as any).mockResolvedValue({ ...mockPR, requestedById: 'user_2' });
      await expect(service.delete('pr_1', 'user_1')).rejects.toThrow('CORE_USER_FORBIDDEN');
    });
  });
});
