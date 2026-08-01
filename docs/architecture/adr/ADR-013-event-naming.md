# ADR-013: Event Naming Convention

**Status:** Approved  
**Date:** 2026-07-30  
**Deciders:** Architecture Team  

## Context
With 55+ events across 5 domains, a consistent naming convention is essential for discoverability and routing.

## Decision
Use PascalCase triple-segment format: `Domain.Entity.Action`

Examples:
- `Procurement.PO.Issued`
- `Quality.Inspection.Started`
- `Financial.Reservation.Created`
- `Invoicing.Invoice.Matched`

### Rules
1. **Domain** — PascalCase, singular: `Procurement`, not `Procurements`
2. **Entity** — PascalCase, singular: `PurchaseOrder`, not `PO` (event names avoid abbreviations)
3. **Action** — Past tense verb: `Created`, `Submitted`, `Matched`, `Cancelled`
4. **Segments** — Exactly 3; no 2- or 4-segment event names

## Consequences
- + Events are self-describing
- + Consistent routing key format for future message broker
- - Longer event names than abbreviated alternatives

## Implementation
See `src/modules/shared/events/types.ts` — `buildEventName(domain, entity, action)`
