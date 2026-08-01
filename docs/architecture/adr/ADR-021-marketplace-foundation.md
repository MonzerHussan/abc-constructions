# ADR-021: Marketplace Foundation Architecture

**Status:** Approved  
**Date:** 2026-07-30  
**Deciders:** Architecture Team, Product Manager  

## Context

The Marketplace is the buyer-facing layer built on top of Supplier Network + Product Catalog + Inventory. It enables product discovery, comparison, RFQ generation, and supplier interaction.

The Marketplace does **not** own products, suppliers, or inventory — it aggregates them from the underlying domains.

## Decision

### Layer Architecture

```
┌─────────────────────────────────────────────┐
│              Marketplace                     │
│  (Search, Compare, RFQ, Reviews, Favorites)  │
├────────────────────┬────────────────────────┤
│  Supplier Network  │    Product Catalog      │
│  (Profiles, Trust) │ (Master Data, Specs)     │
├────────────────────┴────────────────────────┤
│               Inventory                       │
│         (Stock, Availability)                 │
├──────────────────────────────────────────────┤
│              Procurement Core                  │
│      (RFQ → PO → Delivery → Invoice)          │
└──────────────────────────────────────────────┘
```

### Key Principles

1. **Marketplace is a read-heavy aggregation layer** — it queries underlying domains but does not duplicate their data
2. **RFQ flows from Marketplace into Procurement** — user creates an RFQ in the marketplace, which delegates to procurement's RFQ service
3. **Reviews belong to Marketplace** — product reviews and supplier reviews are owned by Marketplace (they are marketplace-specific, not tied to procurement transactions)
4. **Favorites** — product and supplier favorites are user-specific marketplace features
5. **Search** — uses product catalog data + supplier data; may use ElasticSearch in Phase 3

### Data Model

```prisma
// Reviews are specific to the marketplace (not procurement SupplierRating)
model ProductReview {
  id              String   @id @default(cuid())
  productId       String
  offeringId      String?
  organizationId  String
  rating          Int      // 1-5
  title           String?
  comment         String?
  images          String[]
  isVerified      Boolean  @default(false) // verified purchase
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])

  @@index([productId])
  @@index([organizationId])
}

model SupplierReview {
  id              String   @id @default(cuid())
  supplierId      String
  organizationId  String
  rating          Int      // 1-5
  title           String?
  comment         String?
  createdAt       DateTime @default(now())

  supplier        SupplierProfile @relation(fields: [supplierId], references: [id])
  organization    Organization    @relation(fields: [organizationId], references: [id])

  @@unique([supplierId, organizationId])
  @@index([supplierId])
}

// Marketplace-specific features
model FavoriteProduct {
  id              String   @id @default(cuid())
  organizationId  String
  productId       String
  createdAt       DateTime @default(now())

  organization    Organization @relation(fields: [organizationId], references: [id])

  @@unique([organizationId, productId])
  @@index([organizationId])
}

model FavoriteSupplier {
  id              String   @id @default(cuid())
  organizationId  String
  supplierId      String
  createdAt       DateTime @default(now())

  organization    Organization @relation(fields: [organizationId], references: [id])
  supplier        SupplierProfile @relation(fields: [supplierId], references: [id])

  @@unique([organizationId, supplierId])
  @@index([organizationId])
}
```

### Architecture

| Aspect | Decision |
|--------|----------|
| Module | `modules/marketplace/` (extends existing `marketplace` module) |
| Independence | Reads from `supplier-network`, `product-catalog`, `inventory` but does NOT import their services |
| Search approach | Prisma queries with filters (Phase 2); ElasticSearch (Phase 3) |
| Comparison | Client-side aggregation from multiple offerings |
| RFQ flow | Marketplace creates RFQ via procurement service (or domain event) |
| Events | `Marketplace.Product.Search`, `Marketplace.Compare.Executed`, `Marketplace.Review.Submitted`, `Marketplace.Favorite.Added`, `Marketplace.RFQ.Initiated` |
| API version | `/api/v1/marketplace/` |

### Search & Filtering (Phase 2)

Supported filters:
- Category / Subcategory
- Price range
- Supplier verification level
- Supplier rating
- Brand
- Location (country / city)
- In stock availability
- Delivery time

### Comparison Engine

- Compare up to 4 products side by side
- Compare up to 4 suppliers for the same product
- Attributes: price, delivery time, rating, verification level, stock status

## Consequences

- + Clean separation: Marketplace aggregates, doesn't own
- + Search and filtering can be optimized independently
- + Future ElasticSearch migration is straightforward
- - Initial search is Prisma-based (may be slow at scale)
- - RFQ flow crosses domain boundaries (Marketplace → Procurement)
- - Product comparison requires multi-table queries
