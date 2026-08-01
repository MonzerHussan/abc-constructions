import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    inspection: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    inspectionItem: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    inspectionAttachment: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    nCR: {
      create: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
    },
    acceptanceCertificate: {
      create: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
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
import { QualityService } from '@/modules/quality/services/QualityService';
import { ErrorCodes } from '@/modules/shared/utils/error-codes';

const service = new QualityService();

function mockInspection(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'ins-1',
    inspectionNumber: 'INS-001',
    type: 'Material',
    status: 'PENDING',
    referenceType: 'Delivery',
    referenceId: 'del-1',
    inspectorId: 'user-1',
    scheduledAt: null,
    completedAt: null,
    notes: null,
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    inspector: { id: 'user-1', name: 'Inspector One' },
    _count: { items: 2 },
    items: [
      { id: 'ii-1', inspectionId: 'ins-1', deliveryItemId: null, poItemId: 'poi-1', specification: 'Length', expectedValue: '6m', actualValue: null, result: null, remarks: null, createdAt: new Date('2026-07-01') },
      { id: 'ii-2', inspectionId: 'ins-1', deliveryItemId: null, poItemId: 'poi-2', specification: 'Weight', expectedValue: '50kg', actualValue: null, result: null, remarks: null, createdAt: new Date('2026-07-01') },
    ],
    attachments: [],
    ncrs: [],
    certificates: [],
    ...overrides,
  };
}

function mockCertificate(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'cert-1',
    certificateNumber: 'CERT-001',
    inspectionId: 'ins-1',
    acceptedById: 'user-1',
    acceptedAt: new Date('2026-07-02'),
    remarks: null,
    createdAt: new Date('2026-07-02'),
    acceptedBy: { id: 'user-1', name: 'Inspector One' },
    ...overrides,
  };
}

describe('QualityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listInspections', () => {
    it('should return paginated inspections', async () => {
      vi.mocked(prisma.inspection.findMany).mockResolvedValue([mockInspection()]);
      vi.mocked(prisma.inspection.count).mockResolvedValue(1);

      const result = await service.listInspections({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findInspectionById', () => {
    it('should return inspection detail', async () => {
      vi.mocked(prisma.inspection.findUnique).mockResolvedValue(mockInspection());

      const result = await service.findInspectionById('ins-1');

      expect(result.inspectionNumber).toBe('INS-001');
      expect(result.items).toHaveLength(2);
    });

    it('should throw NOT_FOUND', async () => {
      vi.mocked(prisma.inspection.findUnique).mockResolvedValue(null);

      await expect(service.findInspectionById('bad-id')).rejects.toThrow(ErrorCodes.QUALITY_INSPECTION_NOT_FOUND);
    });
  });

  describe('createInspection', () => {
    it('should create inspection', async () => {
      vi.mocked(prisma.inspection.create).mockResolvedValue(mockInspection());

      const result = await service.createInspection({
        type: 'Material',
        referenceType: 'Delivery',
        referenceId: 'del-1',
        inspectorId: 'user-1',
      }, 'user-1');

      expect(result.inspectionNumber).toBe('INS-001');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });

  describe('transition methods', () => {
    it('should start inspection', async () => {
      vi.mocked(prisma.inspection.findUnique).mockResolvedValue(mockInspection());
      vi.mocked(prisma.inspection.update).mockResolvedValue(mockInspection({ status: 'IN_PROGRESS' }));

      const result = await service.startInspection('ins-1');

      expect(result.status).toBe('IN_PROGRESS');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should pass inspection', async () => {
      vi.mocked(prisma.inspection.findUnique).mockResolvedValue(mockInspection({ status: 'IN_PROGRESS' }));
      vi.mocked(prisma.inspection.update).mockResolvedValue(mockInspection({ status: 'PASSED' }));

      const result = await service.passInspection('ins-1');

      expect(result.status).toBe('PASSED');
    });

    it('should fail inspection', async () => {
      vi.mocked(prisma.inspection.findUnique).mockResolvedValue(mockInspection({ status: 'IN_PROGRESS' }));
      vi.mocked(prisma.inspection.update).mockResolvedValue(mockInspection({ status: 'FAILED' }));

      const result = await service.failInspection('ins-1');

      expect(result.status).toBe('FAILED');
    });

    it('should reject invalid transition', async () => {
      vi.mocked(prisma.inspection.findUnique).mockResolvedValue(mockInspection());

      await expect(service.passInspection('ins-1')).rejects.toThrow(ErrorCodes.QUALITY_INSPECTION_INVALID_TRANSITION);
    });
  });

  describe('acceptInspection', () => {
    it('should accept inspection and create certificate', async () => {
      vi.mocked(prisma.inspection.findUnique).mockResolvedValue(mockInspection({ status: 'PASSED' }));
      vi.mocked(prisma.inspection.update).mockResolvedValue(mockInspection({ status: 'ACCEPTED' }));
      vi.mocked(prisma.acceptanceCertificate.create).mockResolvedValue(mockCertificate());

      const result = await service.acceptInspection('ins-1', {}, 'user-1');

      expect(result.certificate.certificateNumber).toBe('CERT-001');
      expect(result.inspection.status).toBe('ACCEPTED');
    });
  });

  describe('createNCR', () => {
    it('should create NCR for inspection', async () => {
      vi.mocked(prisma.inspection.findUnique).mockResolvedValue(mockInspection());
      vi.mocked(prisma.nCR.create).mockResolvedValue({
        id: 'ncr-1', ncrNumber: 'NCR-001', inspectionId: 'ins-1',
        severity: 'HIGH', category: 'Dimension', description: 'Out of spec',
        correctiveAction: 'Replace', dueDate: null, status: 'OPEN',
        createdById: 'user-1', createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.createNCR('ins-1', { severity: 'HIGH', category: 'Dimension', description: 'Out of spec' }, 'user-1');

      expect(result.ncrNumber).toBe('NCR-001');
      expect(eventBus.publish).toHaveBeenCalled();
    });
  });

  describe('addInspectionItem', () => {
    it('should add item to inspection', async () => {
      vi.mocked(prisma.inspection.findUnique).mockResolvedValue(mockInspection());
      vi.mocked(prisma.inspectionItem.create).mockResolvedValue({
        id: 'ii-3', inspectionId: 'ins-1', deliveryItemId: null, poItemId: 'poi-3',
        specification: 'Thickness', expectedValue: '10mm', actualValue: null,
        result: null, remarks: null, createdAt: new Date(),
      });

      const result = await service.addInspectionItem('ins-1', { poItemId: 'poi-3', specification: 'Thickness', expectedValue: '10mm' });

      expect(result.specification).toBe('Thickness');
    });
  });

  describe('updateInspectionItem', () => {
    it('should update item result', async () => {
      vi.mocked(prisma.inspectionItem.findFirst).mockResolvedValue({
        id: 'ii-1', inspectionId: 'ins-1', deliveryItemId: null, poItemId: 'poi-1',
        specification: 'Length', expectedValue: '6m', actualValue: null,
        result: null, remarks: null, createdAt: new Date(),
      });
      vi.mocked(prisma.inspectionItem.update).mockResolvedValue({
        id: 'ii-1', inspectionId: 'ins-1', deliveryItemId: null, poItemId: 'poi-1',
        specification: 'Length', expectedValue: '6m', actualValue: '5.8m',
        result: 'PASS', remarks: 'Within tolerance', createdAt: new Date(),
      });

      const result = await service.updateInspectionItem('ins-1', 'ii-1', { actualValue: '5.8m', result: 'PASS', remarks: 'Within tolerance' });

      expect(result.result).toBe('PASS');
    });
  });

  describe('listCertificates', () => {
    it('should list certificates', async () => {
      vi.mocked(prisma.acceptanceCertificate.findMany).mockResolvedValue([mockCertificate()]);

      const result = await service.listCertificates('ins-1');

      expect(result).toHaveLength(1);
      expect(result[0].certificateNumber).toBe('CERT-001');
    });
  });
});
