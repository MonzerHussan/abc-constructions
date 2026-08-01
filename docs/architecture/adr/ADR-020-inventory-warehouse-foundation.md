# ADR-020: Inventory & Multi-Warehouse Foundation

**Status:** Approved  
**Date:** 2026-07-30  
**Deciders:** Architecture Team, Product Manager  

## Context

Supplier inventory management is essential for Marketplace real-time availability, procurement lead time calculation, and future logistics integration. The current system has no inventory tracking — stock is tracked via boolean `inStock` on the Product model.

## Decision

### Data Model Hierarchy

```
Supplier Profile
  └── Warehouse (physical storage location)
        └── Stock Item (product + quantity at a warehouse)
              ├── Available Quantity
              ├── Reserved Quantity
              ├── Physical Quantity
              └── Reorder Point

Supplier Product Offering
  └── Inventory (aggregated across warehouses)
```

### Key Rules

1. **Warehouse** belongs to a Supplier (via SupplierProfile.Organization)
2. **Stock** is tracked per Warehouse per Product Offering
3. **Available = Physical - Reserved**
4. **Lead Time** and **Min Order Qty** are attributes of SupplierProductOffering, not Inventory
5. Inventory can be updated via:
   - Manual (UI entry)
   - CSV/Excel import
   - API (for ERP integration)
   - Webhook (real-time sync)

### Inventory Data Model

```prisma
model Warehouse {
  id              String   @id @default(cuid())
  supplierId      String
  name            String
  nameAr          String?
  address         String
  cityId          String?
  countryId       String?
  lat             Float?
  lng             Float?
  phone           String?
  managerName     String?
  isPrimary       Boolean  @default(false)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  supplier        SupplierProfile @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  stockItems      StockItem[]

  @@index([supplierId])
}

model StockItem {
  id              String   @id @default(cuid())
  warehouseId     String
  offeringId      String   // SupplierProductOffering.id
  physicalQty     Float    @default(0)
  reservedQty     Float    @default(0)
  availableQty    Float    @default(0)
  reorderPoint    Float?
  maxStockQty     Float?
  batch           String?
  lotNumber       String?
  expiryDate      DateTime?
  lastCountedAt   DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  warehouse       Warehouse            @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  offering        SupplierProductOffering @relation(fields: [offeringId], references: [id])

  @@unique([warehouseId, offeringId])
  @@index([offeringId])
  @@index([expiryDate])
}

model InventoryTransaction {
  id              String   @id @default(cuid())
  stockItemId     String
  type            InventoryTransactionType
  quantity        Float
  referenceType   String?  // PURCHASE_ORDER, SALES_ORDER, ADJUSTMENT, RETURN, TRANSFER
  referenceId     String?
  notes           String?
  createdById     String
  createdAt       DateTime @default(now())

  stockItem       StockItem @relation(fields: [stockItemId], references: [id], onDelete: Cascade)

  @@index([stockItemId])
  @@index([referenceType, referenceId])
  @@index([createdAt])
}

enum InventoryTransactionType {
  RECEIVED
  SHIPPED
  ADJUSTED
  RESERVED
  UNRESERVED
  RETURNED
  TRANSFERRED_IN
  TRANSFERRED_OUT
  DAMAGED
  EXPIRED
}

model InventoryImport {
  id              String   @id @default(cuid())
  supplierId      String
  fileName        String
  fileUrl         String
  format          String   @default("xlsx")
  status          ImportStatus @default(PENDING)
  totalRows       Int      @default(0)
  successRows     Int      @default(0)
  errorRows       Int      @default(0)
  errors          Json?
  completedAt     DateTime?
  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  supplier        SupplierProfile @relation(fields: [supplierId], references: [id], onDelete: Cascade)

  @@index([supplierId])
  @@index([status])
}

enum ImportStatus {
  PENDING
  PROCESSING
  COMPLETED
  PARTIALLY_COMPLETED
  FAILED
}
```

### Architecture

| Aspect | Decision |
|--------|----------|
| Module | `modules/inventory/` |
| Independence | Does NOT import from procurement, quality, financial, invoicing |
| Shared imports | `shared/`, `supplier-network` (for SupplierProfile), `product-catalog` (for SupplierProductOffering) |
| Events | `Inventory.Warehouse.Created`, `Inventory.Stock.Updated`, `Inventory.Stock.LowStock`, `Inventory.Stock.OutOfStock`, `Inventory.Import.Completed`, `Inventory.Import.Failed` |
| API version | `/api/v1/inventory/` |

### Future (Phase 3+)

The following are **designed for but not implemented** in Sprint 5.3:
- Multi-currency inventory valuation
- Multi-warehouse per supplier
- Real-time sync via Webhook → RabbitMQ
- ERP integration endpoints
- Inventory reservations linked to Purchase Orders
- Batch/lot tracking for manufacturing

## Consequences

- + Real-time stock visibility for Marketplace
- + Inventory transaction audit trail
- + Import/export for supplier onboarding
- - Additional complexity for suppliers to maintain stock levels
- - Reservation logic needed for procurement integration
- - Stale inventory if suppliers don't update regularly
