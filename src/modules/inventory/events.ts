import { buildEventName } from '@/modules/shared/events/types';

export const InventoryEvents = {
  WarehouseCreated: buildEventName('Inventory', 'Warehouse', 'Created'),
  WarehouseUpdated: buildEventName('Inventory', 'Warehouse', 'Updated'),
  WarehouseStatusChanged: buildEventName('Inventory', 'Warehouse', 'StatusChanged'),
  StockCreated: buildEventName('Inventory', 'Stock', 'Created'),
  StockUpdated: buildEventName('Inventory', 'Stock', 'Updated'),
  StockAdjusted: buildEventName('Inventory', 'Stock', 'Adjusted'),
  StockTransferInitiated: buildEventName('Inventory', 'Stock', 'TransferInitiated'),
  StockTransferCompleted: buildEventName('Inventory', 'Stock', 'TransferCompleted'),
  StockReleased: buildEventName('Inventory', 'Stock', 'Released'),
  TransactionCreated: buildEventName('Inventory', 'Transaction', 'Created'),
  ImportCreated: buildEventName('Inventory', 'Import', 'Created'),
  ImportCompleted: buildEventName('Inventory', 'Import', 'Completed'),
  ImportFailed: buildEventName('Inventory', 'Import', 'Failed'),
  LowStockAlert: buildEventName('Inventory', 'Stock', 'LowStockAlert'),
  ExpiryAlert: buildEventName('Inventory', 'Stock', 'ExpiryAlert'),
} as const;
