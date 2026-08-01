import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    productMaster: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    productVariant: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    productSpecification: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    productDataSheet: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    productSafetySheet: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    productImage: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    unitOfMeasure: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    supplierProductOffering: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
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
import { ProductCatalogService } from '@/modules/product-catalog/services/ProductCatalogService';

const service = new ProductCatalogService();

function mockProduct(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'prod-1',
    sku: 'STEEL-001',
    name: 'Steel Bar 12mm',
    nameAr: null,
    nameUr: null,
    description: 'High quality steel bar',
    descriptionAr: null,
    descriptionUr: null,
    manufacturerId: 'org-1',
    brandId: null,
    categoryId: 'cat-1',
    subcategoryId: null,
    unitId: 'unit-1',
    barcode: null,
    qrCode: null,
    gtin: null,
    status: 'DRAFT',
    isActive: true,
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    ...overrides,
  };
}

function mockOffering(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'off-1',
    productId: 'prod-1',
    supplierId: 'sp-1',
    supplierSku: null,
    status: 'ACTIVE',
    price: 100,
    currency: 'SAR',
    taxRate: 0,
    contractPrice: null,
    contractMinQty: null,
    tierPricing: null,
    minOrderQty: 1,
    maxOrderQty: null,
    packSize: null,
    moqUnit: null,
    leadTimeDays: null,
    availability: 'IN_STOCK',
    deliveryTerms: [],
    deliveryTimeDays: null,
    shippingCost: null,
    isAuthorized: false,
    authorizationDoc: null,
    warrantyPeriod: null,
    returnPolicy: null,
    validFrom: null,
    validUntil: null,
    notes: null,
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    ...overrides,
  };
}

describe('ProductCatalogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ================== Products ==================

  describe('listProducts', () => {
    it('should return paginated products', async () => {
      vi.mocked(prisma.productMaster.findMany).mockResolvedValue([mockProduct()]);
      vi.mocked(prisma.productMaster.count).mockResolvedValue(1);

      const result = await service.listProducts({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findProductById', () => {
    it('should return product when found', async () => {
      vi.mocked(prisma.productMaster.findUnique).mockResolvedValue(mockProduct({
        manufacturer: { id: 'org-1', nameEn: 'Test Corp', nameAr: null },
        brand: null, category: null, subcategory: null, unit: null,
        variants: [], specifications: [], dataSheets: [], safetySheets: [], images: [], offerings: [],
      }));

      const product = await service.findProductById('prod-1');
      expect(product.id).toBe('prod-1');
    });

    it('should throw when not found', async () => {
      vi.mocked(prisma.productMaster.findUnique).mockResolvedValue(null);
      await expect(service.findProductById('bad-id')).rejects.toThrow('PRODUCT_NOT_FOUND');
    });
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      vi.mocked(prisma.productMaster.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.productMaster.create).mockResolvedValue(mockProduct());

      const result = await service.createProduct({
        sku: 'STEEL-001', name: 'Steel Bar 12mm', manufacturerId: 'org-1',
      }, 'user-1');

      expect(result.id).toBe('prod-1');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw on duplicate SKU', async () => {
      vi.mocked(prisma.productMaster.findUnique).mockResolvedValue(mockProduct());

      await expect(service.createProduct({
        sku: 'STEEL-001', name: 'Steel Bar 12mm', manufacturerId: 'org-1',
      }, 'user-1')).rejects.toThrow('PRODUCT_SKU_DUPLICATE');
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      vi.mocked(prisma.productMaster.findUnique).mockResolvedValue(mockProduct());
      vi.mocked(prisma.productMaster.update).mockResolvedValue(mockProduct({ name: 'Updated' }));

      const result = await service.updateProduct('prod-1', { name: 'Updated' });
      expect(result).toBeDefined();
    });
  });

  describe('transitionProduct', () => {
    it('should transition product status', async () => {
      vi.mocked(prisma.productMaster.findUnique).mockResolvedValue(mockProduct());
      vi.mocked(prisma.productMaster.update).mockResolvedValue(mockProduct({ status: 'PUBLISHED' }));

      const result = await service.transitionProduct('prod-1', 'publish', 'user-1');

      expect(result.currentStatus).toBe('PUBLISHED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw on invalid transition', async () => {
      vi.mocked(prisma.productMaster.findUnique).mockResolvedValue(mockProduct({ status: 'PUBLISHED' }));

      await expect(service.transitionProduct('prod-1', 'publish', 'user-1')).rejects.toThrow('PRODUCT_INVALID_TRANSITION');
    });
  });

  // ================== Variants ==================

  describe('createVariant', () => {
    it('should create a variant', async () => {
      vi.mocked(prisma.productMaster.findUnique).mockResolvedValue(mockProduct());
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.productVariant.create).mockResolvedValue({
        id: 'var-1', productId: 'prod-1', name: 'Red', sku: 'STEEL-001-RED',
        barcode: null, attributes: null, price: null, isActive: true,
        createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.createVariant({
        productId: 'prod-1', name: 'Red', sku: 'STEEL-001-RED',
      });

      expect(result.id).toBe('var-1');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });
  });

  // ================== Specifications ==================

  describe('addSpecification', () => {
    it('should add a specification', async () => {
      vi.mocked(prisma.productMaster.findUnique).mockResolvedValue(mockProduct());
      vi.mocked(prisma.productSpecification.create).mockResolvedValue({
        id: 'spec-1', productId: 'prod-1', name: 'Length', nameAr: null,
        value: '12m', valueAr: null, sortOrder: 0,
      });

      const result = await service.addSpecification('prod-1', {
        name: 'Length', value: '12m', sortOrder: 0,
      });

      expect(result.id).toBe('spec-1');
    });
  });

  describe('deleteSpecification', () => {
    it('should delete a specification', async () => {
      vi.mocked(prisma.productSpecification.findFirst).mockResolvedValue({ id: 'spec-1' } as any);
      vi.mocked(prisma.productSpecification.delete).mockResolvedValue({} as any);

      await expect(service.deleteSpecification('prod-1', 'spec-1')).resolves.not.toThrow();
    });
  });

  // ================== Data Sheets ==================

  describe('uploadDataSheet', () => {
    it('should upload a data sheet', async () => {
      vi.mocked(prisma.productMaster.findUnique).mockResolvedValue(mockProduct());
      vi.mocked(prisma.productDataSheet.create).mockResolvedValue({
        id: 'ds-1', productId: 'prod-1', title: 'Tech Spec', fileUrl: '/spec.pdf', language: 'en', createdAt: new Date(),
      });

      const result = await service.uploadDataSheet('prod-1', {
        title: 'Tech Spec', fileUrl: '/spec.pdf', language: 'en',
      });

      expect(result.id).toBe('ds-1');
    });
  });

  // ================== Safety Sheets ==================

  describe('uploadSafetySheet', () => {
    it('should upload a safety sheet', async () => {
      vi.mocked(prisma.productMaster.findUnique).mockResolvedValue(mockProduct());
      vi.mocked(prisma.productSafetySheet.create).mockResolvedValue({
        id: 'ss-1', productId: 'prod-1', title: 'Safety Data', fileUrl: '/safety.pdf', language: 'en', createdAt: new Date(),
      });

      const result = await service.uploadSafetySheet('prod-1', {
        title: 'Safety Data', fileUrl: '/safety.pdf', language: 'en',
      });

      expect(result.id).toBe('ss-1');
    });
  });

  // ================== Images ==================

  describe('uploadImage', () => {
    it('should upload an image', async () => {
      vi.mocked(prisma.productMaster.findUnique).mockResolvedValue(mockProduct());
      vi.mocked(prisma.productImage.create).mockResolvedValue({
        id: 'img-1', productId: 'prod-1', variantId: null, url: '/img.jpg', alt: null,
        sortOrder: 0, isPrimary: false,
      });

      const result = await service.uploadImage('prod-1', { url: '/img.jpg', sortOrder: 0, isPrimary: false });

      expect(result.id).toBe('img-1');
    });
  });

  describe('setPrimaryImage', () => {
    it('should set primary image', async () => {
      vi.mocked(prisma.productImage.updateMany).mockResolvedValue({ count: 1 } as any);
      vi.mocked(prisma.productImage.update).mockResolvedValue({
        id: 'img-1', productId: 'prod-1', variantId: null, url: '/img.jpg', alt: null,
        sortOrder: 0, isPrimary: true,
      });

      const result = await service.setPrimaryImage('prod-1', 'img-1');
      expect(result.isPrimary).toBe(true);
    });
  });

  // ================== Units ==================

  describe('createUnit', () => {
    it('should create a unit', async () => {
      vi.mocked(prisma.unitOfMeasure.create).mockResolvedValue({
        id: 'unit-1', name: 'Ton', nameAr: null, symbol: 't', category: 'WEIGHT', isActive: true,
      });

      const result = await service.createUnit({ name: 'Ton', symbol: 't', category: 'WEIGHT' });
      expect(result.id).toBe('unit-1');
    });
  });

  describe('listUnits', () => {
    it('should list active units', async () => {
      vi.mocked(prisma.unitOfMeasure.findMany).mockResolvedValue([{
        id: 'unit-1', name: 'Ton', nameAr: null, symbol: 't', category: 'WEIGHT', isActive: true,
      }]);

      const result = await service.listUnits();
      expect(result).toHaveLength(1);
    });
  });

  // ================== Offerings ==================

  describe('listOfferings', () => {
    it('should return paginated offerings', async () => {
      vi.mocked(prisma.supplierProductOffering.findMany).mockResolvedValue([mockOffering()]);
      vi.mocked(prisma.supplierProductOffering.count).mockResolvedValue(1);

      const result = await service.listOfferings({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOfferingById', () => {
    it('should return offering when found', async () => {
      vi.mocked(prisma.supplierProductOffering.findUnique).mockResolvedValue(mockOffering({
        product: { id: 'prod-1', sku: 'STEEL-001', name: 'Steel Bar', images: [] },
        supplier: { id: 'sp-1', companyName: 'Test Supplier', verificationLevel: 'VERIFIED', avgRating: 4.5 },
      }));

      const result = await service.findOfferingById('off-1');
      expect(result.id).toBe('off-1');
    });
  });

  describe('createOffering', () => {
    it('should create an offering', async () => {
      vi.mocked(prisma.productMaster.findUnique).mockResolvedValue(mockProduct());
      vi.mocked(prisma.supplierProductOffering.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.supplierProductOffering.create).mockResolvedValue(mockOffering());

      const result = await service.createOffering({
        productId: 'prod-1', supplierId: 'sp-1', price: 100,
        currency: 'SAR', taxRate: 0, minOrderQty: 1, availability: 'IN_STOCK', isAuthorized: false,
      }, 'user-1');

      expect(result.id).toBe('off-1');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw on duplicate offering', async () => {
      vi.mocked(prisma.productMaster.findUnique).mockResolvedValue(mockProduct());
      vi.mocked(prisma.supplierProductOffering.findUnique).mockResolvedValue(mockOffering());

      await expect(service.createOffering({
        productId: 'prod-1', supplierId: 'sp-1', price: 100,
        currency: 'SAR', taxRate: 0, minOrderQty: 1, availability: 'IN_STOCK', isAuthorized: false,
      }, 'user-1')).rejects.toThrow('OFFERING_DUPLICATE');
    });
  });

  describe('updateOffering', () => {
    it('should update an offering', async () => {
      vi.mocked(prisma.supplierProductOffering.findUnique).mockResolvedValue(mockOffering());
      vi.mocked(prisma.supplierProductOffering.update).mockResolvedValue(mockOffering({ price: 120 }));

      const result = await service.updateOffering('off-1', { price: 120 });

      expect(result).toBeDefined();
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw on invalid price', async () => {
      vi.mocked(prisma.supplierProductOffering.findUnique).mockResolvedValue(mockOffering());

      await expect(service.updateOffering('off-1', { price: -5 })).rejects.toThrow('OFFERING_PRICE_INVALID');
    });
  });

  describe('transitionOffering', () => {
    it('should transition offering status', async () => {
      vi.mocked(prisma.supplierProductOffering.findUnique).mockResolvedValue(mockOffering());
      vi.mocked(prisma.supplierProductOffering.update).mockResolvedValue(mockOffering({ status: 'DISCONTINUED' }));

      const result = await service.transitionOffering('off-1', 'discontinue');

      expect(result.currentStatus).toBe('DISCONTINUED');
      expect(eventBus.publish).toHaveBeenCalledOnce();
    });

    it('should throw on invalid transition', async () => {
      vi.mocked(prisma.supplierProductOffering.findUnique).mockResolvedValue(mockOffering({ status: 'DISCONTINUED' }));

      await expect(service.transitionOffering('off-1', 'discontinue')).rejects.toThrow('OFFERING_INVALID_TRANSITION');
    });
  });
});
