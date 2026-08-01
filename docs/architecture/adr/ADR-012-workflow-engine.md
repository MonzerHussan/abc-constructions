# ADR-012: Workflow Engine

**Status:** Approved  
**Date:** 2026-07-30  
**Deciders:** Architecture Team  

## Context
Multiple domains (Procurement, Quality, Financial, Invoicing) require state machine-based workflows. Each domain has distinct states and transitions but shares the same pattern: guard conditions, transition validation, and lifecycle hooks.

## Decision
Create a shared `BaseStateMachine` class and `WorkflowEngine` singleton that:
- Accepts a `TransitionMap` (Record of current state → transition → next state)
- Provides `can()`, `transition()`, and `allowedTransitions()` methods
- Uses `ErrorCodes` for typed transition errors
- Registers all state machines with a global `WorkflowEngine` for observability

Each domain implements its own state machine by extending `BaseStateMachine`.

## Current Location (Technical Debt)
`BaseStateMachine` and `WorkflowEngine` currently live in `procurement/workflow/`. They are imported by `quality`, `financial`, and `invoicing` domains. The recommended target is `core/workflow/`.

## Consequences
- + Reusable across all domains
- + Explicit state transitions (no magic status changes)
- - Cross-domain dependency while in procurement
- - No built-in persistence of transition history (future enhancement)

## State Machines Built
1. RFQ (6 states)
2. Quotation (5 states)
3. Purchase Order (6 states)
4. Delivery (7 states)
5. Financial Trust (6 states)
6. Invoice (9 states)
7. Quality Inspection (7 states)
