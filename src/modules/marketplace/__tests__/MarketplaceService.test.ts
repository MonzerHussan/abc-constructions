import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    productMaster: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    materialCategory: {
      findMany: vi.fn(),
    },
    supplierProductOffering: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    supplierProfile: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    favoriteProduct: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    favoriteSupplier: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    productReview: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    supplierReview: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    rFQ: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/modules/shared/events/event-bus', () => ({
  eventBus: { publish: vi.fn() },
}));

vi.mock('@/modules/shared/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { prisma } from '@/lib/prisma';
import { eventBus } from '@/modules/shared/events/event-bus';
import { MarketplaceService } from '@/modules/marketplace/services/MarketplaceService';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';
import { MarketplaceEvents } from '@/modules/marketplace/events';

const service = new MarketplaceService();

function mockProduct(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'prod-1',
    sku: 'STEEL-001',
    name: 'Steel Bar 12mm',
    nameAr: null,
    nameUr: null,
    status: 'ACTIVE',
    isActive: true,
    brand: null,
    category: { id: 'cat-1', name: 'Steel' },
    subcategory: null,
    unit: { id: 'unit-1', name: 'ton' },
    images: [],
    offerings: [],
    reviews: [],
    _count: { reviews: 0 },
    ...overrides,
  };
}

function mockOffering(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'off-1',
    productId: 'prod-1',
    supplierId: 'sup-1',
    price: 100,
    currency: 'SAR',
    status: 'ACTIVE',
    minOrderQty: 1,
    leadTimeDays: 3,
    availability: 'IN_STOCK',
    isAuthorized: true,
    supplier: { id: 'sup-1', companyName: 'Supplier A', verificationLevel: 'VERIFIED' },
    stock: [{ availableQty: 50, warehouse: { id: 'wh-1', name: 'WH1', city: 'Riyadh' } }],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MarketplaceService - Product Discovery', () => {
  it('searches products and publishes ProductSearch event', async () => {
    const product = mockProduct({
      offerings: [mockOffering()],
    });
    (prisma.productMaster.findMany as any).mockResolvedValue([product]);
    (prisma.productMaster.count as any).mockResolvedValue(1);

    const result = await service.searchProducts({
      page: 1, limit: 20, search: 'steel', inStockOnly: false, isAuthorizedOnly: false,
      sortBy: 'relevance', sortOrder: 'asc',
    });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({
      name: MarketplaceEvents.ProductSearch,
    }));
  });

  it('returns product details with stock aggregation', async () => {
    const product = mockProduct({
      offerings: [mockOffering(), mockOffering({ stock: [{ availableQty: 25 }] })],
    });
    (prisma.productMaster.findUnique as any).mockResolvedValue(product);

    const result = await service.getProductDetails('prod-1');

    expect(result.inStock).toBe(true);
    expect(result.totalAvailableQty).toBe(75);
  });

  it('throws when product not found', async () => {
    (prisma.productMaster.findUnique as any).mockResolvedValue(null);
    await expect(service.getProductDetails('nope')).rejects.toThrow(
      MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND
    );
  });

  it('lists categories with counts', async () => {
    (prisma.materialCategory.findMany as any).mockResolvedValue([
      { id: 'cat-1', name: 'Steel', _count: { productMasterProducts: 5 } },
    ]);

    const result = await service.getCategories({ includeCounts: true, onlyActive: true });

    expect(result).toHaveLength(1);
    expect(result[0]._count?.productMasterProducts).toBe(5);
  });
});

describe('MarketplaceService - Comparison', () => {
  it('compares up to 4 products and publishes CompareExecuted', async () => {
    (prisma.productMaster.findMany as any).mockResolvedValue([
      mockProduct({ offerings: [mockOffering({ price: 100 })] }),
      mockProduct({ id: 'prod-2', offerings: [mockOffering({ price: 120 })] }),
    ]);

    const result = await service.compareProducts({ productIds: ['prod-1', 'prod-2'] });

    expect(result).toHaveLength(2);
    expect(result[0].bestPrice).toBe(100);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({
      name: MarketplaceEvents.CompareExecuted,
    }));
  });

  it('compares suppliers for a product ordered by price', async () => {
    (prisma.supplierProductOffering.findMany as any).mockResolvedValue([
      mockOffering({ id: 'off-1', price: 100, supplier: { id: 'sup-1', companyName: 'A' } }),
      mockOffering({ id: 'off-2', price: 90, supplier: { id: 'sup-2', companyName: 'B' } }),
    ]);

    const result = await service.compareSuppliers('prod-1');

    expect(result).toHaveLength(2);
    expect(result[0].price).toBe(100);
  });

  it('throws when no offerings for supplier comparison', async () => {
    (prisma.supplierProductOffering.findMany as any).mockResolvedValue([]);
    await expect(service.compareSuppliers('prod-1')).rejects.toThrow(
      MarketplaceErrors.MARKETPLACE_OFFERING_NOT_FOUND
    );
  });
});

describe('MarketplaceService - Favorites', () => {
  it('adds a favorite product and publishes event', async () => {
    (prisma.productMaster.findUnique as any).mockResolvedValue(mockProduct());
    (prisma.favoriteProduct.findUnique as any).mockResolvedValue(null);
    (prisma.favoriteProduct.create as any).mockResolvedValue({ id: 'fav-1', organizationId: 'org-1', productId: 'prod-1' });

    const result = await service.addFavoriteProduct('org-1', { productId: 'prod-1' });

    expect(result.id).toBe('fav-1');
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({
      name: MarketplaceEvents.FavoriteProductAdded,
    }));
  });

  it('throws on duplicate favorite product', async () => {
    (prisma.productMaster.findUnique as any).mockResolvedValue(mockProduct());
    (prisma.favoriteProduct.findUnique as any).mockResolvedValue({ id: 'fav-1' });

    await expect(service.addFavoriteProduct('org-1', { productId: 'prod-1' })).rejects.toThrow(
      MarketplaceErrors.MARKETPLACE_FAVORITE_PRODUCT_EXISTS
    );
  });

  it('removes a favorite product', async () => {
    (prisma.favoriteProduct.findUnique as any).mockResolvedValue({ id: 'fav-1' });
    (prisma.favoriteProduct.delete as any).mockResolvedValue({ id: 'fav-1' });

    const result = await service.removeFavoriteProduct('org-1', 'prod-1');

    expect(result.removed).toBe(true);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({
      name: MarketplaceEvents.FavoriteProductRemoved,
    }));
  });

  it('lists favorite products', async () => {
    (prisma.favoriteProduct.findMany as any).mockResolvedValue([{ id: 'fav-1', product: mockProduct() }]);
    (prisma.favoriteProduct.count as any).mockResolvedValue(1);

    const result = await service.listFavoriteProducts('org-1', { page: 1, limit: 20 });

    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
  });

  it('adds and removes favorite supplier', async () => {
    (prisma.supplierProfile.findUnique as any).mockResolvedValue({ id: 'sup-1', companyName: 'A' });
    (prisma.favoriteSupplier.findUnique as any).mockResolvedValue(null);
    (prisma.favoriteSupplier.create as any).mockResolvedValue({ id: 'favs-1', organizationId: 'org-1', supplierId: 'sup-1' });

    const added = await service.addFavoriteSupplier('org-1', { supplierId: 'sup-1' });
    expect(added.id).toBe('favs-1');
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({
      name: MarketplaceEvents.FavoriteSupplierAdded,
    }));

    (prisma.favoriteSupplier.findUnique as any).mockResolvedValue({ id: 'favs-1' });
    (prisma.favoriteSupplier.delete as any).mockResolvedValue({ id: 'favs-1' });

    const removed = await service.removeFavoriteSupplier('org-1', 'sup-1');
    expect(removed.removed).toBe(true);
  });

  it('throws on missing favorite supplier when removing', async () => {
    (prisma.favoriteSupplier.findUnique as any).mockResolvedValue(null);
    await expect(service.removeFavoriteSupplier('org-1', 'sup-1')).rejects.toThrow(
      MarketplaceErrors.MARKETPLACE_FAVORITE_SUPPLIER_NOT_FOUND
    );
  });
});

describe('MarketplaceService - Reviews', () => {
  it('creates a product review and publishes ReviewSubmitted', async () => {
    (prisma.productMaster.findUnique as any).mockResolvedValue(mockProduct());
    (prisma.productReview.findUnique as any).mockResolvedValue(null);
    (prisma.productReview.create as any).mockResolvedValue({ id: 'rev-1', productId: 'prod-1', rating: 4 });

    const result = await service.createProductReview('org-1', {
      productId: 'prod-1', rating: 4, title: 'Good', comment: 'Nice',
    });

    expect(result.id).toBe('rev-1');
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({
      name: MarketplaceEvents.ReviewSubmitted,
    }));
  });

  it('rejects invalid rating', async () => {
    await expect(service.createProductReview('org-1', { productId: 'prod-1', rating: 6 })).rejects.toThrow(
      MarketplaceErrors.MARKETPLACE_REVIEW_INVALID_RATING
    );
  });

  it('rejects duplicate product review', async () => {
    (prisma.productMaster.findUnique as any).mockResolvedValue(mockProduct());
    (prisma.productReview.findUnique as any).mockResolvedValue({ id: 'rev-1' });

    await expect(service.createProductReview('org-1', { productId: 'prod-1', rating: 4 })).rejects.toThrow(
      MarketplaceErrors.MARKETPLACE_PRODUCT_REVIEW_DUPLICATE
    );
  });

  it('updates and deletes a product review', async () => {
    (prisma.productReview.findFirst as any).mockResolvedValue({ id: 'rev-1' });
    (prisma.productReview.update as any).mockResolvedValue({ id: 'rev-1', rating: 5 });
    (prisma.productReview.delete as any).mockResolvedValue({ id: 'rev-1' });

    const updated = await service.updateProductReview('rev-1', 'org-1', { rating: 5 });
    expect(updated.rating).toBe(5);

    const deleted = await service.deleteProductReview('rev-1', 'org-1');
    expect(deleted.deleted).toBe(true);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({
      name: MarketplaceEvents.ReviewDeleted,
    }));
  });

  it('lists product reviews with aggregate rating', async () => {
    (prisma.productReview.findMany as any).mockResolvedValue([{ id: 'rev-1', rating: 4 }]);
    (prisma.productReview.count as any).mockResolvedValue(1);
    (prisma.productReview.aggregate as any).mockResolvedValue({ _avg: { rating: 4 }, _count: { _all: 1 } });

    const result = await service.listProductReviews('prod-1', { page: 1, limit: 20 });

    expect(result.averageRating).toBe(4);
    expect(result.reviewCount).toBe(1);
  });

  it('creates supplier review', async () => {
    (prisma.supplierProfile.findUnique as any).mockResolvedValue({ id: 'sup-1', companyName: 'A' });
    (prisma.supplierReview.findUnique as any).mockResolvedValue(null);
    (prisma.supplierReview.create as any).mockResolvedValue({ id: 'revs-1', supplierId: 'sup-1', rating: 5 });

    const result = await service.createSupplierReview('org-1', { supplierId: 'sup-1', rating: 5, comment: 'Great' });

    expect(result.id).toBe('revs-1');
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({
      name: MarketplaceEvents.ReviewSubmitted,
    }));
  });

  it('lists supplier reviews', async () => {
    (prisma.supplierReview.findMany as any).mockResolvedValue([{ id: 'revs-1', rating: 5 }]);
    (prisma.supplierReview.count as any).mockResolvedValue(1);
    (prisma.supplierReview.aggregate as any).mockResolvedValue({ _avg: { rating: 5 }, _count: { _all: 1 } });

    const result = await service.listSupplierReviews('sup-1', { page: 1, limit: 20 });

    expect(result.averageRating).toBe(5);
  });
});

describe('MarketplaceService - RFQ Gateway', () => {
  it('matches suppliers for a product and publishes SupplierMatch', async () => {
    const suppliers = [
      {
        id: 'sup-1', userId: 'user-1', companyName: 'A', verificationLevel: 'VERIFIED',
        avgRating: 4.5, totalRatings: 10, onTimeDeliveryRate: 90, performanceScore: 8,
        leadTimeDays: 3, offerings: [mockOffering()],
      },
    ];
    (prisma.productMaster.findUnique as any).mockResolvedValue(mockProduct());
    (prisma.supplierProfile.findMany as any).mockResolvedValue(suppliers);

    const result = await service.matchSuppliersForProduct({ productId: 'prod-1', limit: 5 });

    expect(result.suppliers).toHaveLength(1);
    expect(result.suppliers[0].matchScore).toBeGreaterThan(0);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({
      name: MarketplaceEvents.SupplierMatch,
    }));
  });

  it('creates RFQ from marketplace with auto-matched suppliers', async () => {
    const product = mockProduct({
      unit: { id: 'unit-1', name: 'ton' },
      offerings: [mockOffering()],
    });
    (prisma.productMaster.findUnique as any).mockResolvedValue(product);
    (prisma.supplierProfile.findMany as any).mockResolvedValue([
      {
        id: 'sup-1', userId: 'user-1', companyName: 'A', verificationLevel: 'VERIFIED',
        avgRating: 4, totalRatings: 5, onTimeDeliveryRate: 80, performanceScore: 7,
        leadTimeDays: 3, offerings: [mockOffering()],
      },
    ]);
    (prisma.rFQ.create as any).mockResolvedValue({
      id: 'rfq-1',
      referenceNumber: 'MP-123',
      title: 'RFQ: Steel Bar 12mm',
      status: 'DRAFT',
      deadlineDate: new Date('2026-08-30'),
      createdAt: new Date(),
      items: [{ id: 'item-1', materialName: 'Steel Bar 12mm', quantity: 10, unit: 'ton' }],
      suppliers: [{ id: 'rfqs-1', supplierId: 'user-1' }],
      _count: { quotations: 0, suppliers: 1 },
    });

    const result = await service.createRfqFromMarketplace({
      productId: 'prod-1',
      quantity: 10,
      deadlineDate: '2026-08-30',
      autoMatchSuppliers: true,
    }, 'user-1');

    expect(result.id).toBe('rfq-1');
    expect(result.suppliersCount).toBe(1);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({
      name: MarketplaceEvents.RFQInitiated,
    }));
  });

  it('throws when product has no active offerings', async () => {
    (prisma.productMaster.findUnique as any).mockResolvedValue(mockProduct({ offerings: [] }));

    await expect(service.createRfqFromMarketplace({
      productId: 'prod-1', quantity: 5, deadlineDate: '2026-08-30', autoMatchSuppliers: false,
    }, 'user-1')).rejects.toThrow(MarketplaceErrors.MARKETPLACE_PRODUCT_OUT_OF_STOCK);
  });
});
