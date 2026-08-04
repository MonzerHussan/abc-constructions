import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { MarketplaceErrors } from '@/modules/shared/errors/marketplace.errors';
import { MarketplaceEvents } from '@/modules/marketplace/events';
import type {
  MarketplaceSearchQuery, CategoryNavigationQuery, CompareProductsInput,
  AddFavoriteProductInput, AddFavoriteSupplierInput, FavoriteListQuery,
  CreateProductReviewInput, UpdateProductReviewInput, CreateSupplierReviewInput, UpdateSupplierReviewInput,
  ReviewListQuery, CreateRfqFromMarketplaceInput, SupplierMatchQuery,
} from '@/modules/marketplace/validators/marketplace-schemas';

const OFFERING_INCLUDE = {
  supplier: {
    select: {
      id: true,
      companyName: true,
      companyNameAr: true,
      verificationLevel: true,
      verificationStatus: true,
      avgRating: true,
      totalRatings: true,
      country: true,
      city: true,
      onTimeDeliveryRate: true,
      performanceScore: true,
    },
  },
  stock: {
    select: {
      availableQty: true,
      reservedQty: true,
      warehouse: { select: { id: true, name: true, cityId: true, countryId: true } },
    },
  },
} as const;

export class MarketplaceService {
  // ==================== Product Discovery ====================

  async searchProducts(query: MarketplaceSearchQuery) {
    const {
      page, limit, search, categoryId, subcategoryId, brandId, manufacturerId,
      minPrice, maxPrice, currency, verificationLevel, minRating,
      country, city, inStockOnly, maxLeadTimeDays, isAuthorizedOnly, supplierId,
    } = query;

    const productWhere: Record<string, unknown> = { isActive: true, status: 'PUBLISHED' };
    if (search) {
      productWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) productWhere.categoryId = categoryId;
    if (subcategoryId) productWhere.subcategoryId = subcategoryId;
    if (brandId) productWhere.brandId = brandId;
    if (manufacturerId) productWhere.manufacturerId = manufacturerId;

    const offeringWhere: Record<string, unknown> = { status: 'ACTIVE' };
    const priceFilter: Record<string, number> = {};
    if (minPrice !== undefined) priceFilter.gte = minPrice;
    if (maxPrice !== undefined) priceFilter.lte = maxPrice;
    if (Object.keys(priceFilter).length) offeringWhere.price = priceFilter;
    if (currency) offeringWhere.currency = currency;
    if (verificationLevel) {
      offeringWhere.supplier = { verificationLevel };
    }
    if (minRating !== undefined) {
      offeringWhere.supplier = {
        ...(offeringWhere.supplier as Record<string, unknown>),
        avgRating: { gte: minRating },
      };
    }
    if (country || city) {
      const supplierGeo: Record<string, unknown> = {};
      if (country) supplierGeo.country = country;
      if (city) supplierGeo.city = city;
      offeringWhere.supplier = {
        ...(offeringWhere.supplier as Record<string, unknown>),
        ...supplierGeo,
      };
    }
    if (maxLeadTimeDays !== undefined) offeringWhere.leadTimeDays = { lte: maxLeadTimeDays };
    if (isAuthorizedOnly) offeringWhere.isAuthorized = true;
    if (supplierId) offeringWhere.supplierId = supplierId;
    if (inStockOnly) {
      offeringWhere.stock = { some: { availableQty: { gt: 0 } } };
    }

    const [products, total] = await Promise.all([
      prisma.productMaster.findMany({
        where: productWhere,
        include: {
          brand: true,
          category: true,
          subcategory: true,
          unit: true,
          images: { where: { isPrimary: true } },
          offerings: {
            where: offeringWhere,
            include: OFFERING_INCLUDE,
            orderBy: { price: 'asc' },
          },
          reviews: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productMaster.count({ where: productWhere }),
    ]);

    await eventBus.publish({
      name: MarketplaceEvents.ProductSearch,
      version: 1,
      payload: { query: { search, categoryId, subcategoryId, inStockOnly }, results: products.length },
      metadata: { timestamp: new Date(), correlationId: `mp_search_${Date.now()}`, source: 'marketplace' },
    });

    return { items: products, total, page, limit };
  }

  async getProductDetails(id: string) {
    const product = await prisma.productMaster.findUnique({
      where: { id },
      include: {
        manufacturer: { select: { id: true, name: true } },
        brand: true,
        category: true,
        subcategory: true,
        unit: true,
        variants: { where: { isActive: true } },
        specifications: { orderBy: { sortOrder: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
        dataSheets: true,
        safetySheets: true,
        offerings: {
          where: { status: 'ACTIVE' },
          include: OFFERING_INCLUDE,
          orderBy: { price: 'asc' },
        },
        reviews: {
          include: { organization: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!product) throw new Error(MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND);

    const stock = product.offerings.reduce(
      (acc, o) => acc + o.stock.reduce((s, st) => s + st.availableQty, 0),
      0
    );

    return { ...product, inStock: stock > 0, totalAvailableQty: stock };
  }

  async getCategories(query: CategoryNavigationQuery) {
    const includeCounts = query.includeCounts;
    const categories = await prisma.materialCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        subcategories: includeCounts
          ? { include: { _count: { select: { productMasterProducts: true } } } }
          : false,
        _count: includeCounts ? { select: { productMasterProducts: true } } : false,
      },
    });
    return categories;
  }

  // ==================== Comparison ====================

  async compareProducts(input: CompareProductsInput) {
    const products = await prisma.productMaster.findMany({
      where: { id: { in: input.productIds } },
      include: {
        brand: true,
        category: true,
        unit: true,
        images: { where: { isPrimary: true } },
        specifications: { orderBy: { sortOrder: 'asc' } },
        offerings: {
          where: { status: 'ACTIVE' },
          include: OFFERING_INCLUDE,
          orderBy: { price: 'asc' },
        },
        _count: { select: { reviews: true } },
      },
    });

    await eventBus.publish({
      name: MarketplaceEvents.CompareExecuted,
      version: 1,
      payload: { productIds: input.productIds, products: products.length },
      metadata: { timestamp: new Date(), correlationId: `mp_compare_${Date.now()}`, source: 'marketplace' },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      nameAr: p.nameAr,
      sku: p.sku,
      brand: p.brand,
      category: p.category,
      unit: p.unit,
      image: p.images[0] ?? null,
      specifications: p.specifications,
      reviewCount: p._count.reviews,
      bestPrice: p.offerings.length ? p.offerings[0].price : null,
      bestPriceCurrency: p.offerings.length ? p.offerings[0].currency : null,
      suppliersCount: p.offerings.length,
      offerings: p.offerings,
    }));
  }

  async compareSuppliers(productId: string, supplierIds?: string[]) {
    const offeringWhere: Record<string, unknown> = { productId, status: 'ACTIVE' };
    if (supplierIds?.length) offeringWhere.supplierId = { in: supplierIds };

    const offerings = await prisma.supplierProductOffering.findMany({
      where: offeringWhere,
      include: OFFERING_INCLUDE,
      orderBy: { price: 'asc' },
      take: 4,
    });

    if (!offerings.length) throw new Error(MarketplaceErrors.MARKETPLACE_OFFERING_NOT_FOUND);

    return offerings.map((o) => ({
      offeringId: o.id,
      supplier: o.supplier,
      price: o.price,
      currency: o.currency,
      minOrderQty: o.minOrderQty,
      leadTimeDays: o.leadTimeDays,
      deliveryTimeDays: o.deliveryTimeDays,
      shippingCost: o.shippingCost,
      isAuthorized: o.isAuthorized,
      warrantyPeriod: o.warrantyPeriod,
      availability: o.availability,
      inStock: o.stock.reduce((s, st) => s + st.availableQty, 0) > 0,
    }));
  }

  // ==================== Favorites ====================

  async addFavoriteProduct(orgId: string, input: AddFavoriteProductInput) {
    const product = await prisma.productMaster.findUnique({ where: { id: input.productId } });
    if (!product) throw new Error(MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND);

    const existing = await prisma.favoriteProduct.findUnique({
      where: { organizationId_productId: { organizationId: orgId, productId: input.productId } },
    });
    if (existing) throw new Error(MarketplaceErrors.MARKETPLACE_FAVORITE_PRODUCT_EXISTS);

    const favorite = await prisma.favoriteProduct.create({
      data: { organizationId: orgId, productId: input.productId },
      include: { product: { select: { id: true, name: true, sku: true } } },
    });

    await eventBus.publish({
      name: MarketplaceEvents.FavoriteProductAdded,
      version: 1,
      payload: { organizationId: orgId, productId: input.productId },
      metadata: { timestamp: new Date(), correlationId: `mp_fav_p_${Date.now()}`, source: 'marketplace' },
    });

    return favorite;
  }

  async removeFavoriteProduct(orgId: string, productId: string) {
    const existing = await prisma.favoriteProduct.findUnique({
      where: { organizationId_productId: { organizationId: orgId, productId } },
    });
    if (!existing) throw new Error(MarketplaceErrors.MARKETPLACE_FAVORITE_PRODUCT_NOT_FOUND);

    await prisma.favoriteProduct.delete({ where: { id: existing.id } });

    await eventBus.publish({
      name: MarketplaceEvents.FavoriteProductRemoved,
      version: 1,
      payload: { organizationId: orgId, productId },
      metadata: { timestamp: new Date(), correlationId: `mp_fav_p_rm_${Date.now()}`, source: 'marketplace' },
    });

    return { removed: true };
  }

  async listFavoriteProducts(orgId: string, query: FavoriteListQuery) {
    const { page, limit } = query;
    const where = { organizationId: orgId };
    const [items, total] = await Promise.all([
      prisma.favoriteProduct.findMany({
        where,
        include: {
          product: {
            include: {
              brand: true,
              category: true,
              images: { where: { isPrimary: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.favoriteProduct.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async addFavoriteSupplier(orgId: string, input: AddFavoriteSupplierInput) {
    const supplier = await prisma.supplierProfile.findUnique({ where: { id: input.supplierId } });
    if (!supplier) throw new Error(MarketplaceErrors.MARKETPLACE_SUPPLIER_NOT_FOUND);

    const existing = await prisma.favoriteSupplier.findUnique({
      where: { organizationId_supplierId: { organizationId: orgId, supplierId: input.supplierId } },
    });
    if (existing) throw new Error(MarketplaceErrors.MARKETPLACE_FAVORITE_SUPPLIER_EXISTS);

    const favorite = await prisma.favoriteSupplier.create({
      data: { organizationId: orgId, supplierId: input.supplierId },
      include: { supplier: { select: { id: true, companyName: true, verificationLevel: true } } },
    });

    await eventBus.publish({
      name: MarketplaceEvents.FavoriteSupplierAdded,
      version: 1,
      payload: { organizationId: orgId, supplierId: input.supplierId },
      metadata: { timestamp: new Date(), correlationId: `mp_fav_s_${Date.now()}`, source: 'marketplace' },
    });

    return favorite;
  }

  async removeFavoriteSupplier(orgId: string, supplierId: string) {
    const existing = await prisma.favoriteSupplier.findUnique({
      where: { organizationId_supplierId: { organizationId: orgId, supplierId } },
    });
    if (!existing) throw new Error(MarketplaceErrors.MARKETPLACE_FAVORITE_SUPPLIER_NOT_FOUND);

    await prisma.favoriteSupplier.delete({ where: { id: existing.id } });

    await eventBus.publish({
      name: MarketplaceEvents.FavoriteSupplierRemoved,
      version: 1,
      payload: { organizationId: orgId, supplierId },
      metadata: { timestamp: new Date(), correlationId: `mp_fav_s_rm_${Date.now()}`, source: 'marketplace' },
    });

    return { removed: true };
  }

  async listFavoriteSuppliers(orgId: string, query: FavoriteListQuery) {
    const { page, limit } = query;
    const where = { organizationId: orgId };
    const [items, total] = await Promise.all([
      prisma.favoriteSupplier.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true, companyName: true, companyNameAr: true,
              verificationLevel: true, avgRating: true, country: true, city: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.favoriteSupplier.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  // ==================== Reviews ====================

  async createProductReview(orgId: string, input: CreateProductReviewInput) {
    if (input.rating < 1 || input.rating > 5) throw new Error(MarketplaceErrors.MARKETPLACE_REVIEW_INVALID_RATING);

    const product = await prisma.productMaster.findUnique({ where: { id: input.productId } });
    if (!product) throw new Error(MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND);

    if (input.offeringId) {
      const offering = await prisma.supplierProductOffering.findUnique({ where: { id: input.offeringId } });
      if (!offering) throw new Error(MarketplaceErrors.MARKETPLACE_OFFERING_NOT_FOUND);
    }

    const existing = await prisma.productReview.findUnique({
      where: { productId_organizationId: { productId: input.productId, organizationId: orgId } },
    });
    if (existing) throw new Error(MarketplaceErrors.MARKETPLACE_PRODUCT_REVIEW_DUPLICATE);

    const review = await prisma.productReview.create({
      data: {
        productId: input.productId,
        offeringId: input.offeringId ?? null,
        organizationId: orgId,
        rating: input.rating,
        title: input.title ?? null,
        comment: input.comment ?? null,
        images: input.images ?? [],
      },
      include: { product: { select: { id: true, name: true } } },
    });

    await eventBus.publish({
      name: MarketplaceEvents.ReviewSubmitted,
      version: 1,
      payload: { reviewId: review.id, productId: input.productId, organizationId: orgId, rating: input.rating },
      metadata: { timestamp: new Date(), correlationId: `mp_rev_p_${Date.now()}`, source: 'marketplace' },
    });

    return review;
  }

  async updateProductReview(id: string, orgId: string, input: UpdateProductReviewInput) {
    const existing = await prisma.productReview.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new Error(MarketplaceErrors.MARKETPLACE_PRODUCT_REVIEW_NOT_FOUND);

    const review = await prisma.productReview.update({
      where: { id },
      data: {
        ...(input.rating !== undefined && { rating: input.rating }),
        ...(input.title !== undefined && { title: input.title }),
        ...(input.comment !== undefined && { comment: input.comment }),
        ...(input.images !== undefined && { images: input.images }),
      },
    });

    await eventBus.publish({
      name: MarketplaceEvents.ReviewUpdated,
      version: 1,
      payload: { reviewId: id, organizationId: orgId },
      metadata: { timestamp: new Date(), correlationId: `mp_rev_p_upd_${Date.now()}`, source: 'marketplace' },
    });

    return review;
  }

  async deleteProductReview(id: string, orgId: string) {
    const existing = await prisma.productReview.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new Error(MarketplaceErrors.MARKETPLACE_PRODUCT_REVIEW_NOT_FOUND);

    await prisma.productReview.delete({ where: { id } });

    await eventBus.publish({
      name: MarketplaceEvents.ReviewDeleted,
      version: 1,
      payload: { reviewId: id, organizationId: orgId },
      metadata: { timestamp: new Date(), correlationId: `mp_rev_p_del_${Date.now()}`, source: 'marketplace' },
    });

    return { deleted: true };
  }

  async listProductReviews(productId: string, query: ReviewListQuery) {
    const { page, limit } = query;
    const where = { productId };
    const [items, total] = await Promise.all([
      prisma.productReview.findMany({
        where,
        include: { organization: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productReview.count({ where }),
    ]);

    const aggregate = await prisma.productReview.aggregate({
      where,
      _avg: { rating: true },
      _count: { _all: true },
    });

    return { items, total, page, limit, averageRating: aggregate._avg.rating ?? 0, reviewCount: aggregate._count._all };
  }

  async createSupplierReview(orgId: string, input: CreateSupplierReviewInput) {
    if (input.rating < 1 || input.rating > 5) throw new Error(MarketplaceErrors.MARKETPLACE_REVIEW_INVALID_RATING);

    const supplier = await prisma.supplierProfile.findUnique({ where: { id: input.supplierId } });
    if (!supplier) throw new Error(MarketplaceErrors.MARKETPLACE_SUPPLIER_NOT_FOUND);

    const existing = await prisma.supplierReview.findUnique({
      where: { supplierId_organizationId: { supplierId: input.supplierId, organizationId: orgId } },
    });
    if (existing) throw new Error(MarketplaceErrors.MARKETPLACE_SUPPLIER_REVIEW_DUPLICATE);

    const review = await prisma.supplierReview.create({
      data: {
        supplierId: input.supplierId,
        organizationId: orgId,
        rating: input.rating,
        title: input.title ?? null,
        comment: input.comment ?? null,
      },
      include: { supplier: { select: { id: true, companyName: true } } },
    });

    await eventBus.publish({
      name: MarketplaceEvents.ReviewSubmitted,
      version: 1,
      payload: { reviewId: review.id, supplierId: input.supplierId, organizationId: orgId, rating: input.rating },
      metadata: { timestamp: new Date(), correlationId: `mp_rev_s_${Date.now()}`, source: 'marketplace' },
    });

    return review;
  }

  async updateSupplierReview(id: string, orgId: string, input: UpdateSupplierReviewInput) {
    const existing = await prisma.supplierReview.findFirst({ where: { id, organizationId: orgId } });
    if (!existing) throw new Error(MarketplaceErrors.MARKETPLACE_SUPPLIER_REVIEW_NOT_FOUND);

    const review = await prisma.supplierReview.update({
      where: { id },
      data: {
        ...(input.rating !== undefined && { rating: input.rating }),
        ...(input.title !== undefined && { title: input.title }),
        ...(input.comment !== undefined && { comment: input.comment }),
      },
    });

    await eventBus.publish({
      name: MarketplaceEvents.ReviewUpdated,
      version: 1,
      payload: { reviewId: id, organizationId: orgId },
      metadata: { timestamp: new Date(), correlationId: `mp_rev_s_upd_${Date.now()}`, source: 'marketplace' },
    });

    return review;
  }

  async listSupplierReviews(supplierId: string, query: ReviewListQuery) {
    const { page, limit } = query;
    const where = { supplierId };
    const [items, total] = await Promise.all([
      prisma.supplierReview.findMany({
        where,
        include: { organization: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supplierReview.count({ where }),
    ]);

    const aggregate = await prisma.supplierReview.aggregate({
      where,
      _avg: { rating: true },
      _count: { _all: true },
    });

    return { items, total, page, limit, averageRating: aggregate._avg.rating ?? 0, reviewCount: aggregate._count._all };
  }

  // ==================== RFQ Gateway ====================

  async matchSuppliersForProduct(query: SupplierMatchQuery) {
    const { productId, limit } = query;

    const product = await prisma.productMaster.findUnique({ where: { id: productId } });
    if (!product) throw new Error(MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND);

    const suppliers = await prisma.supplierProfile.findMany({
      where: {
        isActive: true,
        verificationLevel: { not: 'UNVERIFIED' },
        productOfferings: { some: { productId, status: 'ACTIVE' } },
      },
      select: {
        id: true,
        userId: true,
        companyName: true,
        companyNameAr: true,
        verificationLevel: true,
        avgRating: true,
        totalRatings: true,
        onTimeDeliveryRate: true,
        performanceScore: true,
        country: true,
        city: true,
        leadTimeDays: true,
        productOfferings: {
          where: { productId, status: 'ACTIVE' },
          select: {
            id: true, price: true, currency: true, leadTimeDays: true,
            availability: true, deliveryTimeDays: true, isAuthorized: true,
          },
        },
      },
      take: limit,
    });

    const ranked = suppliers
      .map((s) => {
        const score =
          (s.verificationLevel === 'TRUSTED' || s.verificationLevel === 'FLAGSHIP' ? 40 : s.verificationLevel === 'VERIFIED' ? 25 : 10) +
          Math.min(s.avgRating * 6, 30) +
          Math.min(s.onTimeDeliveryRate / 2, 20) +
          Math.min(s.performanceScore, 10);
        return { ...s, matchScore: Math.round(score) };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    await eventBus.publish({
      name: MarketplaceEvents.SupplierMatch,
      version: 1,
      payload: { productId, suppliers: ranked.length },
      metadata: { timestamp: new Date(), correlationId: `mp_match_${Date.now()}`, source: 'marketplace' },
    });

    return { productId, suppliers: ranked };
  }

  async createRfqFromMarketplace(input: CreateRfqFromMarketplaceInput, userId: string) {
    const product = await prisma.productMaster.findUnique({
      where: { id: input.productId },
      include: { unit: true, offerings: { where: { status: 'ACTIVE' } } },
    });
    if (!product) throw new Error(MarketplaceErrors.MARKETPLACE_PRODUCT_NOT_FOUND);
    if (!product.offerings.length) throw new Error(MarketplaceErrors.MARKETPLACE_PRODUCT_OUT_OF_STOCK);

    let supplierIds = input.supplierIds ?? [];
    if (input.autoMatchSuppliers && !supplierIds.length) {
      const matched = await this.matchSuppliersForProduct({
        productId: input.productId,
        limit: 5,
      });
      supplierIds = matched.suppliers.map((s) => s.userId);
    }

    const referenceNumber = `MP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const rfq = await prisma.rFQ.create({
      data: {
        title: `RFQ: ${product.name}`,
        referenceNumber,
        organizationId: input.organizationId ?? null,
        projectId: input.projectId ?? null,
        deadlineDate: new Date(input.deadlineDate),
        deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null,
        deliveryLocation: input.deliveryLocation ?? null,
        termsAndConditions: input.notes ?? null,
        createdById: userId,
        items: {
          create: [{
            materialName: product.name,
            quantity: input.quantity,
            unit: input.unit ?? product.unit?.name ?? 'unit',
            specifications: input.notes ?? null,
          }],
        },
        suppliers: supplierIds.length
          ? {
              create: supplierIds.map((supplierId) => ({
                supplierId,
                organizationId: input.organizationId ?? null,
              })),
            }
          : undefined,
      },
      include: {
        createdBy: { select: { id: true, name: true, companyName: true } },
        items: true,
        suppliers: { select: { id: true, supplierId: true } },
        _count: { select: { quotations: true, suppliers: true } },
      },
    });

    await eventBus.publish({
      name: MarketplaceEvents.RFQInitiated,
      version: 1,
      payload: {
        rfqId: rfq.id,
        productId: input.productId,
        referenceNumber,
        organizationId: input.organizationId ?? null,
        itemsCount: rfq.items.length,
        supplierCount: rfq.suppliers.length,
      },
      metadata: { timestamp: new Date(), correlationId: `mp_rfq_${rfq.id}_${Date.now()}`, source: 'marketplace', userId },
    });

    logger.info('RFQ initiated from marketplace', { rfqId: rfq.id, productId: input.productId, userId });

    return {
      id: rfq.id,
      referenceNumber: rfq.referenceNumber,
      title: rfq.title,
      status: rfq.status,
      deadlineDate: rfq.deadlineDate.toISOString(),
      createdAt: rfq.createdAt.toISOString(),
      itemsCount: rfq.items.length,
      suppliersCount: rfq.suppliers.length,
    };
  }
}
