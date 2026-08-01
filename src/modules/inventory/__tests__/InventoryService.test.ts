import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    warehouse: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    stockItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    inventoryTransaction: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    inventoryImport: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    supplierProfile: {
      findUnique: vi.fn(),
    },
    supplierProductOffering: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
    $queryRawUnsafe: vi.fn(),
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
import { InventoryService } from '@/modules/inventory/services/InventoryService';
import { InventoryErrors } from '@/modules/shared/errors/inventory.errors';

const service = new InventoryService();

const txMock = prisma.$transaction as unknown as {
  mockImplementation: (impl: (callback: (tx: Record<string, unknown>) => Promise<unknown>) => Promise<unknown>) => void;
};

function mockProfile(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'sup-1',
    companyName: 'Test Supplier Co',
    verificationLevel: 'VERIFIED',
    ...overrides,
  };
}

function mockWarehouse(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'wh-1',
    supplierId: 'sup-1',
    name: 'Main Warehouse',
    nameAr: null,
    address: '123 Main St',
    cityId: null,
    countryId: null,
    lat: null,
    lng: null,
    phone: null,
    managerName: null,
    status: 'ACTIVE',
    isPrimary: true,
    isActive: true,
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    ...overrides,
  };
}

function mockStockItem(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'si-1',
    warehouseId: 'wh-1',
    offeringId: 'off-1',
    physicalQty: 100,
    reservedQty: 10,
    availableQty: 90,
    damagedQty: 0,
    minStockLevel: 5,
    reorderPoint: 10,
    maxStockQty: null,
    unitCost: null,
    currency: 'SAR',
    batch: null,
    lotNumber: null,
    expiryDate: null,
    lastCountedAt: null,
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
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
    ...overrides,
  };
}

function mockImport(overrides: Record<string, unknown> = {}): any {
  return {
    id: 'im-1',
    supplierId: 'sup-1',
    fileName: 'stock.xlsx',
    fileUrl: 'https://files/stock.xlsx',
    format: 'xlsx',
    status: 'PENDING',
    totalRows: 0,
    successRows: 0,
    errorRows: 0,
    errors: null,
    completedAt: null,
    createdById: 'user-1',
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
    ...overrides,
  };
}

describe('InventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listWarehouses', () => {
    it('should return paginated warehouses', async () => {
      const items = [mockWarehouse(), mockWarehouse({ id: 'wh-2' })];
      vi.mocked(prisma.warehouse.findMany).mockResolvedValue(items);
      vi.mocked(prisma.warehouse.count).mockResolvedValue(2);

      const result = await service.listWarehouses({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(prisma.warehouse.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 20 }));
    });

    it('should filter by supplierId and status', async () => {
      vi.mocked(prisma.warehouse.findMany).mockResolvedValue([]);
      vi.mocked(prisma.warehouse.count).mockResolvedValue(0);

      await service.listWarehouses({ page: 1, limit: 20, supplierId: 'sup-1', status: 'ACTIVE' });

      expect(prisma.warehouse.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ supplierId: 'sup-1', status: 'ACTIVE' }),
      }));
    });
  });

  describe('findWarehouseById', () => {
    it('should return warehouse with stock items', async () => {
      vi.mocked(prisma.warehouse.findUnique).mockResolvedValue(mockWarehouse());

      const result = await service.findWarehouseById('wh-1');

      expect(result.id).toBe('wh-1');
      expect(prisma.warehouse.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'wh-1' } }));
    });

    it('should throw WAREHOUSE_NOT_FOUND', async () => {
      vi.mocked(prisma.warehouse.findUnique).mockResolvedValue(null);

      await expect(service.findWarehouseById('missing')).rejects.toThrow(InventoryErrors.WAREHOUSE_NOT_FOUND);
    });
  });

  describe('createWarehouse', () => {
    it('should create warehouse and publish event', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(mockProfile());
      vi.mocked(prisma.warehouse.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.warehouse.updateMany).mockResolvedValue({ count: 0 } as never);
      vi.mocked(prisma.warehouse.create).mockResolvedValue(mockWarehouse());

      const result = await service.createWarehouse({
        supplierId: 'sup-1',
        name: 'Main Warehouse',
        address: '123 Main St',
        isPrimary: true,
      }, 'user-1');

      expect(result.id).toBe('wh-1');
      expect(prisma.warehouse.create).toHaveBeenCalled();
      expect(eventBus.publish).toHaveBeenCalled();
    });

    it('should throw WAREHOUSE_SUPPLIER_MISMATCH when supplier not found', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(null);

      await expect(service.createWarehouse({ supplierId: 'bad', name: 'W', address: 'A', isPrimary: false }, 'user-1'))
        .rejects.toThrow(InventoryErrors.WAREHOUSE_SUPPLIER_MISMATCH);
    });

    it('should throw WAREHOUSE_NAME_DUPLICATE on duplicate name', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(mockProfile());
      vi.mocked(prisma.warehouse.findFirst).mockResolvedValue(mockWarehouse());

      await expect(service.createWarehouse({ supplierId: 'sup-1', name: 'Main Warehouse', address: 'A', isPrimary: false }, 'user-1'))
        .rejects.toThrow(InventoryErrors.WAREHOUSE_NAME_DUPLICATE);
    });

    it('should demote other primary warehouses when new one is primary', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(mockProfile());
      vi.mocked(prisma.warehouse.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.warehouse.updateMany).mockResolvedValue({ count: 1 } as never);
      vi.mocked(prisma.warehouse.create).mockResolvedValue(mockWarehouse());

      await service.createWarehouse({ supplierId: 'sup-1', name: 'W', address: 'A', isPrimary: true }, 'user-1');

      expect(prisma.warehouse.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ isPrimary: true }),
        data: { isPrimary: false },
      }));
    });
  });

  describe('transitionWarehouseStatus', () => {
    it('should transition ACTIVE to INACTIVE', async () => {
      vi.mocked(prisma.warehouse.findUnique).mockResolvedValue(mockWarehouse({ status: 'ACTIVE' }));
      vi.mocked(prisma.warehouse.update).mockResolvedValue(mockWarehouse({ status: 'INACTIVE' }));

      const result = await service.transitionWarehouseStatus('wh-1', 'deactivate', 'user-1');

      expect(result.status).toBe('INACTIVE');
      expect(eventBus.publish).toHaveBeenCalled();
    });

    it('should throw WAREHOUSE_NOT_FOUND', async () => {
      vi.mocked(prisma.warehouse.findUnique).mockResolvedValue(null);

      await expect(service.transitionWarehouseStatus('missing', 'deactivate', 'user-1'))
        .rejects.toThrow(InventoryErrors.WAREHOUSE_NOT_FOUND);
    });

    it('should throw WAREHOUSE_INVALID_TRANSITION on invalid action', async () => {
      vi.mocked(prisma.warehouse.findUnique).mockResolvedValue(mockWarehouse({ status: 'CLOSED' }));

      await expect(service.transitionWarehouseStatus('wh-1', 'activate', 'user-1'))
        .rejects.toThrow(InventoryErrors.WAREHOUSE_INVALID_TRANSITION);
    });
  });

  describe('createStockItem', () => {
    it('should create stock item and publish event', async () => {
      vi.mocked(prisma.warehouse.findUnique).mockResolvedValue(mockWarehouse());
      vi.mocked(prisma.supplierProductOffering.findUnique).mockResolvedValue(mockOffering());
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.stockItem.create).mockResolvedValue(mockStockItem());

      const result = await service.createStockItem({
        warehouseId: 'wh-1',
        offeringId: 'off-1',
        physicalQty: 100,
        reservedQty: 10,
        availableQty: 90,
        damagedQty: 0,
        minStockLevel: 0,
        reorderPoint: 0,
        currency: 'SAR',
      }, 'user-1');

      expect(result.id).toBe('si-1');
      expect(eventBus.publish).toHaveBeenCalled();
    });

    it('should throw WAREHOUSE_NOT_FOUND', async () => {
      vi.mocked(prisma.warehouse.findUnique).mockResolvedValue(null);

      await expect(service.createStockItem({
        warehouseId: 'bad', offeringId: 'off-1', physicalQty: 10,
        damagedQty: 0, minStockLevel: 0, reorderPoint: 0, currency: 'SAR', reservedQty: 0, availableQty: 0,
      }, 'user-1'))
        .rejects.toThrow(InventoryErrors.WAREHOUSE_NOT_FOUND);
    });

    it('should throw STOCK_ITEM_DUPLICATE on duplicate', async () => {
      vi.mocked(prisma.warehouse.findUnique).mockResolvedValue(mockWarehouse());
      vi.mocked(prisma.supplierProductOffering.findUnique).mockResolvedValue(mockOffering());
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(mockStockItem());

      await expect(service.createStockItem({
        warehouseId: 'wh-1', offeringId: 'off-1', physicalQty: 10,
        damagedQty: 0, minStockLevel: 0, reorderPoint: 0, currency: 'SAR', reservedQty: 0, availableQty: 0,
      }, 'user-1'))
        .rejects.toThrow(InventoryErrors.STOCK_ITEM_DUPLICATE);
    });

    it('should throw WAREHOUSE_SUPPLIER_MISMATCH when offering supplier differs', async () => {
      vi.mocked(prisma.warehouse.findUnique).mockResolvedValue(mockWarehouse());
      vi.mocked(prisma.supplierProductOffering.findUnique).mockResolvedValue(mockOffering({ supplierId: 'other-sup' }));

      await expect(service.createStockItem({
        warehouseId: 'wh-1', offeringId: 'off-1', physicalQty: 10,
        damagedQty: 0, minStockLevel: 0, reorderPoint: 0, currency: 'SAR', reservedQty: 0, availableQty: 0,
      }, 'user-1'))
        .rejects.toThrow(InventoryErrors.WAREHOUSE_SUPPLIER_MISMATCH);
    });

    it('should throw STOCK_ITEM_DISCONTINUED for discontinued offering', async () => {
      vi.mocked(prisma.warehouse.findUnique).mockResolvedValue(mockWarehouse());
      vi.mocked(prisma.supplierProductOffering.findUnique).mockResolvedValue(mockOffering({ status: 'DISCONTINUED' }));

      await expect(service.createStockItem({
        warehouseId: 'wh-1', offeringId: 'off-1', physicalQty: 10,
        damagedQty: 0, minStockLevel: 0, reorderPoint: 0, currency: 'SAR', reservedQty: 0, availableQty: 0,
      }, 'user-1'))
        .rejects.toThrow(InventoryErrors.STOCK_ITEM_DISCONTINUED);
    });
  });

  describe('adjustStock', () => {
    it('should adjust stock and create transaction', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(mockStockItem());
      txMock.mockImplementation(async (callback) => {
        const tx = {
          stockItem: { update: vi.fn().mockResolvedValue(mockStockItem({ physicalQty: 120, availableQty: 110 })) },
          inventoryTransaction: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx);
      });

      const result = await service.adjustStock('si-1', { quantity: 20, reason: 'Found extra stock' }, 'user-1');

      expect(result.physicalQty).toBe(120);
      expect(eventBus.publish).toHaveBeenCalled();
    });

    it('should throw STOCK_ITEM_NOT_FOUND', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(null);

      await expect(service.adjustStock('missing', { quantity: 10, reason: 'r' }, 'user-1'))
        .rejects.toThrow(InventoryErrors.STOCK_ITEM_NOT_FOUND);
    });

    it('should throw NEGATIVE_QUANTITY_INVALID when resulting physical would be negative', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(mockStockItem({ physicalQty: 10, availableQty: 10 }));

      await expect(service.adjustStock('si-1', { quantity: -100, reason: 'damage' }, 'user-1'))
        .rejects.toThrow(InventoryErrors.NEGATIVE_QUANTITY_INVALID);
    });

    it('should publish LowStockAlert when below reorder point', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(mockStockItem({ reorderPoint: 50 }));
      txMock.mockImplementation(async (callback) => {
        const tx = {
          stockItem: { update: vi.fn().mockResolvedValue(mockStockItem({ physicalQty: 30, availableQty: 30, reorderPoint: 50 })) },
          inventoryTransaction: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx);
      });

      await service.adjustStock('si-1', { quantity: -20, reason: 'shipped' }, 'user-1');

      expect(eventBus.publish).toHaveBeenCalledTimes(2);
    });
  });

  describe('transferStock', () => {
    it('should transfer stock between warehouses', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(mockStockItem({ availableQty: 100 }));
      vi.mocked(prisma.warehouse.findUnique).mockResolvedValue(mockWarehouse({ id: 'wh-2' }));
      txMock.mockImplementation(async (callback) => {
        const tx = {
          stockItem: {
            update: vi.fn().mockResolvedValue(mockStockItem({ physicalQty: 50, availableQty: 50 })),
            upsert: vi.fn().mockResolvedValue(mockStockItem({ id: 'si-2', warehouseId: 'wh-2', physicalQty: 50, availableQty: 50 })),
          },
          inventoryTransaction: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx);
      });

      const result = await service.transferStock({ fromWarehouseId: 'wh-1', toWarehouseId: 'wh-2', offeringId: 'off-1', quantity: 50 }, 'user-1');

      expect(result.from.physicalQty).toBe(50);
      expect(result.to.physicalQty).toBe(50);
    });

    it('should throw INVALID_TRANSACTION_TYPE when transferring to same warehouse', async () => {
      await expect(service.transferStock({ fromWarehouseId: 'wh-1', toWarehouseId: 'wh-1', offeringId: 'off-1', quantity: 10 }, 'user-1'))
        .rejects.toThrow(InventoryErrors.INVALID_TRANSACTION_TYPE);
    });

    it('should throw INSUFFICIENT_AVAILABLE_STOCK when not enough stock', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(mockStockItem({ availableQty: 10 }));
      vi.mocked(prisma.warehouse.findUnique).mockResolvedValue(mockWarehouse({ id: 'wh-2' }));

      await expect(service.transferStock({ fromWarehouseId: 'wh-1', toWarehouseId: 'wh-2', offeringId: 'off-1', quantity: 50 }, 'user-1'))
        .rejects.toThrow(InventoryErrors.INSUFFICIENT_AVAILABLE_STOCK);
    });
  });

  describe('reserveStock', () => {
    it('should reserve stock and update available', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(mockStockItem());
      txMock.mockImplementation(async (callback) => {
        const tx = {
          stockItem: { update: vi.fn().mockResolvedValue(mockStockItem({ reservedQty: 20, availableQty: 80 })) },
          inventoryTransaction: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx);
      });

      const result = await service.reserveStock('si-1', 10, 'order-1', 'user-1');

      expect(result.reservedQty).toBe(20);
      expect(result.availableQty).toBe(80);
    });

    it('should throw INSUFFICIENT_AVAILABLE_STOCK', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(mockStockItem({ availableQty: 5 }));

      await expect(service.reserveStock('si-1', 10, 'order-1', 'user-1'))
        .rejects.toThrow(InventoryErrors.INSUFFICIENT_AVAILABLE_STOCK);
    });
  });

  describe('releaseReservation', () => {
    it('should release reservation', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(mockStockItem({ reservedQty: 30, availableQty: 70 }));
      txMock.mockImplementation(async (callback) => {
        const tx = {
          stockItem: { update: vi.fn().mockResolvedValue(mockStockItem({ reservedQty: 20, availableQty: 80 })) },
          inventoryTransaction: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx);
      });

      const result = await service.releaseReservation('si-1', 10, 'order-1', 'user-1');

      expect(result.reservedQty).toBe(20);
    });

    it('should throw INSUFFICIENT_STOCK when releasing more than reserved', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(mockStockItem({ reservedQty: 5 }));

      await expect(service.releaseReservation('si-1', 10, 'order-1', 'user-1'))
        .rejects.toThrow(InventoryErrors.INSUFFICIENT_STOCK);
    });
  });

  describe('countStock', () => {
    it('should update physical count and create adjustment transaction', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(mockStockItem({ physicalQty: 100, availableQty: 90 }));
      txMock.mockImplementation(async (callback) => {
        const tx = {
          stockItem: { update: vi.fn().mockResolvedValue(mockStockItem({ physicalQty: 95, availableQty: 85, lastCountedAt: new Date() })) },
          inventoryTransaction: { create: vi.fn().mockResolvedValue({}) },
        };
        return callback(tx);
      });

      const result = await service.countStock('si-1', 95, 'user-1');

      expect(result.physicalQty).toBe(95);
      expect(eventBus.publish).toHaveBeenCalled();
    });

    it('should throw NEGATIVE_QUANTITY_INVALID for negative count', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(mockStockItem());

      await expect(service.countStock('si-1', -5, 'user-1'))
        .rejects.toThrow(InventoryErrors.NEGATIVE_QUANTITY_INVALID);
    });
  });

  describe('createTransaction', () => {
    it('should create RECEIVED transaction and increase stock', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(mockStockItem());
      txMock.mockImplementation(async (callback) => {
        const tx = {
          stockItem: { update: vi.fn().mockResolvedValue(mockStockItem({ physicalQty: 150, availableQty: 140 })) },
          inventoryTransaction: { create: vi.fn().mockResolvedValue({ id: 'tx-1', type: 'RECEIVED', quantity: 50 }) },
        };
        return callback(tx);
      });

      const result = await service.createTransaction({ stockItemId: 'si-1', type: 'RECEIVED', quantity: 50 }, 'user-1');

      expect(result.updated.physicalQty).toBe(150);
      expect(result.txRecord.id).toBe('tx-1');
    });

    it('should throw NEGATIVE_QUANTITY_INVALID when SHIPPED exceeds physical', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(mockStockItem({ physicalQty: 10, availableQty: 10 }));

      await expect(service.createTransaction({ stockItemId: 'si-1', type: 'SHIPPED', quantity: 50 }, 'user-1'))
        .rejects.toThrow(InventoryErrors.NEGATIVE_QUANTITY_INVALID);
    });

    it('should throw STOCK_ITEM_NOT_FOUND', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue(null);

      await expect(service.createTransaction({ stockItemId: 'missing', type: 'RECEIVED', quantity: 10 }, 'user-1'))
        .rejects.toThrow(InventoryErrors.STOCK_ITEM_NOT_FOUND);
    });
  });

  describe('listTransactions', () => {
    it('should return paginated transactions', async () => {
      vi.mocked(prisma.inventoryTransaction.findMany).mockResolvedValue([{ id: 'tx-1' }, { id: 'tx-2' }] as never);
      vi.mocked(prisma.inventoryTransaction.count).mockResolvedValue(2);

      const result = await service.listTransactions({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by stockItemId and type', async () => {
      vi.mocked(prisma.inventoryTransaction.findMany).mockResolvedValue([]);
      vi.mocked(prisma.inventoryTransaction.count).mockResolvedValue(0);

      await service.listTransactions({ page: 1, limit: 20, stockItemId: 'si-1', type: 'RECEIVED' });

      expect(prisma.inventoryTransaction.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ stockItemId: 'si-1', type: 'RECEIVED' }),
      }));
    });
  });

  describe('createImport', () => {
    it('should create import and publish event', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(mockProfile());
      vi.mocked(prisma.inventoryImport.create).mockResolvedValue(mockImport());

      const result = await service.createImport({ supplierId: 'sup-1', fileName: 'stock.xlsx', fileUrl: 'https://files/stock.xlsx', format: 'xlsx' }, 'user-1');

      expect(result.id).toBe('im-1');
      expect(eventBus.publish).toHaveBeenCalled();
    });

    it('should throw WAREHOUSE_SUPPLIER_MISMATCH when supplier not found', async () => {
      vi.mocked(prisma.supplierProfile.findUnique).mockResolvedValue(null);

      await expect(service.createImport({ supplierId: 'bad', fileName: 'f', fileUrl: 'u', format: 'xlsx' }, 'user-1'))
        .rejects.toThrow(InventoryErrors.WAREHOUSE_SUPPLIER_MISMATCH);
    });
  });

  describe('updateImportStatus', () => {
    it('should mark import COMPLETED and publish event', async () => {
      vi.mocked(prisma.inventoryImport.findUnique).mockResolvedValue(mockImport());
      vi.mocked(prisma.inventoryImport.update).mockResolvedValue(mockImport({ status: 'COMPLETED', completedAt: new Date() }));

      const result = await service.updateImportStatus('im-1', { status: 'COMPLETED', totalRows: 100, successRows: 95, errorRows: 5 });

      expect(result.status).toBe('COMPLETED');
      expect(eventBus.publish).toHaveBeenCalled();
    });

    it('should mark import FAILED and publish failure event', async () => {
      vi.mocked(prisma.inventoryImport.findUnique).mockResolvedValue(mockImport());
      vi.mocked(prisma.inventoryImport.update).mockResolvedValue(mockImport({ status: 'FAILED', completedAt: new Date() }));

      const result = await service.updateImportStatus('im-1', { status: 'FAILED' });

      expect(result.status).toBe('FAILED');
      expect(eventBus.publish).toHaveBeenCalled();
    });

    it('should throw IMPORT_NOT_FOUND', async () => {
      vi.mocked(prisma.inventoryImport.findUnique).mockResolvedValue(null);

      await expect(service.updateImportStatus('missing', { status: 'COMPLETED' }))
        .rejects.toThrow(InventoryErrors.IMPORT_NOT_FOUND);
    });
  });

  describe('findImportById', () => {
    it('should return import', async () => {
      vi.mocked(prisma.inventoryImport.findUnique).mockResolvedValue(mockImport());

      const result = await service.findImportById('im-1');

      expect(result.id).toBe('im-1');
    });

    it('should throw IMPORT_NOT_FOUND', async () => {
      vi.mocked(prisma.inventoryImport.findUnique).mockResolvedValue(null);

      await expect(service.findImportById('missing')).rejects.toThrow(InventoryErrors.IMPORT_NOT_FOUND);
    });
  });

  describe('getStockLevels', () => {
    it('should return stock levels with total value', async () => {
      vi.mocked(prisma.stockItem.findMany).mockResolvedValue([
        mockStockItem({ availableQty: 90, unitCost: 10, reorderPoint: 10 }),
        mockStockItem({ id: 'si-2', availableQty: 5, unitCost: 20, reorderPoint: 15 }),
      ]);

      const result = await service.getStockLevels({});

      expect(result.totalValue).toBe(1000);
      expect(result.currency).toBe('SAR');
      expect(result.items).toHaveLength(2);
    });

    it('should filter low stock items', async () => {
      vi.mocked(prisma.stockItem.findMany).mockResolvedValue([
        mockStockItem({ availableQty: 90, reorderPoint: 10 }),
        mockStockItem({ id: 'si-2', availableQty: 5, reorderPoint: 15 }),
      ]);

      const result = await service.getStockLevels({ lowStock: true });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('si-2');
    });
  });
});
