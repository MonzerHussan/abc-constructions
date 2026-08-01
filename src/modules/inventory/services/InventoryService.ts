import { prisma } from '@/lib/prisma';
import { logger } from '@/modules/shared/utils/logger';
import { eventBus } from '@/modules/shared/events/event-bus';
import { buildEventName } from '@/modules/shared/events/types';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { WarehouseStateMachine } from '@/modules/inventory/workflow/state-machines/WarehouseStateMachine';
import type { WarehouseStatusType } from '@/modules/inventory/workflow/state-machines/WarehouseStateMachine';
import type {
  CreateWarehouseInput, UpdateWarehouseInput, WarehouseListQuery,
  CreateStockItemInput, UpdateStockItemInput, StockItemListQuery,
  AdjustStockInput, TransferStockInput,
  CreateTransactionInput, TransactionListQuery,
  CreateImportInput, UpdateImportStatusInput, ImportListQuery,
  StockLevelQuery,
} from '@/modules/inventory/validators/inventory-schemas';

export class InventoryService {
  // ==================== Warehouses ====================

  async listWarehouses(query: WarehouseListQuery) {
    const { page, limit, supplierId, status, isPrimary, search } = query;
    const where: Record<string, unknown> = {};
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;
    if (isPrimary !== undefined) where.isPrimary = isPrimary;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      prisma.warehouse.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { supplier: { select: { id: true, companyName: true, verificationLevel: true } } },
      }),
      prisma.warehouse.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findWarehouseById(id: string) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, companyName: true, verificationLevel: true } },
        stockItems: { orderBy: { updatedAt: 'desc' } },
      },
    });
    if (!warehouse) throw new Error(InventoryErrors.WAREHOUSE_NOT_FOUND);
    return warehouse;
  }

  async createWarehouse(input: CreateWarehouseInput, userId: string) {
    const supplier = await prisma.supplierProfile.findUnique({ where: { id: input.supplierId } });
    if (!supplier) throw new Error(InventoryErrors.WAREHOUSE_SUPPLIER_MISMATCH);

    const duplicate = await prisma.warehouse.findFirst({
      where: { supplierId: input.supplierId, name: input.name },
    });
    if (duplicate) throw new Error(InventoryErrors.WAREHOUSE_NAME_DUPLICATE);

    if (input.isPrimary) {
      await prisma.warehouse.updateMany({
        where: { supplierId: input.supplierId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        supplierId: input.supplierId,
        name: input.name,
        nameAr: input.nameAr ?? null,
        address: input.address,
        cityId: input.cityId ?? null,
        countryId: input.countryId ?? null,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        phone: input.phone ?? null,
        managerName: input.managerName ?? null,
        isPrimary: input.isPrimary ?? false,
      },
    });

    logger.info(`Warehouse ${warehouse.id} created for supplier ${input.supplierId}`);

    await eventBus.publish({
      name: buildEventName('Inventory', 'Warehouse', 'Created'),
      version: 1,
      payload: { warehouseId: warehouse.id, supplierId: input.supplierId, name: warehouse.name },
      metadata: { timestamp: new Date(), correlationId: `wh_${warehouse.id}_${Date.now()}`, source: 'inventory', userId },
    });

    return warehouse;
  }

  async updateWarehouse(id: string, input: UpdateWarehouseInput) {
    const existing = await prisma.warehouse.findUnique({ where: { id } });
    if (!existing) throw new Error(InventoryErrors.WAREHOUSE_NOT_FOUND);

    if (input.isPrimary) {
      await prisma.warehouse.updateMany({
        where: { supplierId: existing.supplierId, isPrimary: true, id: { not: id } },
        data: { isPrimary: false },
      });
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.nameAr !== undefined && { nameAr: input.nameAr }),
        ...(input.address !== undefined && { address: input.address }),
        ...(input.cityId !== undefined && { cityId: input.cityId }),
        ...(input.countryId !== undefined && { countryId: input.countryId }),
        ...(input.lat !== undefined && { lat: input.lat }),
        ...(input.lng !== undefined && { lng: input.lng }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.managerName !== undefined && { managerName: input.managerName }),
        ...(input.isPrimary !== undefined && { isPrimary: input.isPrimary }),
      },
    });

    logger.info(`Warehouse ${id} updated`);

    await eventBus.publish({
      name: buildEventName('Inventory', 'Warehouse', 'Updated'),
      version: 1,
      payload: { warehouseId: id },
      metadata: { timestamp: new Date(), correlationId: `wh_${id}_${Date.now()}`, source: 'inventory' },
    });

    return warehouse;
  }

  async transitionWarehouseStatus(id: string, action: string, userId: string) {
    const existing = await prisma.warehouse.findUnique({ where: { id } });
    if (!existing) throw new Error(InventoryErrors.WAREHOUSE_NOT_FOUND);

    const machine = new WarehouseStateMachine(existing.status);
    const newStatus = machine.transition(action) as WarehouseStatusType;

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: { status: newStatus },
    });

    logger.info(`Warehouse ${id} status changed to ${newStatus}`);

    await eventBus.publish({
      name: buildEventName('Inventory', 'Warehouse', 'StatusChanged'),
      version: 1,
      payload: { warehouseId: id, from: existing.status, to: newStatus },
      metadata: { timestamp: new Date(), correlationId: `wh_${id}_${Date.now()}`, source: 'inventory', userId },
    });

    return warehouse;
  }

  // ==================== Stock Items ====================

  async listStockItems(query: StockItemListQuery) {
    const { page, limit, warehouseId, offeringId, lowStock, expiryDateBefore, search } = query;
    const where: Record<string, unknown> = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (offeringId) where.offeringId = offeringId;
    if (expiryDateBefore) where.expiryDate = { lte: new Date(expiryDateBefore) };

    const [allItems, total] = await Promise.all([
      prisma.stockItem.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: {
          warehouse: { select: { id: true, name: true, supplierId: true } },
          offering: { select: { id: true, price: true, currency: true, status: true, product: { select: { id: true, name: true, sku: true } } } },
        },
      }),
      prisma.stockItem.count({ where }),
    ]);

    let items = allItems;
    if (lowStock) items = items.filter((i) => i.availableQty <= i.reorderPoint && i.reorderPoint > 0);
    if (search) {
      const term = search.toLowerCase();
      items = items.filter((i) => (i.offering?.product?.name ?? '').toLowerCase().includes(term));
    }

    const paginated = items.slice((page - 1) * limit, page * limit);

    return { items: paginated, total, page, limit };
  }

  async findStockItemById(id: string) {
    const stockItem = await prisma.stockItem.findUnique({
      where: { id },
      include: {
        warehouse: true,
        offering: { include: { product: true, supplier: { select: { id: true, companyName: true } } } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!stockItem) throw new Error(InventoryErrors.STOCK_ITEM_NOT_FOUND);
    return stockItem;
  }

  async createStockItem(input: CreateStockItemInput, userId: string) {
    const warehouse = await prisma.warehouse.findUnique({ where: { id: input.warehouseId } });
    if (!warehouse) throw new Error(InventoryErrors.WAREHOUSE_NOT_FOUND);

    const offering = await prisma.supplierProductOffering.findUnique({ where: { id: input.offeringId } });
    if (!offering) throw new Error(ProductCatalogErrors.OFFERING_NOT_FOUND);
    if (offering.status === 'DISCONTINUED') throw new Error(InventoryErrors.STOCK_ITEM_DISCONTINUED);

    if (offering.supplierId !== warehouse.supplierId) {
      throw new Error(InventoryErrors.WAREHOUSE_SUPPLIER_MISMATCH);
    }

    const duplicate = await prisma.stockItem.findUnique({
      where: { warehouseId_offeringId: { warehouseId: input.warehouseId, offeringId: input.offeringId } },
    });
    if (duplicate) throw new Error(InventoryErrors.STOCK_ITEM_DUPLICATE);

    const availableQty = input.availableQty ?? (input.physicalQty - input.reservedQty - input.damagedQty);

    const stockItem = await prisma.stockItem.create({
      data: {
        warehouseId: input.warehouseId,
        offeringId: input.offeringId,
        physicalQty: input.physicalQty,
        reservedQty: input.reservedQty,
        availableQty,
        damagedQty: input.damagedQty,
        minStockLevel: input.minStockLevel,
        reorderPoint: input.reorderPoint,
        maxStockQty: input.maxStockQty ?? null,
        unitCost: input.unitCost ?? null,
        currency: input.currency,
        batch: input.batch ?? null,
        lotNumber: input.lotNumber ?? null,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
      },
    });

    logger.info(`Stock item ${stockItem.id} created in warehouse ${input.warehouseId}`);

    await eventBus.publish({
      name: buildEventName('Inventory', 'Stock', 'Created'),
      version: 1,
      payload: { stockItemId: stockItem.id, warehouseId: input.warehouseId, offeringId: input.offeringId, availableQty },
      metadata: { timestamp: new Date(), correlationId: `si_${stockItem.id}_${Date.now()}`, source: 'inventory', userId },
    });

    return stockItem;
  }

  async updateStockItem(id: string, input: UpdateStockItemInput) {
    const existing = await prisma.stockItem.findUnique({ where: { id } });
    if (!existing) throw new Error(InventoryErrors.STOCK_ITEM_NOT_FOUND);

    const data: Record<string, unknown> = {};
    if (input.physicalQty !== undefined) data.physicalQty = input.physicalQty;
    if (input.reservedQty !== undefined) data.reservedQty = input.reservedQty;
    if (input.damagedQty !== undefined) data.damagedQty = input.damagedQty;
    if (input.minStockLevel !== undefined) data.minStockLevel = input.minStockLevel;
    if (input.reorderPoint !== undefined) data.reorderPoint = input.reorderPoint;
    if (input.maxStockQty !== undefined) data.maxStockQty = input.maxStockQty;
    if (input.unitCost !== undefined) data.unitCost = input.unitCost;
    if (input.currency !== undefined) data.currency = input.currency;
    if (input.batch !== undefined) data.batch = input.batch;
    if (input.lotNumber !== undefined) data.lotNumber = input.lotNumber;
    if (input.expiryDate !== undefined) data.expiryDate = input.expiryDate ? new Date(input.expiryDate) : null;

    if (input.physicalQty !== undefined || input.reservedQty !== undefined || input.damagedQty !== undefined) {
      const physical = input.physicalQty ?? existing.physicalQty;
      const reserved = input.reservedQty ?? existing.reservedQty;
      const damaged = input.damagedQty ?? existing.damagedQty;
      data.availableQty = physical - reserved - damaged;
    }

    const stockItem = await prisma.stockItem.update({
      where: { id },
      data: data as never,
    });

    logger.info(`Stock item ${id} updated`);

    await eventBus.publish({
      name: buildEventName('Inventory', 'Stock', 'Updated'),
      version: 1,
      payload: { stockItemId: id },
      metadata: { timestamp: new Date(), correlationId: `si_${id}_${Date.now()}`, source: 'inventory' },
    });

    return stockItem;
  }

  async adjustStock(id: string, input: AdjustStockInput, userId: string) {
    const existing = await prisma.stockItem.findUnique({ where: { id } });
    if (!existing) throw new Error(InventoryErrors.STOCK_ITEM_NOT_FOUND);

    const adjustedQty = input.quantity;
    if (adjustedQty === 0) throw new Error(InventoryErrors.INVALID_TRANSACTION_TYPE);

    const newPhysical = existing.physicalQty + adjustedQty;
    if (newPhysical < 0) throw new Error(InventoryErrors.NEGATIVE_QUANTITY_INVALID);

    const stockItem = await prisma.$transaction(async (tx) => {
      const updated = await tx.stockItem.update({
        where: { id },
        data: {
          physicalQty: newPhysical,
          availableQty: newPhysical - existing.reservedQty - existing.damagedQty,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          stockItemId: id,
          type: 'ADJUSTED',
          quantity: adjustedQty,
          referenceType: input.referenceType ?? null,
          referenceId: input.referenceId ?? null,
          notes: input.reason,
          createdById: userId,
        },
      });

      return updated;
    });

    logger.info(`Stock item ${id} adjusted by ${adjustedQty}`);

    await eventBus.publish({
      name: buildEventName('Inventory', 'Stock', 'Adjusted'),
      version: 1,
      payload: { stockItemId: id, quantity: adjustedQty, reason: input.reason },
      metadata: { timestamp: new Date(), correlationId: `si_${id}_${Date.now()}`, source: 'inventory', userId },
    });

    if (stockItem.availableQty <= stockItem.reorderPoint && stockItem.reorderPoint > 0) {
      await eventBus.publish({
        name: buildEventName('Inventory', 'Stock', 'LowStockAlert'),
        version: 1,
        payload: { stockItemId: id, availableQty: stockItem.availableQty, reorderPoint: stockItem.reorderPoint },
        metadata: { timestamp: new Date(), correlationId: `si_${id}_${Date.now()}`, source: 'inventory' },
      });
    }

    return stockItem;
  }

  async transferStock(input: TransferStockInput, userId: string) {
    if (input.fromWarehouseId === input.toWarehouseId) {
      throw new Error(InventoryErrors.INVALID_TRANSACTION_TYPE);
    }

    const [fromStock, toWarehouse] = await Promise.all([
      prisma.stockItem.findUnique({
        where: { warehouseId_offeringId: { warehouseId: input.fromWarehouseId, offeringId: input.offeringId } },
      }),
      prisma.warehouse.findUnique({ where: { id: input.toWarehouseId } }),
    ]);
    if (!fromStock) throw new Error(InventoryErrors.STOCK_ITEM_NOT_FOUND);
    if (!toWarehouse) throw new Error(InventoryErrors.WAREHOUSE_NOT_FOUND);
    if (fromStock.availableQty < input.quantity) throw new Error(InventoryErrors.INSUFFICIENT_AVAILABLE_STOCK);

    const result = await prisma.$transaction(async (tx) => {
      const fromUpdated = await tx.stockItem.update({
        where: { id: fromStock.id },
        data: {
          physicalQty: fromStock.physicalQty - input.quantity,
          availableQty: fromStock.availableQty - input.quantity,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          stockItemId: fromStock.id,
          type: 'TRANSFERRED_OUT',
          quantity: -input.quantity,
          referenceType: 'WAREHOUSE',
          referenceId: input.toWarehouseId,
          notes: input.notes ?? null,
          createdById: userId,
        },
      });

      const toStock = await tx.stockItem.upsert({
        where: { warehouseId_offeringId: { warehouseId: input.toWarehouseId, offeringId: input.offeringId } },
        create: {
          warehouseId: input.toWarehouseId,
          offeringId: input.offeringId,
          physicalQty: input.quantity,
          availableQty: input.quantity,
          reservedQty: 0,
          damagedQty: 0,
          minStockLevel: 0,
          reorderPoint: 0,
        },
        update: {
          physicalQty: { increment: input.quantity },
          availableQty: { increment: input.quantity },
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          stockItemId: toStock.id,
          type: 'TRANSFERRED_IN',
          quantity: input.quantity,
          referenceType: 'WAREHOUSE',
          referenceId: input.fromWarehouseId,
          notes: input.notes ?? null,
          createdById: userId,
        },
      });

      return { from: fromUpdated, to: toStock };
    });

    logger.info(`Stock ${input.offeringId} transferred from ${input.fromWarehouseId} to ${input.toWarehouseId}`);

    await eventBus.publish({
      name: buildEventName('Inventory', 'Stock', 'TransferCompleted'),
      version: 1,
      payload: { offeringId: input.offeringId, fromWarehouseId: input.fromWarehouseId, toWarehouseId: input.toWarehouseId, quantity: input.quantity },
      metadata: { timestamp: new Date(), correlationId: `tr_${input.fromWarehouseId}_${Date.now()}`, source: 'inventory', userId },
    });

    return result;
  }

  async reserveStock(id: string, quantity: number, referenceId: string, userId: string) {
    const existing = await prisma.stockItem.findUnique({ where: { id } });
    if (!existing) throw new Error(InventoryErrors.STOCK_ITEM_NOT_FOUND);
    if (quantity <= 0) throw new Error(InventoryErrors.NEGATIVE_QUANTITY_INVALID);
    if (existing.availableQty < quantity) throw new Error(InventoryErrors.INSUFFICIENT_AVAILABLE_STOCK);

    const stockItem = await prisma.$transaction(async (tx) => {
      const updated = await tx.stockItem.update({
        where: { id },
        data: {
          reservedQty: existing.reservedQty + quantity,
          availableQty: existing.availableQty - quantity,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          stockItemId: id,
          type: 'RESERVED',
          quantity: quantity,
          referenceType: 'ORDER',
          referenceId: referenceId,
          createdById: userId,
        },
      });

      return updated;
    });

    await eventBus.publish({
      name: buildEventName('Inventory', 'Stock', 'Released'),
      version: 1,
      payload: { stockItemId: id, quantity, referenceId },
      metadata: { timestamp: new Date(), correlationId: `rs_${id}_${Date.now()}`, source: 'inventory', userId },
    });

    return stockItem;
  }

  async releaseReservation(id: string, quantity: number, referenceId: string, userId: string) {
    const existing = await prisma.stockItem.findUnique({ where: { id } });
    if (!existing) throw new Error(InventoryErrors.STOCK_ITEM_NOT_FOUND);
    if (quantity <= 0) throw new Error(InventoryErrors.NEGATIVE_QUANTITY_INVALID);
    if (existing.reservedQty < quantity) throw new Error(InventoryErrors.INSUFFICIENT_STOCK);

    const stockItem = await prisma.$transaction(async (tx) => {
      const updated = await tx.stockItem.update({
        where: { id },
        data: {
          reservedQty: existing.reservedQty - quantity,
          availableQty: existing.availableQty + quantity,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          stockItemId: id,
          type: 'UNRESERVED',
          quantity: -quantity,
          referenceType: 'ORDER',
          referenceId: referenceId,
          createdById: userId,
        },
      });

      return updated;
    });

    await eventBus.publish({
      name: buildEventName('Inventory', 'Stock', 'Released'),
      version: 1,
      payload: { stockItemId: id, quantity, referenceId },
      metadata: { timestamp: new Date(), correlationId: `rs_${id}_${Date.now()}`, source: 'inventory', userId },
    });

    return stockItem;
  }

  async countStock(id: string, physicalQty: number, userId: string) {
    const existing = await prisma.stockItem.findUnique({ where: { id } });
    if (!existing) throw new Error(InventoryErrors.STOCK_ITEM_NOT_FOUND);
    if (physicalQty < 0) throw new Error(InventoryErrors.NEGATIVE_QUANTITY_INVALID);

    const diff = physicalQty - existing.physicalQty;

    const stockItem = await prisma.$transaction(async (tx) => {
      const updated = await tx.stockItem.update({
        where: { id },
        data: {
          physicalQty,
          availableQty: physicalQty - existing.reservedQty - existing.damagedQty,
          lastCountedAt: new Date(),
        },
      });

      if (diff !== 0) {
        await tx.inventoryTransaction.create({
          data: {
            stockItemId: id,
            type: 'ADJUSTED',
            quantity: diff,
            referenceType: 'COUNT',
            notes: 'Physical stock count',
            createdById: userId,
          },
        });
      }

      return updated;
    });

    logger.info(`Stock item ${id} counted: physicalQty=${physicalQty}`);

    if (diff !== 0) {
      await eventBus.publish({
        name: buildEventName('Inventory', 'Stock', 'Adjusted'),
        version: 1,
        payload: { stockItemId: id, quantity: diff, reason: 'Physical stock count' },
        metadata: { timestamp: new Date(), correlationId: `si_${id}_${Date.now()}`, source: 'inventory', userId },
      });
    }

    return stockItem;
  }

  // ==================== Transactions ====================

  async createTransaction(input: CreateTransactionInput, userId: string) {
    const stockItem = await prisma.stockItem.findUnique({ where: { id: input.stockItemId } });
    if (!stockItem) throw new Error(InventoryErrors.STOCK_ITEM_NOT_FOUND);

    const qty = input.quantity;

    const transaction = await prisma.$transaction(async (tx) => {
      let newPhysical = stockItem.physicalQty;
      let newReserved = stockItem.reservedQty;

      switch (input.type) {
        case 'RECEIVED':
        case 'RETURNED':
        case 'TRANSFERRED_IN':
          newPhysical += qty;
          break;
        case 'SHIPPED':
        case 'TRANSFERRED_OUT':
        case 'DAMAGED':
        case 'EXPIRED':
          newPhysical -= qty;
          break;
        case 'RESERVED':
          newReserved += qty;
          break;
        case 'UNRESERVED':
          newReserved -= qty;
          break;
        case 'ADJUSTED':
          newPhysical += qty;
          break;
        default:
          throw new Error(InventoryErrors.INVALID_TRANSACTION_TYPE);
      }

      if (newPhysical < 0) throw new Error(InventoryErrors.NEGATIVE_QUANTITY_INVALID);
      if (newReserved < 0) throw new Error(InventoryErrors.INSUFFICIENT_STOCK);
      if (newPhysical - newReserved - stockItem.damagedQty < 0 && input.type !== 'SHIPPED' && input.type !== 'TRANSFERRED_OUT') {
        throw new Error(InventoryErrors.INSUFFICIENT_AVAILABLE_STOCK);
      }

      const updated = await tx.stockItem.update({
        where: { id: input.stockItemId },
        data: {
          physicalQty: newPhysical,
          reservedQty: newReserved,
          availableQty: newPhysical - newReserved - stockItem.damagedQty,
        },
      });

      const txRecord = await tx.inventoryTransaction.create({
        data: {
          stockItemId: input.stockItemId,
          type: input.type,
          quantity: qty,
          referenceType: input.referenceType ?? null,
          referenceId: input.referenceId ?? null,
          notes: input.notes ?? null,
          createdById: userId,
        },
      });

      return { updated, txRecord };
    });

    await eventBus.publish({
      name: buildEventName('Inventory', 'Transaction', 'Created'),
      version: 1,
      payload: { transactionId: transaction.txRecord.id, stockItemId: input.stockItemId, type: input.type, quantity: qty },
      metadata: { timestamp: new Date(), correlationId: `tx_${transaction.txRecord.id}_${Date.now()}`, source: 'inventory', userId },
    });

    return transaction;
  }

  async listTransactions(query: TransactionListQuery) {
    const { page, limit, stockItemId, type, referenceType, referenceId, startDate, endDate } = query;
    const where: Record<string, unknown> = {};
    if (stockItemId) where.stockItemId = stockItemId;
    if (type) where.type = type;
    if (referenceType) where.referenceType = referenceType;
    if (referenceId) where.referenceId = referenceId;
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    const [items, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          stockItem: {
            select: {
              id: true,
              warehouse: { select: { id: true, name: true } },
              offering: { select: { id: true, product: { select: { id: true, name: true, sku: true } } } },
            },
          },
        },
      }),
      prisma.inventoryTransaction.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  // ==================== Imports ====================

  async createImport(input: CreateImportInput, userId: string) {
    const supplier = await prisma.supplierProfile.findUnique({ where: { id: input.supplierId } });
    if (!supplier) throw new Error(InventoryErrors.WAREHOUSE_SUPPLIER_MISMATCH);

    const imp = await prisma.inventoryImport.create({
      data: {
        supplierId: input.supplierId,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        format: input.format,
        createdById: userId,
      },
    });

    await eventBus.publish({
      name: buildEventName('Inventory', 'Import', 'Created'),
      version: 1,
      payload: { importId: imp.id, supplierId: input.supplierId, fileName: input.fileName },
      metadata: { timestamp: new Date(), correlationId: `im_${imp.id}_${Date.now()}`, source: 'inventory', userId },
    });

    return imp;
  }

  async listImports(query: ImportListQuery) {
    const { page, limit, supplierId, status } = query;
    const where: Record<string, unknown> = {};
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.inventoryImport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inventoryImport.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findImportById(id: string) {
    const imp = await prisma.inventoryImport.findUnique({ where: { id } });
    if (!imp) throw new Error(InventoryErrors.IMPORT_NOT_FOUND);
    return imp;
  }

  async updateImportStatus(id: string, input: UpdateImportStatusInput) {
    const existing = await prisma.inventoryImport.findUnique({ where: { id } });
    if (!existing) throw new Error(InventoryErrors.IMPORT_NOT_FOUND);

    const imp = await prisma.inventoryImport.update({
      where: { id },
      data: {
        status: input.status,
        ...(input.totalRows !== undefined && { totalRows: input.totalRows }),
        ...(input.successRows !== undefined && { successRows: input.successRows }),
        ...(input.errorRows !== undefined && { errorRows: input.errorRows }),
        ...(input.errors !== undefined && { errors: input.errors }),
        ...((input.status === 'COMPLETED' || input.status === 'PARTIALLY_COMPLETED' || input.status === 'FAILED') && { completedAt: new Date() }),
      },
    });

    if (input.status === 'COMPLETED' || input.status === 'PARTIALLY_COMPLETED') {
      await eventBus.publish({
        name: buildEventName('Inventory', 'Import', 'Completed'),
        version: 1,
        payload: { importId: id, status: input.status, successRows: input.successRows, errorRows: input.errorRows },
        metadata: { timestamp: new Date(), correlationId: `im_${id}_${Date.now()}`, source: 'inventory' },
      });
    } else if (input.status === 'FAILED') {
      await eventBus.publish({
        name: buildEventName('Inventory', 'Import', 'Failed'),
        version: 1,
        payload: { importId: id },
        metadata: { timestamp: new Date(), correlationId: `im_${id}_${Date.now()}`, source: 'inventory' },
      });
    }

    return imp;
  }

  // ==================== Stock Levels ====================

  async getStockLevels(query: StockLevelQuery) {
    const where: Record<string, unknown> = {};
    if (query.warehouseId) where.warehouseId = query.warehouseId;
    if (query.offeringId) where.offeringId = query.offeringId;

    const items = await prisma.stockItem.findMany({
      where,
      include: {
        warehouse: { select: { id: true, name: true } },
        offering: { select: { id: true, product: { select: { id: true, name: true, sku: true } } } },
      },
      orderBy: { availableQty: 'asc' },
    });

    const lowStockItems = query.lowStock ? items.filter((i) => i.availableQty <= i.reorderPoint && i.reorderPoint > 0) : items;
    const totalValue = items.reduce((sum, i) => sum + (i.availableQty * (i.unitCost ?? 0)), 0);

    return { items: lowStockItems, totalValue, currency: 'SAR' };
  }
}
