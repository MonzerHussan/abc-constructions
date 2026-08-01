import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { ProductStateMachine } from '@/modules/product-catalog/workflow/state-machines/ProductStateMachine';
import { OfferingStateMachine } from '@/modules/product-catalog/workflow/state-machines/OfferingStateMachine';
import type { ProductStatusType } from '@/modules/product-catalog/workflow/state-machines/ProductStateMachine';
import type { OfferingStatusType } from '@/modules/product-catalog/workflow/state-machines/OfferingStateMachine';
import type {
  CreateProductInput, UpdateProductInput, ProductListQuery,
  CreateVariantInput, UpdateVariantInput,
  AddSpecificationInput, UpdateSpecificationInput,
  UploadDataSheetInput, UploadSafetySheetInput, UploadImageInput,
  CreateOfferingInput, UpdateOfferingInput, OfferingListQuery,
  CreateUnitInput,
} from '@/modules/product-catalog/validators/product-catalog-schemas';

export class ProductCatalogService {
  // ==================== Products ====================

  async listProducts(query: ProductListQuery) {
    const { page, limit, status, categoryId, subcategoryId, manufacturerId, brandId, search } = query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    if (manufacturerId) where.manufacturerId = manufacturerId;
    if (brandId) where.brandId = brandId;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      prisma.productMaster.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productMaster.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findProductById(id: string) {
    const product = await prisma.productMaster.findUnique({
      where: { id },
      include: {
        manufacturer: { select: { id: true, name: true, nameAr: true } },
        brand: true,
        category: true,
        subcategory: true,
        unit: true,
        variants: { where: { isActive: true } },
        specifications: { orderBy: { sortOrder: 'asc' } },
        dataSheets: true,
        safetySheets: true,
        images: { orderBy: { sortOrder: 'asc' } },
        offerings: {
          include: {
            supplier: { select: { id: true, companyName: true, verificationLevel: true } },
          },
        },
      },
    });
    if (!product) throw new Error(ProductCatalogErrors.PRODUCT_NOT_FOUND);
    return product;
  }

  async createProduct(input: CreateProductInput, userId: string) {
    const existing = await prisma.productMaster.findUnique({ where: { sku: input.sku } });
    if (existing) throw new Error(ProductCatalogErrors.PRODUCT_SKU_DUPLICATE);

    const product = await prisma.productMaster.create({
      data: {
        sku: input.sku,
        name: input.name,
        nameAr: input.nameAr ?? null,
        nameUr: input.nameUr ?? null,
        description: input.description ?? null,
        descriptionAr: input.descriptionAr ?? null,
        descriptionUr: input.descriptionUr ?? null,
        manufacturerId: input.manufacturerId,
        brandId: input.brandId ?? null,
        categoryId: input.categoryId ?? null,
        subcategoryId: input.subcategoryId ?? null,
        unitId: input.unitId ?? null,
        barcode: input.barcode ?? null,
        gtin: input.gtin ?? null,
      },
    });

    logger.info(`Product ${product.sku} created`);

    await eventBus.publish({
      name: buildEventName('ProductCatalog', 'Product', 'Created'),
      version: 1,
      payload: { productId: product.id, sku: product.sku, manufacturerId: input.manufacturerId, categoryId: input.categoryId ?? null },
      metadata: { timestamp: new Date(), correlationId: `prod_${product.id}_${Date.now()}`, source: 'product-catalog', userId },
    });

    return product;
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    const existing = await prisma.productMaster.findUnique({ where: { id } });
    if (!existing) throw new Error(ProductCatalogErrors.PRODUCT_NOT_FOUND);

    const product = await prisma.productMaster.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.nameAr !== undefined && { nameAr: input.nameAr }),
        ...(input.nameUr !== undefined && { nameUr: input.nameUr }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.descriptionAr !== undefined && { descriptionAr: input.descriptionAr }),
        ...(input.descriptionUr !== undefined && { descriptionUr: input.descriptionUr }),
        ...(input.brandId !== undefined && { brandId: input.brandId }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.subcategoryId !== undefined && { subcategoryId: input.subcategoryId }),
        ...(input.unitId !== undefined && { unitId: input.unitId }),
        ...(input.barcode !== undefined && { barcode: input.barcode }),
        ...(input.gtin !== undefined && { gtin: input.gtin }),
      },
    });

    return product;
  }

  async transitionProduct(id: string, action: string, userId: string) {
    const existing = await prisma.productMaster.findUnique({ where: { id } });
    if (!existing) throw new Error(ProductCatalogErrors.PRODUCT_NOT_FOUND);

    const machine = new ProductStateMachine(existing.status);
    const newStatus = machine.transition(action) as ProductStatusType;

    await prisma.productMaster.update({
      where: { id },
      data: { status: newStatus },
    });

    const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
    logger.info(`Product ${existing.sku} ${actionLabel}`);

    await eventBus.publish({
      name: buildEventName('ProductCatalog', 'Product', actionLabel),
      version: 1,
      payload: { productId: id, sku: existing.sku, previousStatus: existing.status, newStatus },
      metadata: { timestamp: new Date(), correlationId: `prod_${id}_${Date.now()}`, source: 'product-catalog', userId },
    });

    return { id, sku: existing.sku, previousStatus: existing.status, currentStatus: newStatus };
  }

  // ==================== Variants ====================

  async createVariant(input: CreateVariantInput) {
    const product = await prisma.productMaster.findUnique({ where: { id: input.productId } });
    if (!product) throw new Error(ProductCatalogErrors.PRODUCT_NOT_FOUND);

    const existing = await prisma.productVariant.findUnique({ where: { sku: input.sku } });
    if (existing) throw new Error(ProductCatalogErrors.VARIANT_SKU_DUPLICATE);

    const variant = await prisma.productVariant.create({
      data: {
        productId: input.productId,
        name: input.name,
        sku: input.sku,
        barcode: input.barcode ?? null,
        attributes: input.attributes as any ?? undefined,
        price: input.price ?? null,
      },
    });

    await eventBus.publish({
      name: buildEventName('ProductCatalog', 'Variant', 'Created'),
      version: 1,
      payload: { variantId: variant.id, productId: input.productId, sku: input.sku },
      metadata: { timestamp: new Date(), correlationId: `pv_${variant.id}_${Date.now()}`, source: 'product-catalog' },
    });

    return variant;
  }

  async updateVariant(id: string, input: UpdateVariantInput) {
    const existing = await prisma.productVariant.findUnique({ where: { id } });
    if (!existing) throw new Error(ProductCatalogErrors.VARIANT_NOT_FOUND);

    const variant = await prisma.productVariant.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.barcode !== undefined && { barcode: input.barcode }),
        ...(input.attributes !== undefined && { attributes: input.attributes as any }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });

    return variant;
  }

  // ==================== Specifications ====================

  async addSpecification(productId: string, input: AddSpecificationInput) {
    const product = await prisma.productMaster.findUnique({ where: { id: productId } });
    if (!product) throw new Error(ProductCatalogErrors.PRODUCT_NOT_FOUND);

    const spec = await prisma.productSpecification.create({
      data: {
        productId,
        name: input.name,
        nameAr: input.nameAr ?? null,
        value: input.value,
        valueAr: input.valueAr ?? null,
        sortOrder: input.sortOrder ?? 0,
      },
    });

    return spec;
  }

  async updateSpecification(productId: string, specId: string, input: UpdateSpecificationInput) {
    const spec = await prisma.productSpecification.findFirst({
      where: { id: specId, productId },
    });
    if (!spec) throw new Error(ProductCatalogErrors.SPECIFICATION_NOT_FOUND);

    const updated = await prisma.productSpecification.update({
      where: { id: specId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.nameAr !== undefined && { nameAr: input.nameAr }),
        ...(input.value !== undefined && { value: input.value }),
        ...(input.valueAr !== undefined && { valueAr: input.valueAr }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      },
    });

    return updated;
  }

  async deleteSpecification(productId: string, specId: string) {
    const spec = await prisma.productSpecification.findFirst({
      where: { id: specId, productId },
    });
    if (!spec) throw new Error(ProductCatalogErrors.SPECIFICATION_NOT_FOUND);
    await prisma.productSpecification.delete({ where: { id: specId } });
  }

  // ==================== Data Sheets ====================

  async uploadDataSheet(productId: string, input: UploadDataSheetInput) {
    const product = await prisma.productMaster.findUnique({ where: { id: productId } });
    if (!product) throw new Error(ProductCatalogErrors.PRODUCT_NOT_FOUND);

    const sheet = await prisma.productDataSheet.create({
      data: {
        productId,
        title: input.title,
        fileUrl: input.fileUrl,
        language: input.language ?? 'en',
      },
    });

    return sheet;
  }

  async deleteDataSheet(id: string) {
    const sheet = await prisma.productDataSheet.findUnique({ where: { id } });
    if (!sheet) throw new Error(ProductCatalogErrors.DATA_SHEET_NOT_FOUND);
    await prisma.productDataSheet.delete({ where: { id } });
  }

  // ==================== Safety Sheets ====================

  async uploadSafetySheet(productId: string, input: UploadSafetySheetInput) {
    const product = await prisma.productMaster.findUnique({ where: { id: productId } });
    if (!product) throw new Error(ProductCatalogErrors.PRODUCT_NOT_FOUND);

    const sheet = await prisma.productSafetySheet.create({
      data: {
        productId,
        title: input.title,
        fileUrl: input.fileUrl,
        language: input.language ?? 'en',
      },
    });

    return sheet;
  }

  async deleteSafetySheet(id: string) {
    const sheet = await prisma.productSafetySheet.findUnique({ where: { id } });
    if (!sheet) throw new Error(ProductCatalogErrors.SAFETY_SHEET_NOT_FOUND);
    await prisma.productSafetySheet.delete({ where: { id } });
  }

  // ==================== Images ====================

  async uploadImage(productId: string, input: UploadImageInput) {
    const product = await prisma.productMaster.findUnique({ where: { id: productId } });
    if (!product) throw new Error(ProductCatalogErrors.PRODUCT_NOT_FOUND);

    const image = await prisma.productImage.create({
      data: {
        productId,
        url: input.url,
        alt: input.alt ?? null,
        sortOrder: input.sortOrder ?? 0,
        isPrimary: input.isPrimary ?? false,
      },
    });

    return image;
  }

  async deleteImage(id: string) {
    const image = await prisma.productImage.findUnique({ where: { id } });
    if (!image) throw new Error(ProductCatalogErrors.IMAGE_NOT_FOUND);
    await prisma.productImage.delete({ where: { id } });
  }

  async setPrimaryImage(productId: string, imageId: string) {
    await prisma.productImage.updateMany({
      where: { productId, isPrimary: true },
      data: { isPrimary: false },
    });
    const image = await prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
    return image;
  }

  // ==================== Units ====================

  async createUnit(input: CreateUnitInput) {
    const unit = await prisma.unitOfMeasure.create({
      data: {
        name: input.name,
        nameAr: input.nameAr ?? null,
        symbol: input.symbol,
        category: input.category,
      },
    });
    return unit;
  }

  async listUnits() {
    return prisma.unitOfMeasure.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  // ==================== Offerings ====================

  async listOfferings(query: OfferingListQuery) {
    const { page, limit, productId, supplierId, status, minPrice, maxPrice, availability } = query;
    const where: Record<string, unknown> = {};
    if (productId) where.productId = productId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) (where.price as Record<string, unknown>).gte = minPrice;
      if (maxPrice !== undefined) (where.price as Record<string, unknown>).lte = maxPrice;
    }
    if (availability) where.availability = availability;

    const [items, total] = await Promise.all([
      prisma.supplierProductOffering.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supplierProductOffering.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOfferingById(id: string) {
    const offering = await prisma.supplierProductOffering.findUnique({
      where: { id },
      include: {
        product: {
          select: { id: true, sku: true, name: true, images: { where: { isPrimary: true }, take: 1 } },
        },
        supplier: {
          select: { id: true, companyName: true, verificationLevel: true, avgRating: true },
        },
      },
    });
    if (!offering) throw new Error(ProductCatalogErrors.OFFERING_NOT_FOUND);
    return offering;
  }

  async createOffering(input: CreateOfferingInput, userId: string) {
    const product = await prisma.productMaster.findUnique({ where: { id: input.productId } });
    if (!product) throw new Error(ProductCatalogErrors.PRODUCT_NOT_FOUND);

    const existing = await prisma.supplierProductOffering.findUnique({
      where: { supplierId_productId: { supplierId: input.supplierId, productId: input.productId } },
    });
    if (existing) throw new Error(ProductCatalogErrors.OFFERING_DUPLICATE);

    const offering = await prisma.supplierProductOffering.create({
      data: {
        productId: input.productId,
        supplierId: input.supplierId,
        supplierSku: input.supplierSku ?? null,
        price: input.price,
        currency: input.currency ?? 'SAR',
        taxRate: input.taxRate ?? 0,
        contractPrice: input.contractPrice ?? null,
        contractMinQty: input.contractMinQty ?? null,
        tierPricing: input.tierPricing ?? undefined,
        minOrderQty: input.minOrderQty ?? 1,
        maxOrderQty: input.maxOrderQty ?? null,
        packSize: input.packSize ?? null,
        moqUnit: input.moqUnit ?? null,
        leadTimeDays: input.leadTimeDays ?? null,
        availability: input.availability ?? 'IN_STOCK',
        deliveryTerms: input.deliveryTerms ?? [],
        deliveryTimeDays: input.deliveryTimeDays ?? null,
        shippingCost: input.shippingCost ?? null,
        isAuthorized: input.isAuthorized ?? false,
        authorizationDoc: input.authorizationDoc ?? null,
        warrantyPeriod: input.warrantyPeriod ?? null,
        returnPolicy: input.returnPolicy ?? null,
        validFrom: input.validFrom ? new Date(input.validFrom) : null,
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
        notes: input.notes ?? null,
      },
    });

    logger.info(`Offering ${offering.id} created for product ${input.productId} by supplier ${input.supplierId}`);

    await eventBus.publish({
      name: buildEventName('ProductCatalog', 'Offering', 'Created'),
      version: 1,
      payload: { offeringId: offering.id, productId: input.productId, supplierId: input.supplierId, price: input.price },
      metadata: { timestamp: new Date(), correlationId: `off_${offering.id}_${Date.now()}`, source: 'product-catalog', userId },
    });

    return offering;
  }

  async updateOffering(id: string, input: UpdateOfferingInput) {
    const existing = await prisma.supplierProductOffering.findUnique({ where: { id } });
    if (!existing) throw new Error(ProductCatalogErrors.OFFERING_NOT_FOUND);

    const oldPrice = existing.price;
    const data: Record<string, unknown> = {};
    if (input.price !== undefined) {
      if (input.price <= 0) throw new Error(ProductCatalogErrors.OFFERING_PRICE_INVALID);
      data.price = input.price;
    }
    if (input.currency !== undefined) data.currency = input.currency;
    if (input.taxRate !== undefined) data.taxRate = input.taxRate;
    if (input.contractPrice !== undefined) data.contractPrice = input.contractPrice;
    if (input.contractMinQty !== undefined) data.contractMinQty = input.contractMinQty;
    if (input.tierPricing !== undefined) data.tierPricing = input.tierPricing;
    if (input.minOrderQty !== undefined) data.minOrderQty = input.minOrderQty;
    if (input.maxOrderQty !== undefined) data.maxOrderQty = input.maxOrderQty;
    if (input.packSize !== undefined) data.packSize = input.packSize;
    if (input.moqUnit !== undefined) data.moqUnit = input.moqUnit;
    if (input.leadTimeDays !== undefined) data.leadTimeDays = input.leadTimeDays;
    if (input.availability !== undefined) data.availability = input.availability;
    if (input.deliveryTerms !== undefined) data.deliveryTerms = input.deliveryTerms;
    if (input.deliveryTimeDays !== undefined) data.deliveryTimeDays = input.deliveryTimeDays;
    if (input.shippingCost !== undefined) data.shippingCost = input.shippingCost;
    if (input.isAuthorized !== undefined) data.isAuthorized = input.isAuthorized;
    if (input.authorizationDoc !== undefined) data.authorizationDoc = input.authorizationDoc;
    if (input.warrantyPeriod !== undefined) data.warrantyPeriod = input.warrantyPeriod;
    if (input.returnPolicy !== undefined) data.returnPolicy = input.returnPolicy;
    if (input.validFrom !== undefined) data.validFrom = input.validFrom ? new Date(input.validFrom) : null;
    if (input.validUntil !== undefined) data.validUntil = input.validUntil ? new Date(input.validUntil) : null;
    if (input.notes !== undefined) data.notes = input.notes;
    if (input.supplierSku !== undefined) data.supplierSku = input.supplierSku;

    const offering = await prisma.supplierProductOffering.update({
      where: { id },
      data,
    });

    if (input.price !== undefined && oldPrice !== input.price) {
      await eventBus.publish({
        name: buildEventName('ProductCatalog', 'Offering', 'PriceChanged'),
        version: 1,
        payload: { offeringId: id, productId: existing.productId, supplierId: existing.supplierId, oldPrice, newPrice: input.price },
        metadata: { timestamp: new Date(), correlationId: `off_${id}_${Date.now()}`, source: 'product-catalog' },
      });
    }

    return offering;
  }

  async transitionOffering(id: string, action: string) {
    const existing = await prisma.supplierProductOffering.findUnique({ where: { id } });
    if (!existing) throw new Error(ProductCatalogErrors.OFFERING_NOT_FOUND);

    const machine = new OfferingStateMachine(existing.status);
    const newStatus = machine.transition(action) as OfferingStatusType;

    await prisma.supplierProductOffering.update({
      where: { id },
      data: { status: newStatus },
    });

    if (newStatus === 'DISCONTINUED') {
      await eventBus.publish({
        name: buildEventName('ProductCatalog', 'Offering', 'Discontinued'),
        version: 1,
        payload: { offeringId: id, productId: existing.productId, supplierId: existing.supplierId },
        metadata: { timestamp: new Date(), correlationId: `off_${id}_${Date.now()}`, source: 'product-catalog' },
      });
    }

    return { id, previousStatus: existing.status, currentStatus: newStatus };
  }
}
