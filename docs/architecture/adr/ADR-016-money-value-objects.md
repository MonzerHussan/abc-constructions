# ADR-016: Money Value Objects

**Status:** Approved  
**Date:** 2026-07-30  
**Deciders:** Architecture Team  

## Context
Procurement, invoicing, and financial domains all deal with monetary values. Without typed value objects, currency, amounts, taxes, and discounts are easily confused or misused.

## Decision
Create immutable `Money`, `Currency`, `Tax`, and `Discount` value objects in `src/modules/shared/money/`.

### Money
- Wraps `amount: number` and `currency: Currency`
- Provides `add()`, `subtract()`, `multiply()`, `equals()` methods
- Prevents mixed-currency arithmetic at compile time

### Currency
- Enum with ISO 4217 codes: `SAR`, `USD`, `AED`, etc.
- Provides `symbol`, `name`, `decimalPlaces`

### Tax
- `rate: number` (percentage)
- `amount: number` (computed)
- `type: TaxType` (INCLUSIVE, EXCLUSIVE)

### Discount
- `value: number`
- `type: DiscountType` (PERCENTAGE, FIXED)
- Computes `amount: number` relative to a Money value

## Relationship to Prisma
Prisma uses `Float` for monetary fields (`totalAmount`, `unitPrice`, etc.). The value objects provide runtime type safety. Future migration to `@db.Decimal(12,2)` is recommended (see TD-08).

## Consequences
- + Type-safe monetary operations
- + Prevents currency mismatch bugs
- + Clear tax/discount compositions
- - Prisma storage remains `Float` (precision risk)
- - Not yet used consistently across all services
