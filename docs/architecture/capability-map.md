# Capability Map

> **Last Updated:** 2026-07-30  
> **ADR Reference:** ADR-002 (Domain Architecture)

---

## 1. Core

| Capability | Status | Module | Notes |
|------------|--------|--------|-------|
| User Management | ✅ Live | `core` | CRUD, deactivation |
| Organization Management | ✅ Live | `core` | Multi-tenant orgs |
| Role-Based Access Control | ✅ Live | `core` | RBAC foundation |
| Audit Logging | ✅ Live | `core` | Event-sourced audit |
| Authentication & MFA | ✅ Live | `core` | NextAuth v5 + TOTP |
| Session Management | ✅ Live | `core` | Via NextAuth |
| Permissions | ✅ Live | `core` | Role-permission mapping |

---

## 2. Procurement

| Capability | Status | Module | Notes |
|------------|--------|--------|-------|
| Purchase Request | ✅ Live | `procurement` | PR → Approval workflow |
| RFQ / Tender | ✅ Live | `procurement` | Multi-supplier RFQ with state machine |
| Quotation Management | ✅ Live | `procurement` | Supplier quotations with money VOs |
| Evaluation & Scoring | ✅ Live | `procurement` | Weighted criteria, auto-scoring |
| Approval Workflow | ✅ Live | `procurement` | Multi-level approval chain |
| Purchase Order | ✅ Live | `procurement` | PO lifecycle with state machine |
| Delivery Tracking | ✅ Live | `procurement` | Procurement delivery tracking |
| Goods Receiving | ✅ Live | `procurement` | GR against PO items |
| Workflow Engine (shared) | ✅ Live | `shared/workflow` | State machine runtime + guards + history (Sprint 6.0) |
| Procurement Workflow Orchestrator | ✅ Live | `procurement` | Guards enforcement + events + history + Award→PO (Sprint 6.0 Phase 3) |
| Supplier Rating | 🔜 Phase 2 | — | Planned |

---

## 3. Quality

| Capability | Status | Module | Notes |
|------------|--------|--------|-------|
| Material Inspection | ✅ Live | `quality` | Inspection with items & results |
| Specification Verification | ✅ Live | `quality` | Expected vs actual values |
| Test Results | ✅ Live | `quality` | PASS/FAIL/N_A per item |
| Photo Evidence | ✅ Live | `quality` | Inspection attachments |
| Non-Conformance Reports (NCR) | ✅ Live | `quality` | Severity, category, corrective action |
| Acceptance Certificate | ✅ Live | `quality` | Digital certificate foundation |
| Traceability | ✅ Live | `procurement` | Batch/lot/serial on POItem |

---

## 4. Financial Trust

| Capability | Status | Module | Notes |
|------------|--------|--------|-------|
| Payment Reservation | ✅ Live | `financial` | Hold buyer funds |
| Payment Hold | ✅ Live | `financial` | Secure held amount |
| Partial Release | ✅ Live | `financial` | Release by acceptance milestone |
| Full Release | ✅ Live | `financial` | Full payment after acceptance |
| Refund Processing | ✅ Live | `financial` | Refund on rejection/cancellation |
| Cancellation | ✅ Live | `financial` | Release hold on cancellation |

---

## 5. Invoicing

| Capability | Status | Module | Notes |
|------------|--------|--------|-------|
| Invoice Submission | ✅ Live | `invoicing` | Supplier invoice intake |
| Invoice Items | ✅ Live | `invoicing` | Line items from PO |
| Three-Way Matching | ✅ Live | `invoicing` | PO ↔ Delivery ↔ Inspection ↔ Invoice |
| Invoice Status Workflow | ✅ Live | `invoicing` | DRAFT → SUBMITTED → VERIFIED → MATCHED → APPROVED → AUTHORIZED |
| Payment Authorization | ✅ Live | `invoicing` | Authorize for payment execution |

---

## 6. Phase 2 Domains (Construction Commerce Platform)

### 6.1 Supplier Network — Sprint 5.1 `modules/supplier-network/`

| Capability | Status | Notes |
|------------|--------|-------|
| Organization Profile | ✅ Sprint 5.1 | Extended org profile with multi-role |
| Supplier Profile | ✅ Sprint 5.1 | SupplierType: Manufacturer/Distributor/Dealer/etc. |
| Company Verification (KYC) | ✅ Sprint 5.1 | Trade license, VAT, certs, banking |
| Certifications & Licenses | ✅ Sprint 5.1 | ISO, engineering license, etc. |
| Documents Management | ✅ Sprint 5.1 | Upload, verify, expiry tracking |
| Branches & Locations | ✅ Sprint 5.1 | Physical presence management |
| Coverage Areas | ✅ Sprint 5.1 | Geographic service regions |
| Banking Information | ✅ Sprint 5.1 | IBAN, bank details (foundation only) |
| Performance Metrics | ✅ Sprint 5.1 | Computed from transaction data |
| Rating Foundation | ✅ Sprint 5.1 | Dimensional supplier ratings |
| Contacts & Communication | 🔜 Sprint 5.2 | Supplier point-of-contact (built on Organization) |
| Verification State Machine | ✅ Sprint 5.1 | UNVERIFIED→BASIC→VERIFIED→TRUSTED→FLAGSHIP |

### 6.2 Product Catalog — Sprint 5.2 `modules/product-catalog/`

| Capability | Status | Notes |
|------------|--------|-------|
| Product Master | ✅ Sprint 5.2 | Manufacturer-owned product records |
| Product Variants | ✅ Sprint 5.2 | Size, color, attributes |
| Categories & Subcategories | ✅ Sprint 5.2 | Uses existing MaterialCategory |
| Units of Measure | ✅ Sprint 5.2 | WEIGHT, VOLUME, LENGTH, UNIT, AREA |
| Brands | ✅ Sprint 5.2 | Uses existing Brand model |
| Specifications | ✅ Sprint 5.2 | Key-value technical specs |
| Technical Data Sheets | ✅ Sprint 5.2 | PDF/file uploads |
| Safety Data Sheets | ✅ Sprint 5.2 | PDF/file uploads |
| Product Images | ✅ Sprint 5.2 | Multi-image with sort order |
| SKU / Barcode / QR / GTIN | ✅ Sprint 5.2 | Product identification |
| Supplier Product Offering | ✅ Sprint 5.2 | Supplier-specific pricing & availability, 25 commerce fields |
| Supplier Catalog (Marketplace) | ✅ Sprint 5.4 | Marketplace aggregation layer (search, compare) |

### 6.3 Supplier Inventory — Sprint 5.3 `modules/inventory/`

| Capability | Status | Notes |
|------------|--------|-------|
| Warehouse | ✅ Sprint 5.3 | Physical storage locations with state machine (ACTIVE/INACTIVE/MAINTENANCE/CLOSED) |
| Stock Levels | ✅ Sprint 5.3 | Physical / Reserved / Available / Damaged per warehouse-offering |
| Stock Control Levels | ✅ Sprint 5.3 | Min stock, reorder point, max stock |
| Inventory Transactions | ✅ Sprint 5.3 | Audit trail (10 types) for all stock movements |
| Stock Adjustment | ✅ Sprint 5.3 | Physical count + manual adjust with transaction log |
| Stock Reservation | ✅ Sprint 5.3 | Reserve / release for orders (RESERVED/UNRESERVED) |
| Warehouse Transfer | ✅ Sprint 5.3 | TRANSFERRED_IN / TRANSFERRED_OUT with upsert |
| Low Stock Alerts | ✅ Sprint 5.3 | Event-based LowStockAlert on reorder point |
| Expiry Tracking | ✅ Sprint 5.3 | Batch/lot + expiry date fields & query |
| Import (Excel/CSV) | ✅ Sprint 5.3 | Import jobs with PENDING/PROCESSING/COMPLETED/FAILED |
| Stock Levels API | ✅ Sprint 5.3 | getStockLevels with total inventory value |
| Inventory API | ✅ Sprint 5.3 | 15 endpoints for ERP integration readiness |

### 6.4 Marketplace — Sprint 5.4 `modules/marketplace/`

| Capability | Status | Notes |
|------------|--------|-------|
| Product Search & Filters | ✅ Sprint 5.4 | Search by name/sku/AR, category, subcategory, brand, manufacturer, price range, currency, verification level, rating, country/city, in-stock, lead time, authorized-only |
| Category Navigation | ✅ Sprint 5.4 | Categories with subcategory + product counts |
| Product Details | ✅ Sprint 5.4 | Product + offerings + stock aggregation + reviews |
| Compare Products | ✅ Sprint 5.4 | Side-by-side up to 4 products (best price, suppliers count) |
| Compare Suppliers | ✅ Sprint 5.4 | Up to 4 suppliers per product (price, lead time, delivery, warranty) |
| Favorite Products | ✅ Sprint 5.4 | Per-organization saved products with unique constraint |
| Favorite Suppliers | ✅ Sprint 5.4 | Per-organization preferred suppliers |
| Product Reviews | ✅ Sprint 5.4 | Rating 1-5, title, comment, images; one per org per product; aggregate rating |
| Supplier Reviews | ✅ Sprint 5.4 | Rating 1-5, title, comment; one per org per supplier; aggregate rating |
| RFQ from Marketplace | ✅ Sprint 5.4 | Initiate RFQ from product page; auto-match suppliers foundation |
| Supplier Matching Foundation | ✅ Sprint 5.4 | Heuristic scoring for future AI matching (verification, rating, on-time, performance) |
| Marketplace API | ✅ Sprint 5.4 | 17 endpoints under `/api/v1/marketplace/` |

## 7. Planned Domains (Future Phases)

| Domain | Priority | Notes |
|--------|----------|-------|
| Projects & Jobs | 🔜 Phase 3 | Project management, BOQ, site execution |
| Logistics / Delivery V2 | 🔜 Phase 3 | GPS tracking, fleet, multi-stop |
| AI Procurement Agent | 🔜 Phase 3 | Smart RFQ, auto-matching, insights |
| Analytics & Reporting | 🔜 Phase 3 | Dashboards, KPIs, trends |
| Notification | 🔜 Phase 3 | Multi-channel alerts |
| Project Bid Platform | 🔜 Phase 3 | Construction project bidding |
| BOQ & Estimation Engine | 🔜 Phase 3 | Bill of quantities, cost estimation |
| CRM | 🔜 Phase 4 | Customer relations, opportunity pipeline |
| Training & Certifications | 🔜 Phase 4 | Workforce training, certificates |
| Maintenance | 🔜 Phase 5 | Asset maintenance, work orders |
| Manufacturing | 🔜 Phase 5 | Production tracking |
| Returns & Warranty | 🔜 Phase 5 | Reverse logistics |
| ERP Integration | 🔜 Phase 5 | SAP, Oracle, etc. |

## 8. Domain Boundaries (Updated)

| Can Import From | Cannot Import From |
|----------------|-------------------|
| `shared/` (all domains) | Core → any domain |
| `supplier-network/` (by product-catalog, inventory) | Financial → Procurement services |
| `product-catalog/` (by inventory, marketplace) | Quality → Procurement services |
| `inventory/` (by marketplace) | Invoicing → Financial services |
| — | Any module → `src/app/` |
| — | supplier-network → procurement services |

> Architecture tests (550+) enforce these boundaries at CI time.
