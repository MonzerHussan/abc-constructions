# Technical Debt Register

> **Last Updated:** 2026-07-30  
> **Phase:** Sprint 4.0 — Architecture Review  
> **Domain:** All (Phase 1)

---

## 🔴 Critical (Must Fix Before Phase 2)

| # | Item | Domain | Impact | Effort | Recommendation |
|---|------|--------|--------|--------|----------------|
| TD-01 | **Workflow framework in wrong domain** — `BaseStateMachine` and `WorkflowEngine` live in `procurement/workflow/` but are imported by quality, financial, and invoicing state machines | Procurement | Architecture violation: 3 domains depend on procurement's internal module | Medium | Extract to `core/workflow/` or dedicated `workflow/` module |
| TD-02 | **Direct cross-domain Prisma access** — `InvoicingService.matchInvoice` reads `purchaseOrder`, `delivery`, and `inspection` tables directly instead of using events or service interfaces | Invoicing | Breaks domain encapsulation; creates tight coupling to procurement/quality DB schemas | Medium | Replace with event-driven matching: subscribe to PO/Delivery/Inspection events |
| TD-03 | **Zero `$transaction` usage** — 7+ multi-step operations (award+update, approval+history, fund release+create) lack transactional safety | All Phase 1 | Data corruption risk on partial failure | Small | Wrap all multi-step writes in `prisma.$transaction()` |
| TD-04 | **No compound indexes on filtered queries** — All list endpoints filter by `{ status, ... }` but only single-column `status` indexes exist | All Phase 1 | Performance degradation as data grows | Small | Add compound indexes per common query pattern |

## 🟡 High (Fix During Phase 2)

| # | Item | Domain | Impact | Effort | Recommendation |
|---|------|--------|--------|--------|----------------|
| TD-05 | **Domain-specific errors in shared module** — `procurement.errors.ts`, `quality.errors.ts`, etc. live in `shared/errors/` instead of their own domains | Shared | Anti-pattern; violates domain autonomy | Small | Move error constants to owning domains, re-export from shared |
| TD-06 | **Broken architecture test** — The Prisma cross-domain test at `module-imports.test.ts:92-106` never pushes to `violations`, giving false confidence | Architecture | Hidden cross-domain leaks not caught | Small | Fix test to actually check Prisma model access |
| TD-07 | **N+1 in EvaluationService** — `createCriteria` and `submitScores` loop with per-item `prisma.create()` instead of `createMany` | Procurement | Performance issue on large evaluations | Small | Replace with `createMany` |
| TD-08 | **Float fields for monetary values** — All `totalAmount`, `unitPrice`, `taxAmount` fields use `Float` instead of `Decimal` | All | Precision loss for financial calculations | Medium | Migrate to `@db.Decimal(12,2)` |
| TD-09 | **`SupplierProfile.avgRating @default(5.0)`** — Biases ratings to perfect score | Marketplace | Misleading default | Small | ✅ **Fixed in Sprint 5.1** — Changed to `@default(0)` |
| TD-10 | **Missing `onDelete: Cascade` on child tables** — Deleting a PO doesn't cascade to POItem; deleting Inspection doesn't cascade to InspectionItem | All | Orphaned data; manual cleanup required | Medium | Add cascade rules on owned child relations |

## 🟠 Medium (Plan for Phase 3+)

| # | Item | Domain | Impact | Effort |
|---|------|--------|--------|--------|
| TD-11 | **String fields used instead of enums** — `JobApplication.status`, `CampaignParticipant.status/role`, `FeatureRequest.status/priority`, `BugReport.severity/status`, `Interview.status`, `FocusGroup.status`, `CrmMeeting.status` | Research, Jobs, CRM | No type safety; potential invalid values | Medium |
| TD-12 | **Denormalized counter fields** — `Post.likesCount`, `Course.studentsCount`, `DriverProfile.totalDeliveries`, `SupplierProfile.totalOrders` (~30 fields total) | All | Drift risk; requires sync logic | Large |
| TD-13 | **Redundant enums** — `PRPriority`/`DeliveryPriority`/`CrmTaskPriority` (same values); `PODeliveryStatus`/`DeliveryStatus` (near-duplicate); `OrganizationType`/`UserRole`/`ResearchSegmentType` (overlapping) | Core, Procurement | Confusion; maintenance burden | Medium |
| TD-14 | **`MatchStatus` naming inconsistency** — `MISMATCH` (noun) vs `MATCHED` (past participle) | Invoicing | Inconsistent grammar | Small |
| TD-15 | **`GRStatus.COMPLETE` vs `COMPLETED` elsewhere** | Procurement | Inconsistent enum value naming | Small |
| TD-16 | **`AwardStatus.DECLINED` vs `REJECTED` elsewhere** | Procurement | Inconsistent rejection terminology | Small |
| TD-17 | **Heavy nested includes (4 levels)** — `EvaluationService.findById` loads approval→history→actionBy→name | Procurement | Performance; over-fetching | Medium |
| TD-18 | **`Verification.reviewedBy` is String (no FK)** — Loses referential integrity | Core | Data integrity risk | Medium |
| TD-19 | **`SupplierCategory.@@unique` with nullable `subcategoryId`** — Doesn't prevent duplicates in PostgreSQL | Marketplace | Potential duplicate entries | Small |
| TD-20 | **`VerificationToken.@@unique([identifier, token])` — `token` is already `@unique`** | Core | Redundant constraint | Small |

## 🔵 Low (Cosmetic / Nice-to-Have)

| # | Item | Domain | Effort |
|---|------|--------|--------|
| TD-21 | `cuid()` as default ID generator — slower than `uuidv7()` | All | Large (breaking change) |
| TD-22 | No `@@map` decorators — tables use PascalCase names in Postgres | All | Medium |
| TD-23 | No trailing newline at end of `schema.prisma` | Core | Trivial |
| TD-24 | `DeliveryOrder.scheduledDate` + `scheduledTime` (String) — use single `DateTime` | Delivery | Small |
| TD-25 | `DeliveryOrder.estimatedTime` (String) — should be Int (minutes) | Delivery | Small |

---

## Deferred Items (Future Phase ADRs)

| # | Item | Deferred To | Reason |
|---|------|-------------|--------|
| D-01 | Replace event-bus with RabbitMQ/Kafka | Phase 3+ | Premature optimization; EventEmitter sufficient for now |
| D-02 | MaterialLot entity for warehouse tracking | Phase 3 | Deferred per ADR; needs Inventory domain |
| D-03 | Ledger / Wallet / Bank integration | Phase 3+ | Deferred per PM decision |
| D-04 | Full event sourcing / CQRS | Phase 4+ | Overengineering for current scale |
| D-05 | Replace `cuid()` with `uuidv7()` | Phase 4+ | Breaking change across all tables |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Partial write failure** (no transactions) | Medium | High | Add `$transaction` to all multi-step operations (TD-03) |
| **Performance degradation** (no compound indexes) | Medium | Medium | Add compound indexes before Phase 2 (TD-04) |
| **Cross-domain schema coupling** | High | High | Extract workflow framework (TD-01); event-driven matching (TD-02) |
| **Orphaned data** (missing cascades) | Medium | Low | Add cascades gradually (TD-10) |
| **Counter field drift** | Low | Medium | Add consistency checks or remove denormalized fields (TD-12) |
| **Decimal precision loss** | Low | Medium (financial) | Migrate to Decimal before Phase 2 financial scale (TD-08) |
