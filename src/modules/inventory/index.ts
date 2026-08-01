export { InventoryService } from '@/modules/inventory/services/InventoryService';

export {
  createWarehouseSchema, updateWarehouseSchema, warehouseListQuerySchema,
  createStockItemSchema, updateStockItemSchema, stockItemListQuerySchema,
  adjustStockSchema, transferStockSchema,
  createTransactionSchema, transactionListQuerySchema,
  createImportSchema, updateImportStatusSchema, importListQuerySchema,
  stockLevelQuerySchema,
} from '@/modules/inventory/validators/inventory-schemas';
export type {
  CreateWarehouseInput, UpdateWarehouseInput, WarehouseListQuery,
  CreateStockItemInput, UpdateStockItemInput, StockItemListQuery,
  AdjustStockInput, TransferStockInput,
  CreateTransactionInput, TransactionListQuery,
  CreateImportInput, UpdateImportStatusInput, ImportListQuery,
  StockLevelQuery,
} from '@/modules/inventory/validators/inventory-schemas';

export { InventoryEvents } from '@/modules/inventory/events';

export {
  WarehouseStateMachine,
  getAllowedWarehouseTransitions,
  canTransitionWarehouse,
} from '@/modules/inventory/workflow/state-machines/WarehouseStateMachine';
export type { WarehouseStatusType, WarehouseTransition } from '@/modules/inventory/workflow/state-machines/WarehouseStateMachine';

import { InventoryService } from '@/modules/inventory/services/InventoryService';
export const inventoryService = new InventoryService();
