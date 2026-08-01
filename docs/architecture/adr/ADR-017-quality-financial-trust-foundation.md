# ADR-017: Quality & Financial Trust Foundation

**Status:** Approved  
**Date:** 2026-07-30  
**Deciders:** Architecture Team  

## Context
After completing the Procurement core lifecycle (RFQ → PO → Delivery), two supporting domains emerged: Quality (inspection/acceptance) and Financial Trust (payment hold/release).

## Decision

### Quality Domain
- Independent module `modules/quality/` — no direct imports from procurement
- References procurement entities through `referenceType`/`referenceId` string pattern (not Prisma relations)
- Three main entities: `Inspection` (with items + attachments), `NCR` (non-conformance report), `AcceptanceCertificate`
- State machine: `PENDING → IN_PROGRESS → PASSED → ACCEPTED | FAILED → NCR_CREATED → RE_INSPECTION`

### Financial Trust Domain
- Independent module `modules/financial/` — no direct imports from procurement
- Two main entities: `PaymentReservation` (holds committed funds), `PaymentRelease` (releases funds incrementally)
- State machine: `RESERVED → HELD → PARTIALLY_RELEASED → RELEASED | REFUNDED | CANCELLED`
- No ledger, wallet, or bank integration (deferred per PM decision)

### Separation from Procurement
Both domains are **independent bounded contexts**. They do not reference procurement services, they do not import procurement modules, and they can be developed and deployed independently.

## Consequences
- + Clean domain boundaries
- + Quality and Financial can evolve independently
- - Cross-domain references through string IDs (no FK enforcement)
- - No event-driven integration yet (matching requires direct DB queries)

## Future
- ADR-018 (planned): Invoice & Three-Way Matching
- ADR-019 (pending): MaterialLot entity (deferred to Warehouse/Inventory phase)
- ADR-020 (pending): Ledger & Wallet (deferred per ADR-008)
