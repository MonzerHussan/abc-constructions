# ADR-014: Event Versioning

**Status:** Approved  
**Date:** 2026-07-30  
**Deciders:** Architecture Team  

## Context
Events may change shape over time. Consumers need to know which version of an event they are receiving.

## Decision
Every event carries a `version: number` field (currently always `1`). When the payload shape changes, the version is incremented.

### Schema
```typescript
interface IEvent {
  name: string;       // 'Procurement.PO.Issued'
  version: number;    // 1, 2, 3...
  payload: unknown;
  metadata: { ... };
}
```

### Rules
1. **Breaking changes** (renaming/removing fields) → increment version
2. **Additive changes** (adding optional fields) → increment version
3. **Documentation** — Events Catalog must list all versions
4. **Consumers** — Must check `event.version` before processing

## Consequences
- + Backward compatibility
- + Clear contract evolution
- - Unnecessary for current scale (always version 1)
- - No consumer-side version handling yet

## Implementation
All current events use `version: 1`. See `src/modules/shared/events/types.ts`.
