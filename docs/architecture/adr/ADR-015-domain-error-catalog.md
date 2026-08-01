# ADR-015: Domain Error Catalog

**Status:** Approved  
**Date:** 2026-07-30  
**Deciders:** Architecture Team  

## Context
Each domain needs typed, consistent error codes for cross-service communication and API responses.

## Decision
Create error constant files per domain, all imported through a unified `ErrorCodes` object.

### Per-Domain Error Files
```
shared/errors/
├── core.errors.ts         (CORE_USER_NOT_FOUND, CORE_USER_UNAUTHORIZED, etc.)
├── procurement.errors.ts  (PROCUREMENT_PO_NOT_FOUND, etc.)
├── quality.errors.ts      (QUALITY_INSPECTION_NOT_FOUND, etc.)
├── financial.errors.ts    (FINANCIAL_RESERVATION_NOT_FOUND, etc.)
├── invoicing.errors.ts    (INVOICING_INVOICE_NOT_FOUND, etc.)
├── workflow.errors.ts
├── tenders.errors.ts
├── marketplace.errors.ts
├── storage.errors.ts
├── ai.errors.ts
├── general.errors.ts
└── index.ts              (merged ErrorCodes export)
```

### Error Format
`{DOMAIN}_{ENTITY}_{PROBLEM}` — all uppercase, underscore-separated

## Current Location (Technical Debt)
Error constants currently live in `shared/errors/` rather than their owning domains. Future refactoring should move them to their respective domains (e.g., `quality/errors/quality.errors.ts`) and re-export from shared for backward compatibility.

## Consequences
- + Consistent error reporting across API layer
- + Single import for all error codes
- - Domain errors in shared module (coupling risk)
- - No built-in i18n support for error messages (future enhancement)
