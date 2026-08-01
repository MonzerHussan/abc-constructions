import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    supplierProfile: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    supplierDocument: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    supplierCertification: {
      create: vi.fn(),
    },
    supplierBanking: {
      upsert: vi.fn(),
    },
    supplierCapability: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    supplierRelationship: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    supplierRating: {
      create: vi.fn(),
      aggregate: vi.fn(),
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
import { SupplierNetworkService } from '@/modules/supplier-network/services/SupplierNetworkService';

const service = new SupplierNetworkService();

function mockProfile(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'sp-1',
    userId: 'user-1',
    organizationId: null,
    supplierType: ['SUPPLIER'],
    companyName: 'Test Supplier Co',
    companyNameAr: null,
    companyNameUr: null,
    commercialLicense: 'LIC-123',
    licenseNumber: null,
    taxNumber: null,
    vatRegistered: false,
    yearEstablished: 2020,
    employeeCount: 50,
    country: 'SA',
    emirate: 'Riyadh',
    city: 'Riyadh',
    countryId: null,
    cityId: null,
    location: null,
    website: null,
    about: 'A test supplier',
    aboutAr: null,
    aboutUr: null,
    logo: null,
    coverImage: null,
    minOrderValue: null,
    maxDailyCapacity: null,
    monthlyCapacity: null,
    leadTimeDays: null,
    transportTypes: [],
    countriesServed: [],
    workingHours: null,
    hasWarehouses: false,
    hasBranches: false,
    verificationStatus: 'PENDING',
    verificationLevel: 'UNVERIFIED',
    performanceScore: 0,
    totalOrders: 0,
    completedOrders: 0,
    onTimeDeliveryRate: 0,
    avgRating: 0,
    totalRatings: 0,
    avgResponseTime: null,
    avgResponseTimeHours: null,
    winRate: 0,
    totalSpend: 0,
    isActive: true,
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    ...overrides,
  };
}

describe('SupplierNetworkService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listProfiles', () => {
    it('should return paginated profiles', async () => {
      vi.mocked(prisma.supplierProfile.findMany).mockResolvedValue([mockProfile()]);
      vi.mocked(prisma.supplierProfile.count).mockResolvedValue(1);

      const result = await service.listProfiles({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should apply filters', async () => {
      vi.mocked(prisma.supplierProfile.findMany).mockResolvedValue([]);
      vi.mocked(prisma.supplierProfile.count).mockResolvedValue(0);

      await service.listProfiles({ page: 1, limit: 10, verificationLevel: 'VERIFIED', isActive: true });

      expect(prisma.supplierProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ verificationLevel: 'VERIFIED', isActive: true }),
        }),
      );
    });
  });

  describe('findProfileById', () => {
    it('should return profile when found', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(mockProfile());

      const profile = await service.findProfileById('sp-1');

      expect(profile.id).toBe('sp-1');
    });

    it('should throw when not found', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(null);

      await expect(service.findProfileById('sp-nonexistent')).rejects.toThrow('SUPPLIER_PROFILE_NOT_FOUND');
    });
  });

  describe('createProfile', () => {
    it('should create a profile', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.supplierProfile.create).mockResolvedValue(mockProfile());

      const result = await service.createProfile({
        supplierType: ['SUPPLIER'],
        companyName: 'Test Supplier Co',
        vatRegistered: false,
      }, 'user-1');

      expect(result.id).toBe('sp-1');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw when profile already exists', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(mockProfile());

      await expect(service.createProfile({
        supplierType: ['SUPPLIER'],
        companyName: 'Test Supplier Co',
        vatRegistered: false,
      }, 'user-1')).rejects.toThrow('SUPPLIER_PROFILE_ALREADY_EXISTS');
    });
  });

  describe('updateProfile', () => {
    it('should update a profile', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(mockProfile());
      vi.mocked(prisma.supplierProfile.update).mockResolvedValue(mockProfile({ companyName: 'Updated Co' }));

      const result = await service.updateProfile('sp-1', { companyName: 'Updated Co' });

      expect(result).toBeDefined();
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw when not found', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(null);

      await expect(service.updateProfile('sp-nonexistent', { companyName: 'Updated Co' })).rejects.toThrow('SUPPLIER_PROFILE_NOT_FOUND');
    });
  });

  describe('transitionVerification', () => {
    it('should transition verification level', async () => {
      const profile = mockProfile();
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(profile);
      vi.mocked(prisma.supplierProfile.update).mockResolvedValue({ ...profile, verificationLevel: 'BASIC' });

      const result = await service.transitionVerification('sp-1', 'submitBasic', 'user-1');

      expect(result.currentLevel).toBe('BASIC');
      expect(result.previousLevel).toBe('UNVERIFIED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw when not found', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(null);

      await expect(service.transitionVerification('sp-nonexistent', 'submitBasic', 'user-1')).rejects.toThrow('SUPPLIER_PROFILE_NOT_FOUND');
    });

    it('should throw on invalid transition', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(mockProfile());

      await expect(service.transitionVerification('sp-1', 'verify', 'user-1')).rejects.toThrow('SUPPLIER_PROFILE_INVALID_TRANSITION');
    });
  });

  describe('uploadDocument', () => {
    it('should create a document', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(mockProfile());
      vi.mocked(prisma.supplierDocument.create).mockResolvedValue({
        id: 'doc-1', supplierId: 'sp-1', docType: 'TRADE_LICENSE', title: 'License',
        fileName: 'lic.pdf', fileUrl: '/uploads/lic.pdf', mimeType: null,
        status: 'PENDING', notes: null, issuedAt: null, expiresAt: null,
        verifiedAt: null, verifiedById: null, createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.uploadDocument({
        supplierId: 'sp-1', docType: 'TRADE_LICENSE', title: 'License',
        fileName: 'lic.pdf', fileUrl: '/uploads/lic.pdf',
      }, 'user-1');

      expect(result.id).toBe('doc-1');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });

  describe('verifyDocument', () => {
    it('should verify a document', async () => {
      vi.mocked(prisma.supplierDocument.findUnique).mockResolvedValue({
        id: 'doc-1', supplierId: 'sp-1', status: 'PENDING',
      } as any);
      vi.mocked(prisma.supplierDocument.update).mockResolvedValue({
        id: 'doc-1', supplierId: 'sp-1', docType: 'TRADE_LICENSE', title: 'License',
        fileName: 'lic.pdf', fileUrl: '/uploads/lic.pdf', mimeType: null,
        status: 'VERIFIED', notes: null, issuedAt: null, expiresAt: null,
        verifiedAt: new Date(), verifiedById: 'user-1', createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.verifyDocument('doc-1', { status: 'VERIFIED' }, 'user-1');

      expect(result.status).toBe('VERIFIED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw when document not found', async () => {
      vi.mocked(prisma.supplierDocument.findUnique).mockResolvedValue(null);

      await expect(service.verifyDocument('doc-nonexistent', { status: 'VERIFIED' }, 'user-1')).rejects.toThrow('SUPPLIER_DOCUMENT_NOT_FOUND');
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      vi.mocked(prisma.supplierDocument.findUnique).mockResolvedValue({ id: 'doc-1', supplierId: 'sp-1' } as any);
      vi.mocked(prisma.supplierDocument.delete).mockResolvedValue({} as any);

      await expect(service.deleteDocument('doc-1')).resolves.not.toThrow();
    });

    it('should throw when not found', async () => {
      vi.mocked(prisma.supplierDocument.findUnique).mockResolvedValue(null);

      await expect(service.deleteDocument('doc-nonexistent')).rejects.toThrow('SUPPLIER_DOCUMENT_NOT_FOUND');
    });
  });

  describe('addCertification', () => {
    it('should create a certification', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(mockProfile());
      vi.mocked(prisma.supplierCertification.create).mockResolvedValue({
        id: 'cert-1', supplierId: 'sp-1', name: 'ISO 9001', issuingBody: 'BSI',
        certificateNumber: '12345', issueDate: new Date(), expiryDate: null,
        fileUrl: null, isVerified: false, createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.addCertification({
        supplierId: 'sp-1', name: 'ISO 9001', issuingBody: 'BSI',
        issueDate: '2026-01-01T00:00:00.000Z',
      });

      expect(result.id).toBe('cert-1');
    });
  });

  describe('upsertBanking', () => {
    it('should upsert banking info', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(mockProfile());
      vi.mocked(prisma.supplierBanking.upsert).mockResolvedValue({
        id: 'bank-1', supplierId: 'sp-1', bankName: 'SNB', accountName: 'Test Co',
        accountNumber: '123456', iban: 'SA123456', swiftCode: null,
        currency: 'SAR', isVerified: false, createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.upsertBanking({
        supplierId: 'sp-1', bankName: 'SNB', accountName: 'Test Co',
        accountNumber: '123456', iban: 'SA123456', currency: 'SAR',
      });

      expect(result.id).toBe('bank-1');
    });
  });

  describe('addCapability', () => {
    it('should create a capability', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(mockProfile());
      vi.mocked(prisma.supplierCapability.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.supplierCapability.create).mockResolvedValue({
        id: 'cap-1', supplierId: 'sp-1', category: 'Steel', level: 'PRIMARY',
        capacityMonthly: null, maxProjectValue: null, currency: 'SAR',
        notes: null, isActive: true, createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.addCapability({
        supplierId: 'sp-1', category: 'Steel', level: 'PRIMARY', currency: 'SAR',
      });

      expect(result.id).toBe('cap-1');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw when capability already exists', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(mockProfile());
      vi.mocked(prisma.supplierCapability.findUnique).mockResolvedValue({ id: 'cap-existing' } as any);

      await expect(service.addCapability({
        supplierId: 'sp-1', category: 'Steel', level: 'SECONDARY', currency: 'SAR',
      })).rejects.toThrow('SUPPLIER_CAPABILITY_ALREADY_EXISTS');
    });
  });

  describe('updateCapability', () => {
    it('should update a capability', async () => {
      vi.mocked(prisma.supplierCapability.findUnique).mockResolvedValue({
        id: 'cap-1', supplierId: 'sp-1', level: 'SECONDARY',
      } as any);
      vi.mocked(prisma.supplierCapability.update).mockResolvedValue({
        id: 'cap-1', supplierId: 'sp-1', category: 'Steel', level: 'PRIMARY',
        capacityMonthly: null, maxProjectValue: null, currency: 'SAR',
        notes: null, isActive: true, createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.updateCapability('cap-1', { level: 'PRIMARY' });

      expect(result).toBeDefined();
    });
  });

  describe('listRelationships', () => {
    it('should return paginated relationships', async () => {
      vi.mocked(prisma.supplierRelationship.findMany).mockResolvedValue([{
        id: 'rel-1', buyerOrgId: 'org-1', supplierId: 'sp-1',
        relationshipType: 'APPROVED', status: 'ACTIVE',
        createdById: 'user-1', createdAt: new Date(), updatedAt: new Date(),
      } as any]);
      vi.mocked(prisma.supplierRelationship.count).mockResolvedValue(1);

      const result = await service.listRelationships({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('createRelationship', () => {
    it('should create a relationship', async () => {
      vi.mocked(prisma.supplierRelationship.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.supplierRelationship.create).mockResolvedValue({
        id: 'rel-1', buyerOrgId: 'org-1', supplierId: 'sp-1',
        relationshipType: 'PREFERRED', status: 'ACTIVE',
        creditLimit: null, currency: 'SAR', paymentTerms: null,
        contractRef: null, contractStartDate: null, contractEndDate: null,
        relationshipScore: null, notes: null, createdById: 'user-1',
        createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.createRelationship({
        buyerOrgId: 'org-1', supplierProfileId: 'sp-1', relationshipType: 'PREFERRED', currency: 'SAR',
      }, 'user-1');

      expect(result.id).toBe('rel-1');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw when relationship already exists', async () => {
      vi.mocked(prisma.supplierRelationship.findUnique).mockResolvedValue({ id: 'rel-existing' } as any);

      await expect(service.createRelationship({
        buyerOrgId: 'org-1', supplierProfileId: 'sp-1', relationshipType: 'APPROVED', currency: 'SAR',
      }, 'user-1')).rejects.toThrow('SUPPLIER_RELATIONSHIP_ALREADY_EXISTS');
    });
  });

  describe('updateRelationship', () => {
    it('should update a relationship', async () => {
      vi.mocked(prisma.supplierRelationship.findUnique).mockResolvedValue({ id: 'rel-1' } as any);
      vi.mocked(prisma.supplierRelationship.update).mockResolvedValue({
        id: 'rel-1', buyerOrgId: 'org-1', supplierId: 'sp-1',
        relationshipType: 'STRATEGIC', status: 'ACTIVE',
        createdAt: new Date(), updatedAt: new Date(),
      } as any);

      const result = await service.updateRelationship('rel-1', { relationshipType: 'STRATEGIC' });

      expect(result).toBeDefined();
    });
  });

  describe('deleteRelationship', () => {
    it('should delete a relationship', async () => {
      vi.mocked(prisma.supplierRelationship.findUnique).mockResolvedValue({ id: 'rel-1' } as any);
      vi.mocked(prisma.supplierRelationship.delete).mockResolvedValue({} as any);

      await expect(service.deleteRelationship('rel-1')).resolves.not.toThrow();
    });
  });

  describe('createRating', () => {
    it('should create a rating and update profile averages', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(mockProfile());
      vi.mocked(prisma.supplierRating.create).mockResolvedValue({
        id: 'rat-1', supplierId: 'user-1', supplierProfileId: 'sp-1',
        organizationId: 'org-1', purchaseOrderId: null, ratedById: 'user-1',
        rating: 4, quality: 5, delivery: 4, communication: null, price: null,
        comment: 'Great supplier', createdAt: new Date(),
      });
      vi.mocked(prisma.supplierRating.aggregate).mockResolvedValue({ _avg: { rating: 4 }, _count: 1 } as any);
      vi.mocked(prisma.supplierProfile.update).mockResolvedValue(mockProfile({ avgRating: 4, totalRatings: 1 }));

      const result = await service.createRating({
        supplierProfileId: 'sp-1', organizationId: 'org-1', rating: 4, quality: 5, delivery: 4,
      }, 'user-1');

      expect(result.id).toBe('rat-1');
      expect(prisma.supplierProfile.update).toHaveBeenCalled();
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });
});
