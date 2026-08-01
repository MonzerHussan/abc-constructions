# ADR-019: Product Catalog Architecture

**Status:** Approved  
**Date:** 2026-07-30  
**Deciders:** Architecture Team, Product Manager  

## Context

The Product Catalog must be **independent of suppliers**. A product is created by a Manufacturer and can be offered by multiple suppliers. The current `Product` model is tied directly to a `User` (seller), which prevents the Manufacturer→Product→SupplierOffering pattern.

This separation is critical for:
- A single product sold by multiple suppliers at different prices
- Manufacturer-managed product specifications (single source of truth)
- Supplier-managed inventory, pricing, and availability
- Marketplace search and comparison across suppliers

## Decision

### Data Model Hierarchy

```
Manufacturer (Organization with MANUFACTURER role)
  └── Product Master (created by manufacturer)
        ├── Product Variants (size, color, etc.)
        ├── Technical Data Sheets
        ├── Safety Data Sheets
        ├── Product Images
        ├── Product Specifications
        └── Product Categories
              └── Units of Measure

Product Master
  └── Supplier Product Offering (per supplier)
        ├── Supplier SKU
        ├── Supplier Price
        ├── Supplier Stock
        ├── Lead Time
        ├── Minimum Order Quantity
        └── Pack Size
```

### Key Rules

1. **Product Master** is owned by the **Manufacturer Organization**
2. A **Supplier Product Offering** is a product that a specific supplier sells
3. Multiple suppliers can offer the same Product Master
4. A supplier can add a Product Master to their catalog even if they are not the manufacturer (they must provide proof of authorization via `isAuthorized` flag)
5. Product Specifications are part of the Product Master — suppliers cannot modify them
6. Supplier Product Offering has its own pricing, inventory, and availability

### Migration from Current `Product` Model

The existing `Product` model (tied to `User`) will be deprecated. New code uses `ProductMaster` + `SupplierProductOffering`. The old model remains for backward compatibility during Phase 2.

### Architecture

| Aspect | Decision |
|--------|----------|
| Module | `modules/product-catalog/` |
| Independence | Does NOT import from procurement, quality, financial, invoicing |
| Shared imports | `shared/`, `supplier-network` (for SupplierProfile reference) |
| State machine | `ProductStateMachine` (DRAFT→PUBLISHED→ARCHIVED) |
| Events | `ProductCatalog.Product.Created`, `ProductCatalog.Product.Published`, `ProductCatalog.Product.Archived`, `ProductCatalog.Offering.Created`, `ProductCatalog.Offering.PriceChanged`, `ProductCatalog.Offering.Discontinued` |
| API version | `/api/v1/product-catalog/` |
| Architecture tests | Enforce no imports from procurement/quality/financial/invoicing |

## Consequences

- + Product Master is a single source of truth for specifications
- + Multiple suppliers can offer the same product with different pricing
- + Manufacturer brand is preserved
- + Enables product comparison across suppliers
- - Requires migration from existing `Product` model
- - Existing Product model needs deprecation path
- - Complexity increases with Product Variants (size, color, etc.)

## Data Model (Prisma)

```prisma
model ProductMaster {
  id              String   @id @default(cuid())
  sku             String   @unique
  name            String
  nameAr          String?
  nameUr          String?
  description     String?
  descriptionAr   String?
  descriptionUr   String?
  manufacturerId  String   // Organization (MANUFACTURER role)
  brandId         String?
  categoryId      String?
  subcategoryId   String?
  unitId          String?
  barcode         String?
  qrCode          String?
  gtin            String?
  status          ProductStatus @default(DRAFT)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  manufacturer    Organization @relation(fields: [manufacturerId], references: [id])
  brand           Brand?       @relation(fields: [brandId], references: [id])
  category        MaterialCategory? @relation(fields: [categoryId], references: [id])
  subcategory     MaterialSubcategory? @relation(fields: [subcategoryId], references: [id])
  unit            UnitOfMeasure? @relation(fields: [unitId], references: [id])

  variants        ProductVariant[]
  specifications  ProductSpecification[]
  dataSheets      ProductDataSheet[]
  safetySheets    ProductSafetySheet[]
  images          ProductImage[]
  offerings       SupplierProductOffering[]

  @@index([manufacturerId])
  @@index([categoryId])
  @@index([status])
  @@index([sku])
  @@index([barcode])
}

enum ProductStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model ProductVariant {
  id              String   @id @default(cuid())
  productId       String
  name            String
  sku             String   @unique
  barcode         String?
  attributes      Json?    // { "color": "red", "size": "XL" }
  price           Float?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  product         ProductMaster @relation(fields: [productId], references: [id], onDelete: Cascade)
  images          ProductImage[]

  @@index([productId])
}

model ProductSpecification {
  id          String  @id @default(cuid())
  productId   String
  name        String
  nameAr      String?
  value       String
  valueAr     String?
  sortOrder   Int     @default(0)

  product     ProductMaster @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}

model ProductDataSheet {
  id          String   @id @default(cuid())
  productId   String
  title       String
  fileUrl     String
  language    String   @default("en")
  createdAt   DateTime @default(now())

  product     ProductMaster @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}

model ProductSafetySheet {
  id          String   @id @default(cuid())
  productId   String
  title       String
  fileUrl     String
  language    String   @default("en")
  createdAt   DateTime @default(now())

  product     ProductMaster @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}

model ProductImage {
  id          String  @id @default(cuid())
  productId   String?
  variantId   String?
  url         String
  alt         String?
  sortOrder   Int     @default(0)
  isPrimary   Boolean @default(false)

  product     ProductMaster? @relation(fields: [productId], references: [id], onDelete: Cascade)
  variant     ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)

  @@index([productId])
}

model UnitOfMeasure {
  id          String  @id @default(cuid())
  name        String
  nameAr      String?
  symbol      String
  category    String  // WEIGHT, VOLUME, LENGTH, UNIT, AREA
  isActive    Boolean @default(true)

  @@unique([name])
}

model SupplierProductOffering {
  id              String   @id @default(cuid())
  productId       String
  supplierId      String   // SupplierProfile.id
  supplierSku     String?
  status          OfferingStatus @default(ACTIVE)

  // Pricing
  price           Float
  currency        String   @default("SAR")
  taxRate         Float    @default(0)
  contractPrice   Float?   // Negotiated contract price (overrides price)
  contractMinQty  Float?   // Minimum qty for contract pricing
  tierPricing     Json?    // [{ "minQty": 100, "price": 95 }, { "minQty": 500, "price": 85 }]

  // Availability
  minOrderQty     Float    @default(1)
  maxOrderQty     Float?
  packSize        Float?
  moqUnit         String?  // UNIT, KG, TON, M3, etc.
  leadTimeDays    Int?
  availability    AvailabilityType @default(IN_STOCK)

  // Delivery
  deliveryTerms   DeliveryTerm[]? // FOB, CIF, EXW, DDP, CFR, CPT, CIP, DAT, DAP, DDP
  deliveryTimeDays Int?
  shippingCost    Float?

  // Commercial
  isAuthorized    Boolean  @default(false)
  authorizationDoc String? // Proof of authorization from manufacturer
  warrantyPeriod  Int?     // Days
  returnPolicy    String?
  validFrom       DateTime?
  validUntil      DateTime?

  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  product         ProductMaster  @relation(fields: [productId], references: [id])
  supplier        SupplierProfile @relation(fields: [supplierId], references: [id])
  stock           StockItem[]

  @@unique([supplierId, productId])
  @@index([productId])
  @@index([supplierId])
  @@index([price])
  @@index([status])
  @@index([validFrom, validUntil])
}

enum OfferingStatus {
  ACTIVE
  DISCONTINUED
  OUT_OF_STOCK
  COMING_SOON
}

enum AvailabilityType {
  IN_STOCK
  MADE_TO_ORDER
  PRE_ORDER
  DISCONTINUED
}

enum DeliveryTerm {
  EXW  // Ex Works
  FOB  // Free On Board
  CIF  // Cost, Insurance & Freight
  CFR  // Cost & Freight
  CPT  // Carriage Paid To
  CIP  // Carriage & Insurance Paid To
  DAP  // Delivered At Place
  DPU  // Delivered At Place Unloaded
  DDP  // Delivered Duty Paid
}
```
