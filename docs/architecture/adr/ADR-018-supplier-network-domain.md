# ADR-018: Supplier Network Domain Architecture

**Status:** Approved  
**Date:** 2026-07-30  
**Deciders:** Architecture Team, Product Manager  

## Context

Supplier Network is not a simple CRUD for supplier records. It is the **core business domain** representing ABC's Construction Commerce Network — the trust, capabilities, and commerce relationships between organizations in the construction industry.

A single organization can hold multiple roles: Manufacturer, Distributor, Dealer, Supplier, Service Provider, Rental Company, Maintenance Company.

## Decision

### Domain Model Hierarchy

```
Organization
  └── Organization Roles (one org = multiple roles)
        └── Supplier Profile (capabilities, verification, performance)
              ├── Branches (physical locations)
              ├── Coverage Areas (geographic regions served)
              ├── Certifications & Licenses
              ├── Banking Information
              ├── Product Offerings → Product Catalog
              ├── Inventory → Stock / Warehouse
              └── Performance Metrics → Marketplace
```

### Organization-Centric (Not User-Centric)

- **Organization** is the first-class entity for the Supplier Network
- A User belongs to an Organization via `UserOrganization`
- `SupplierProfile` is attached to **Organization**, not to User
- This replaces the current 1:1 `SupplierProfile → User` with `SupplierProfile → Organization`

### Multi-Role Per Organization

An Organization has one or more roles:
- `MANUFACTURER` — produces goods
- `DISTRIBUTOR` — authorized distributor of manufacturers
- `DEALER` — retail dealer
- `SUPPLIER` — general supplier/trader
- `SERVICE_PROVIDER` — provides services (maintenance, rental, consulting)
- `RENTAL_COMPANY` — equipment rental
- `MAINTENANCE_COMPANY` — maintenance services

### Verification & Trust (KYC)

Supplier verification is a multi-stage process:
1. **Trade License** — Required for all supplier types
2. **VAT Registration** — Required for tax compliance
3. **Certifications** — Industry-specific certs (ISO, engineering license, etc.)
4. **Bank Account** — Payment details (IBAN, bank name, account number)
5. **Documents** — Supporting evidence for each verification level

Verification levels:
- `UNVERIFIED` — Default, no verification
- `BASIC` — Trade license verified
- `VERIFIED` — Trade license + VAT + basic docs
- `TRUSTED` — Full KYC including certifications + bank account
- `FLAGSHIP` — Highest trust level (audited, guaranteed)

### Supplier Capability Profile (for AI Supplier Matching)

Each supplier has a **capability profile** describing what they can do, supply, or service. This is separate from products and enables future AI-powered supplier matching.

```
Supplier Capability
  ├── Capability Category (e.g., "Steel Fabrication", "Concrete Works")
  ├── Capability Level (PRIMARY, SECONDARY, SPECIALIZED)
  ├── Certifications tied to the capability
  ├── Past project references
  ├── Capacity (max project value, monthly volume)
  └── Geographic coverage per capability
```

This means a supplier can say:
- "We are a **primary** provider of **steel fabrication** in **Saudi Arabia** with capacity up to **5,000 tons/month**"
- "We are a **secondary** provider of **concrete works** in **Riyadh region**"

### Supplier Relationship (Buyer ↔ Supplier)

Organizations have explicit relationships with suppliers they work with:

| Field | Purpose |
|-------|---------|
| `relationshipType` | PREFERRED, APPROVED, STRATEGIC, BLACKLISTED, PROSPECTIVE |
| `creditLimit` | Organization-specific credit line |
| `paymentTerms` | e.g., "NET30", "NET60", "CASH_ON_DELIVERY" |
| `contractRef` | Link to framework agreement |
| `relationshipScore` | Internal score based on history |

This relationship is **between organizations**, not users. A Buyer Organization has one relationship with a Supplier Organization.

### Ecosystem Compatibility

The Supplier Network is designed to coexist with future ABC Ecosystem domains:

| Domain | How It Integrates |
|--------|-------------------|
| **Jobs** | Organizations with `SUPPLIER` or `SERVICE_PROVIDER` roles can also post jobs. `SupplierProfile.organizationId` links to the same Organization that posts jobs. |
| **Training** | Organizations can offer training courses. The `SupplierCertification` model references industry certs; the Training domain handles course delivery. |
| **Skills & Professional Profiles** | User skills are independent of the Organization they work for. A user employed by a Supplier Organization has professional skills that don't conflict with the organization's commercial capabilities. |
| **Projects** | Supplier capabilities can be matched to project requirements. `SupplierCapability.category` aligns with project BOQ categories. |

**Key principle:** Organization is the shared root entity. Every domain extends Organization with its own profile — never duplicates it.

### Performance Metrics Foundation

Performance metrics are **computed** from transaction data, not stored as denormalized fields:
- `totalOrders` → COUNT(PurchaseOrder)
- `completedOrders` → COUNT(PurchaseOrder WHERE status = COMPLETED)
- `onTimeDeliveryRate` → computed from Delivery dates vs PO expected delivery
- `avgRating` → AVG(SupplierRating.rating)
- `winRate` → awarded quotations / total quotations
- `responseTime` → AVG(time from RFQ sent to quotation submitted)

Temporary denormalized fields may exist for performance but must be clearly marked as `@@computed` or documented.

### Architecture

| Aspect | Decision |
|--------|----------|
| Module | `modules/supplier-network/` |
| Independence | Does NOT import from procurement, quality, financial, invoicing services |
| Shared imports | `shared/` (utils, events, types) only |
| State machine | `SupplierVerificationStateMachine` (UNVERIFIED→BASIC→VERIFIED→TRUSTED→FLAGSHIP) |
| Events | `SupplierNetwork.Organization.Registered`, `SupplierNetwork.Profile.Completed`, `SupplierNetwork.Verification.Upgraded`, `SupplierNetwork.Verification.Rejected`, `SupplierNetwork.Document.Uploaded`, `SupplierNetwork.Document.Expiring` |
| API version | `/api/v1/supplier-network/` |
| Architecture tests | Must enforce no imports from procurement/quality/financial/invoicing |

### Future-Proofing

This design supports:
- **Regional expansion**: Country, city, coverage area are first-class fields
- **Multi-currency**: `Currency` value objects ready (from ADR-016)
- **Multi-tax**: Tax registration per country
- **Multi-language**: Arabic + English + Urdu on all profile fields
- **Supplier matching**: Capability profiles enable AI matching in Phase 3
- **Global manufacturing network**: `ManufacturerProfile` extends `SupplierProfile` with factory capabilities

## Consequences

- + Organization becomes the center of commercial identity (not User)
- + One organization can have multiple roles without data duplication
- + Verification levels create trust signals for the marketplace
- + Performance metrics computed from real transactions (not manual entry)
- - Requires migrating existing `SupplierProfile` from User FK to Organization FK
- - Organization model needs role expansion beyond current `OrganizationType`
- - Existing `SupplierRating` references User, not Organization — needs migration path

## Data Model (Prisma)

```prisma
model SupplierProfile {
  id                    String   @id @default(cuid())
  organizationId        String   @unique
  supplierType          SupplierType
  verificationLevel     SupplierVerificationLevel @default(UNVERIFIED)
  companyName           String
  companyNameAr         String?
  companyNameUr         String?
  commercialLicense     String?
  licenseNumber         String?
  taxNumber             String?
  vatRegistered         Boolean  @default(false)
  yearEstablished       Int?
  employeeCount         Int?
  countryId             String?
  cityId                String?
  website               String?
  about                 String?
  aboutAr               String?
  aboutUr               String?
  logo                  String?
  coverImage            String?

  // Capabilities (computed, not denormalized — temporary cache)
  totalOrders           Int      @default(0)
  completedOrders       Int      @default(0)
  onTimeDeliveryRate    Float    @default(0)
  avgRating             Float    @default(0)
  totalRatings          Int      @default(0)
  winRate               Float    @default(0)
  avgResponseTimeHours  Int?

  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  organization Organization  @relation(fields: [organizationId], references: [id])
  branches      SupplierBranch[]
  documents     SupplierDocument[]
  certifications SupplierCertification[]
  bankingInfo   SupplierBanking?
  coverageAreas SupplierCoverageArea[]
  productOfferings SupplierProductOffering[]
  ratings       SupplierRating[]
}

enum SupplierType {
  MANUFACTURER
  DISTRIBUTOR
  DEALER
  SUPPLIER
  SERVICE_PROVIDER
  RENTAL_COMPANY
  MAINTENANCE_COMPANY
  TRADER
  IMPORTER
}

enum SupplierVerificationLevel {
  UNVERIFIED
  BASIC
  VERIFIED
  TRUSTED
  FLAGSHIP
}

model SupplierBranch {
  id             String   @id @default(cuid())
  supplierId     String
  name           String
  nameAr         String?
  address        String
  cityId         String?
  countryId      String?
  phone          String?
  email          String?
  managerName    String?
  lat            Float?
  lng            Float?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  supplier SupplierProfile @relation(fields: [supplierId], references: [id], onDelete: Cascade)

  @@index([supplierId])
  @@index([cityId])
}

model SupplierDocument {
  id              String         @id @default(cuid())
  supplierId      String
  docType         SupplierDocType
  title           String
  fileName        String
  fileUrl         String
  mimeType        String?
  status          DocumentStatus @default(PENDING)
  notes           String?
  issuedAt        DateTime?
  expiresAt       DateTime?
  verifiedAt      DateTime?
  verifiedById    String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  supplier        SupplierProfile @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  verifiedBy      User?           @relation(fields: [verifiedById], references: [id])

  @@index([supplierId])
  @@index([expiresAt])
  @@index([docType, status])
}

enum SupplierDocType {
  TRADE_LICENSE
  VAT_CERTIFICATE
  COMPANY_LICENSE
  TAX_CERTIFICATE
  BANK_ACCOUNT_CONFIRMATION
  INSURANCE_CERTIFICATE
  ISO_CERTIFICATE
  ENGINEERING_LICENSE
  CONTRACTOR_CLASSIFICATION
  AUTHORIZATION_LETTER
  PROFESSIONAL_CERT
  PORTFOLIO
  OTHER
}

enum DocumentStatus {
  PENDING
  VERIFIED
  REJECTED
  EXPIRED
}

model SupplierCertification {
  id              String   @id @default(cuid())
  supplierId      String
  name            String
  issuingBody     String
  certificateNumber String?
  issueDate       DateTime
  expiryDate      DateTime?
  fileUrl         String?
  isVerified      Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  supplier        SupplierProfile @relation(fields: [supplierId], references: [id], onDelete: Cascade)

  @@index([supplierId])
  @@index([expiryDate])
}

model SupplierBanking {
  id              String   @id @default(cuid())
  supplierId      String   @unique
  bankName        String
  accountName     String
  accountNumber   String
  iban            String
  swiftCode       String?
  currency        String   @default("SAR")
  isVerified      Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  supplier        SupplierProfile @relation(fields: [supplierId], references: [id], onDelete: Cascade)
}

model SupplierCoverageArea {
  id          String @id @default(cuid())
  supplierId  String
  countryId   String?
  cityId      String?
  isPrimary   Boolean @default(false)

  supplier    SupplierProfile @relation(fields: [supplierId], references: [id], onDelete: Cascade)

  @@unique([supplierId, countryId, cityId])
  @@index([supplierId])
}

model SupplierCapability {
  id              String   @id @default(cuid())
  supplierId      String
  category        String   // e.g., "Steel Fabrication", "Concrete Works", "Electrical"
  level           CapabilityLevel @default(SECONDARY)
  capacityMonthly Float?
  maxProjectValue Float?
  currency        String   @default("SAR")
  notes           String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  supplier        SupplierProfile @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  coverageAreas   SupplierCapabilityCoverage[]

  @@unique([supplierId, category])
  @@index([supplierId])
  @@index([category])
  @@index([level])
}

enum CapabilityLevel {
  PRIMARY        // Core business
  SECONDARY      // Offered but not core
  SPECIALIZED    // Niche expertise
  EMERGING       // New capability being developed
}

model SupplierCapabilityCoverage {
  id          String @id @default(cuid())
  capabilityId String
  countryId   String?
  cityId      String?
  isPrimary   Boolean @default(false)

  capability  SupplierCapability @relation(fields: [capabilityId], references: [id], onDelete: Cascade)

  @@unique([capabilityId, countryId, cityId])
  @@index([capabilityId])
}

model SupplierProjectReference {
  id              String   @id @default(cuid())
  supplierId      String
  projectName     String
  clientName      String?
  description     String?
  value           Float?
  currency        String   @default("SAR")
  completionDate  DateTime?
  category        String?  // matches SupplierCapability.category
  fileUrl         String?
  createdAt       DateTime @default(now())

  supplier        SupplierProfile @relation(fields: [supplierId], references: [id], onDelete: Cascade)

  @@index([supplierId])
  @@index([category])
}

// Relationship between Buyer Organization and Supplier Organization
model SupplierRelationship {
  id                String   @id @default(cuid())
  buyerOrgId        String   // Organization.id (buyer)
  supplierId        String   // SupplierProfile.id
  relationshipType  SupplierRelationshipType @default(APPROVED)
  status            RelationshipStatus @default(ACTIVE)
  creditLimit       Float?
  currency          String   @default("SAR")
  paymentTerms      String?  // "NET30", "NET60", "CASH_ON_DELIVERY"
  contractRef       String?  // Framework agreement reference
  contractStartDate DateTime?
  contractEndDate   DateTime?
  relationshipScore Float?   // 0-100, computed from transaction history
  notes             String?
  createdById       String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  buyerOrg          Organization    @relation(fields: [buyerOrgId], references: [id])
  supplier          SupplierProfile @relation(fields: [supplierId], references: [id])

  @@unique([buyerOrgId, supplierId])
  @@index([buyerOrgId])
  @@index([supplierId])
  @@index([relationshipType])
  @@index([status])
}

enum SupplierRelationshipType {
  PREFERRED
  APPROVED
  STRATEGIC
  PROSPECTIVE
  BLACKLISTED
}

enum RelationshipStatus {
  ACTIVE
  PENDING
  SUSPENDED
  TERMINATED
}

model SupplierRating {
  id            String   @id @default(cuid())
  supplierId    String
  organizationId String
  purchaseOrderId String?
  rating        Int      // 1-5
  quality       Int?
  delivery      Int?
  communication Int?
  price         Int?
  comment       String?
  createdAt     DateTime @default(now())

  supplier      SupplierProfile @relation(fields: [supplierId], references: [id])
  organization  Organization    @relation(fields: [organizationId], references: [id])
  purchaseOrder PurchaseOrder?  @relation(fields: [purchaseOrderId], references: [id])

  @@index([supplierId])
  @@index([organizationId])
  @@index([purchaseOrderId])
}
```
