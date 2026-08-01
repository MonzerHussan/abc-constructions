# Phase 2 — Construction Commerce Platform Architecture Plan

> **Date:** 2026-07-31  
> **Status:** Active — Sprint 5.4 Complete  
> **Phase 1:** Complete (Procurement Core)  
> **Phase 2:** Sprints 5.1 ✅ 5.2 ✅ 5.3 ✅ 5.4 ✅  

---

## 1. Vision

Phase 2 transforms ABC from a procurement management system into a **Construction Commerce Platform** — a multi-sided network connecting manufacturers, distributors, suppliers, service providers, and buyers in the construction industry.

### The Core Shift

| Phase 1 | Phase 2 |
|---------|---------|
| Procurement | Commerce |
| Single buyer-seller per transaction | Multi-supplier marketplace |
| User-centric | Organization-centric |
| Manual supplier selection | Search, compare, match |
| Basic Product model | Manufacturer → Product → Offering |

---

## 2. Sprint Roadmap

| Sprint | Domain | Focus | Duration |
|--------|--------|-------|----------|
| **5.1** | Supplier Network | Organization profiles, KYC, verification, ratings, capabilities | ✅ |
| **5.2** | Product Catalog | Product master, variants, specs, supplier offerings | ✅ |
| **5.3** | Inventory | Warehouses, stock levels, import/export, API | ✅ |
| **5.4** | Marketplace | Search, compare, reviews, favorites, RFQ gateway | ✅ |

---

## 3. Domain Architecture

### Layer Diagram

```
                       ┌─────────────────────┐
                       │    PROCUREMENT       │
                       │  (Build on Phase 1)  │
                       └──────────┬──────────┘
                                  │ RFQ flow
                                  ▼
┌──────────────────────────────────────────────────────┐
│                    MARKETPLACE                        │
│          Search · Compare · Reviews · Favorites       │
├──────────────────┬─────────────────┬─────────────────┤
│ SUPPLIER NETWORK │ PRODUCT CATALOG │   INVENTORY     │
│ Profiles         │ Product Master  │ Warehouses      │
│ Verification     │ Variants        │ Stock Levels    │
│ Certifications   │ Specs           │ Import/Export   │
│ Ratings          │ Offerings       │ API/Webhooks    │
│ Coverage Areas   │ SKU/Barcode     │ Low Stock Alert │
│ Banking Info     │ Data Sheets     │ Transact. Log   │
└──────────────────┴─────────────────┴─────────────────┘
         │                │                    │
         └────────────────┴────────────────────┘
                          │
                 ┌────────▼────────┐
                 │   SHARED/CORE   │
                 │  (Users, Orgs,  │
                 │   Events, Utils)│
                 └─────────────────┘
```

### Domain Responsibilities

| Domain | Responsibility | Owns |
|--------|---------------|------|
| **Supplier Network** | Who can sell | Organization profiles, capabilities, trust |
| **Product Catalog** | What is sold | Product master data, specifications |
| **Inventory** | Where and how much | Warehouses, stock, availability |
| **Marketplace** | How it's discovered | Search, compare, reviews, RFQ initiation |
| **Procurement** | How it's purchased | RFQ → PO → Delivery → Invoice (Phase 1) |

### Dependency Rules

```
supplier-network ← product-catalog ← inventory ← marketplace
     ↓                                                  ↓
     └──────────────→ procurement ←─────────────────────┘
                              ↑
                              │
                            core/shared

Each domain may import from shared/ at any time.
A domain may import from domains to its LEFT (not RIGHT).
marketplace may import from ALL underlying domains (read-only).
No domain imports from procurement services.
```

---

## 4. Key Architecture Decisions

### 4.1 Organization-Centric Model

The Supplier Network is built around **Organization**, not User.

```
Organization (company)
  ├── Users (employees via UserOrganization)
  ├── Roles (MANUFACTURER, DISTRIBUTOR, etc. — an org can have multiple)
  └── SupplierProfile (capabilities, verification, ratings, banking)
```

**Migration:** Existing `SupplierProfile` is 1:1 with `User`. Phase 2 changes it to 1:1 with `Organization`. The User's `companyName`, `supplierProfile`, etc. remain for backward compatibility during transition.

### 4.2 Manufacturer → Product → Offering

Products are created by Manufacturers and offered by Suppliers:

```
Manufacturer (Organization)
  └── ProductMaster (SKU, name, specs, data sheets)
        └── SupplierProductOffering (price, availability, lead time)
              └── StockItem (warehouse, quantity)
```

This allows:
- One product sold by multiple suppliers at different prices
- Manufacturer brand preserved
- Product specs are a single source of truth

### 4.3 Verification Levels

Supplier trust is graduated:

| Level | Requirements | Trust Signal |
|-------|-------------|--------------|
| UNVERIFIED | None | ⚪ |
| BASIC | Trade license | 🟢 |
| VERIFIED | License + VAT + bank account | 🟢🟢 |
| TRUSTED | Full KYC + certifications | 🟢🟢🟢 |
| FLAGSHIP | Audited + guaranteed | 🟢🟢🟢🟢 |

### 4.4 Event-Driven Integration

**Phase 2 event flow:**

```
SupplierNetwork.Profile.Completed
  → ProductCatalog: Enable supplier to create offerings

SupplierNetwork.Document.Verified
  → SupplierNetwork: Check if verification level should upgrade

Inventory.Stock.LowStockAlert
  → SupplierNetwork: Notify supplier
  → Marketplace: Update availability display

Marketplace.RFQ.Initiated
  → Procurement: Create RFQ (via event, not direct call)

Inventory.Stock.Updated
  → Marketplace: Update search index
```

---

## 5. Data Model Summary

### New Models (Phase 2)

| Model | Domain | Purpose |
|-------|--------|---------|
| `SupplierProfile` (refactored) | Supplier Network | Organization supplier capabilities, org-centric |
| `SupplierBranch` | Supplier Network | Physical branch locations |
| `SupplierDocument` | Supplier Network | KYC documents with expiry tracking |
| `SupplierCertification` | Supplier Network | Industry certifications |
| `SupplierBanking` | Supplier Network | Bank account/payment info (1:1) |
| `SupplierCoverageArea` | Supplier Network | Geographic service regions |
| `SupplierRating` | Supplier Network | Dimensional ratings |
| `SupplierCapability` | Supplier Network | Capability profile for AI matching |
| `SupplierCapabilityCoverage` | Supplier Network | Per-capability geographic coverage |
| `SupplierProjectReference` | Supplier Network | Past project evidence per capability |
| `SupplierRelationship` | Supplier Network | Buyer ↔ Supplier relationship management |
| `ProductMaster` | Product Catalog | Manufacturer-owned product record |
| `ProductVariant` | Product Catalog | Size/color/attribute variants |
| `ProductSpecification` | Product Catalog | Key-value technical specs |
| `ProductDataSheet` | Product Catalog | Technical PDFs |
| `ProductSafetySheet` | Product Catalog | Safety PDFs |
| `ProductImage` | Product Catalog | Multi-image with sort order |
| `UnitOfMeasure` | Product Catalog | WEIGHT, VOLUME, LENGTH, etc. |
| `SupplierProductOffering` | Product Catalog | Full commerce domain: price, tier pricing, delivery terms, contract pricing, warranties, availability |
| `Warehouse` | Inventory | Physical storage location |
| `StockItem` | Inventory | Per-warehouse stock level |
| `InventoryTransaction` | Inventory | Stock movement audit trail |
| `InventoryImport` | Inventory | CSV/Excel import log |
| `ProductReview` | Marketplace | Product reviews |
| `SupplierReview` | Marketplace | Supplier reviews |
| `FavoriteProduct` | Marketplace | User-saved products |
| `FavoriteSupplier` | Marketplace | User-saved suppliers |

### Supplier Capability Profile (for AI Supplier Matching)

Each supplier has a capability profile describing **what they can do** (not just what they sell):

```
SupplierCapability
  ├── category: "Steel Fabrication", "Concrete Works", "Electrical Installation"
  ├── level: PRIMARY | SECONDARY | SPECIALIZED | EMERGING
  ├── capacityMonthly: 5000 (tons/m³/units)
  ├── maxProjectValue: 50,000,000 (SAR)
  ├── coverageAreas: [region1, region2]
  └── projectReferences: [past projects demonstrating capability]
```

This enables future **AI Supplier Matching**: given a project's BOQ requirements, the system can match suppliers by capability, capacity, location, and past performance.

### Supplier Relationship (Buyer ↔ Supplier)

Explicit relationship between Buyer Organization and Supplier Organization:

```
SupplierRelationship
  ├── type: PREFERRED | APPROVED | STRATEGIC | PROSPECTIVE | BLACKLISTED
  ├── creditLimit: 5,000,000 SAR
  ├── paymentTerms: NET30 / NET60 / CASH_ON_DELIVERY
  ├── contractRef: Framework agreement reference
  └── status: ACTIVE | PENDING | SUSPENDED | TERMINATED
```

### SupplierProductOffering (Full Commerce Domain)

Each offering is a complete commerce record:

| Field | Purpose |
|-------|---------|
| `price` | Base selling price |
| `currency` | ISO 4217 (default SAR) |
| `taxRate` | VAT/tax percentage |
| `contractPrice` | Negotiated price for specific buyer |
| `tierPricing` | Volume-based pricing tiers |
| `minOrderQty` | Minimum order quantity |
| `leadTimeDays` | Manufacturing/sourcing lead time |
| `deliveryTerms` | FOB, CIF, EXW, DDP, etc. |
| `availability` | IN_STOCK, MADE_TO_ORDER, PRE_ORDER |
| `warrantyPeriod` | Warranty in days |
| `validFrom/validUntil` | Price validity period |

### Ecosystem Compatibility

The Supplier Network is designed to coexist with future ABC domains:

| Domain | Integration |
|--------|-------------|
| **Jobs** | Supplier Organizations can post jobs; same `Organization` entity |
| **Training** | Organizations offer training; `SupplierCertification` aligns with industry certs |
| **Skills** | User skills are independent of their Organization's commercial profile |
| **Projects** | `SupplierCapability.category` aligns with project BOQ categories for AI matching |

### Models Reused from Phase 1

| Model | Domain | Phase 2 Role |
|-------|--------|--------------|
| `Organization` | Core | Primary identity for Supplier Network |
| `User` | Core | User authentication, contact person |
| `UserOrganization` | Core | Links users to organizations |
| `Brand` | Marketplace | Brand master (reused by product catalog) |
| `MaterialCategory` | Marketplace | Category tree root |
| `MaterialSubcategory` | Marketplace | Category tree leaf |
| `SupplierType` enum | Supplier Network | Expanded for multi-role |

---

## 6. API Design

### URL Structure

```
/api/v1/supplier-network/
  /organizations/:id
  /profiles/ (SupplierProfile)
  /profiles/:id/branches/
  /profiles/:id/documents/
  /profiles/:id/certifications/
  /profiles/:id/banking/
  /profiles/:id/coverage-areas/
  /profiles/:id/ratings/
  /verification/ (state machine actions)

/api/v1/product-catalog/
  /products/ (ProductMaster)
  /products/:id/variants/
  /products/:id/specifications/
  /products/:id/data-sheets/
  /products/:id/safety-sheets/
  /products/:id/images/
  /offerings/ (SupplierProductOffering)

/api/v1/inventory/
  /warehouses/
  /stock/
  /transactions/
  /imports/

/api/v1/marketplace/
  /search/
  /compare/
  /products/:id/reviews/
  /suppliers/:id/reviews/
  /favorites/products/
  /favorites/suppliers/
```

---

## 7. Testing Strategy

| Layer | Approach |
|-------|----------|
| State machines | Unit tests (vitest) — 20+ per state machine |
| Services | Unit tests with Prisma mock — 15+ per service |
| Architecture | Import rule tests — 50+ new tests per domain |
| Integration | API route tests — 5+ per endpoint |
| Total target | **1000+ tests** by end of Phase 2 |

---

## 8. Migration Path

### Phase 1 → Phase 2 Transition

1. **SupplierProfile** moves from User FK to Organization FK
2. **Product** model is deprecated (not deleted) in favor of ProductMaster + SupplierProductOffering
3. Old SupplierProfile data is migrated via script
4. Existing Procurement RFQ flow remains unchanged (but Marketplace can initiate it)
5. Old API endpoints remain at v1 (new v1/supplier-network etc. use new models)

### No Breaking Changes to Phase 1

- All Phase 1 APIs remain functional
- All Phase 1 tests continue to pass
- Procurement domain is **not modified** by Phase 2
- Phase 2 domains are additive, not transformative

---

## 9. Deliverables Checklist (Phase 2)

| Sprint | Deliverable | Status |
|--------|-------------|--------|
| 5.1 | Supplier Network Foundation | ✅ Complete |
| 5.1 | SupplierNetworkService + StateMachine + Events | ✅ Complete |
| 5.1 | Supplier Network API routes | ✅ Complete |
| 5.1 | Tests: state machine + service + architecture | ✅ Complete |
| 5.2 | Product Catalog Foundation | ✅ Complete |
| 5.2 | ProductCatalogService + StateMachine + Events | ✅ Complete |
| 5.2 | Product Catalog API routes | ✅ Complete |
| 5.2 | Tests: state machine + service + architecture | ✅ Complete |
| 5.3 | Inventory Foundation | ✅ Complete |
| 5.3 | InventoryService + Stock logic + Import | ✅ Complete |
| 5.3 | Inventory API + Events | ✅ Complete |
| 5.3 | Tests: state machine + service + architecture | ✅ Complete |
| 5.4 | Marketplace Foundation | ✅ Complete |
| 5.4 | MarketplaceService + Search + Compare + Reviews + Favorites | ✅ Complete |
| 5.4 | Marketplace RFQ Gateway + Supplier Matching | ✅ Complete |
| 5.4 | Marketplace API + Events (17 endpoints, 11 events) | ✅ Complete |
| 5.4 | Tests: service + architecture | ✅ Complete |
| — | ADRs (018-021) | ✅ Complete |
| — | Capability Map | ✅ Updated |
| — | Events Catalog | ✅ Updated |
| — | Architecture Plan | ✅ Complete |
