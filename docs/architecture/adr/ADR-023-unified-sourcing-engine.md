# ADR-023: Unified Sourcing Engine

## التاريخ
2026-08-22

## آخر تحديث
2026-08-22 — **Final Approval** (Gate 1 CLOSED) + TRANSPORT registry clarification

## الحالة
**✅ Approved / Baseline — Gate 1 CLOSED**

Core decisions locked — amendments only via new ADR or documented amendment.

## Prerequisite
- ADR-022 ✅ Approved
- Phase 2 Gate 0 ✅ Approved

## Phase 2 Rule
ADR-023 closed. ADR-024 in progress (design only). ❌ No coding · ❌ No migrations · ❌ No UI · ❌ No implementation.

---

## السياق

ADR-022 اعتمد **Unified Sourcing Engine** (D2, D3).  
Tender / RFQ / Auction / Scrap / Rental / Transport = **Event Types** — **Unified model ≠ Unified workflow ≠ God Aggregate**.

هذا ADR يحدد التصميم التفصيلي لـ **Sourcing & Commercial Exchange** + تكامل **Marketplace/Catalog/Listing** داخل Commerce ecosystem واحد.

---

## القرار (Proposal — Amended)

اعتماد **Unified Sourcing Engine** مع:

- **Lean Core `SourcingEvent`** aggregate + **Type-specific Policy/Workflow profiles** (externalized logic)
- **`Listing` ≠ `SourcingEvent`** — مسار Catalog/Discovery منفصل عن Transaction
- **Qualification funnel** + **Best Value** (not lowest-price default)
- **Policy-based invitations** (urgent) — لا AI invitations حرة
- **Emergency:** pre-delegated + audit + post-review — **لا bypass** للضوابط الأساسية
- **Workforce Hire** via Sourcing؛ Skills/Certs/Availability via Workforce domain

---

## Anti-Pattern Guard: SourcingEvent Is NOT a God Aggregate

### Principle

`SourcingEvent` يحمل **هوية الحدث، الحالة، المراجع، والـsnapshot** — **لا** يحتوي inline logic لـ Tender + Auction + Scrap + Rental + Transport + Service collectively.

### Decomposition

```
┌──────────────────────────────────────────────────────────────────┐
│  SourcingEvent (LEAN AGGREGATE ROOT)                             │
│    id, type, mode, direction, status, refs, scopeSnapshot, version│
│    workflowInstanceRef  ──► Workflow Profile (ADR-012 registry)    │
│    policyBundleRef      ──► Type-specific Policy Bundle            │
│    evaluationProfileRef ──► Qualification + Best Value config      │
│    auctionProfileRef?   ──► Auction rules (only if mechanism=AUCTION)│
│    children: Offer[], EvaluationRun, Award (standard)            │
└──────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
  WorkflowProfile      PolicyBundle         EvaluationProfile
  (state machine)      (per event type)     (qualification + best value)
  - transitions        - publish rules      - gate sequence
  - guards             - participant rules  - weight matrix
  - side effects       - urgency overrides  - winner determination mode
                       - emergency policy   - technical/commercial split
```

### What lives OUTSIDE the aggregate

| Concern | Owner | Bound to event via |
|---------|-------|-------------------|
| State machine transitions | Workflow Profile (registry) | `workflowProfileId` |
| Tender sealed-bid rules | Policy Bundle | `policyBundleRef` |
| Auction bid extensions | Auction Profile | `auctionProfileRef` |
| Scrap sale collection terms | Policy Bundle | type=SCRAP_SALE |
| Rental period logic | Policy Bundle | type=EQUIPMENT_RENTAL |
| Transport SLA windows | Policy Bundle | type=TRANSPORT + transportMode |
| Qualification gates | Evaluation Profile | `evaluationProfileRef` |
| Best Value weights | Evaluation Profile | configurable matrix |
| Matching/scoring | Matching Service (read + recommend) | event ref |
| AI recommendations | Intelligence (cross-cutting) | recommendation ref |

### Aggregate responsibility (only)

1. Enforce invariants on core identity and status transitions (via workflow delegate).
2. Own child entities: `Offer`, `Bid`, `EvaluationRun`, `Award`.
3. Hold immutable `scopeSnapshot` post-publish.
4. Emit domain events on state changes.
5. **Delegate** type-specific validation to Policy/Workflow services — **not** embed in aggregate class.

---

## A. Sourcing Domain Model (Final)

### Commerce Ecosystem (unified)

Marketplace و Sourcing **ليسا domainين منفصلين** — يشكلان **Commerce Ecosystem** داخل Sourcing & Commercial Exchange:

```
┌─────────────────────────────────────────────────────────────────┐
│              COMMERCE ECOSYSTEM (Sourcing Context)               │
├─────────────────────────────────────────────────────────────────┤
│  CATALOG LAYER (read — Product Catalog SoR external/ref)        │
│    Product, Category, Spec templates                            │
│                                                                  │
│  LISTING LAYER (discovery — owned)                               │
│    Listing ◄── persistent offer for discovery                   │
│                                                                  │
│  TRANSACTION LAYER (execution — owned)                           │
│    SourcingEvent ◄── lean aggregate — commercial process        │
│    StandaloneRequest, Offer, Bid, EvaluationRun, Award          │
│                                                                  │
│  DEMAND LAYER (refs)                                             │
│    FutureDemandLink, Package ref, Project ref                   │
└─────────────────────────────────────────────────────────────────┘
```

### Listing ≠ SourcingEvent

| | **Listing** | **SourcingEvent** |
|---|-------------|-------------------|
| **Purpose** | Discovery — something available to buy/sell/rent | Transaction — process with terms, participants, offers, evaluation, outcome |
| **Lifecycle** | Active → Paused → Sold/Expired → Archived | Draft → Published → … → Awarded → Closed |
| **Participants** | Public/qualified viewers | Invited/qualified bidders with rules |
| **Outcome** | May spawn transaction | Produces Award → Contract/PO |
| **Persistence** | Long-lived catalog entry | Time-bound commercial process |
| **Owned by** | Sourcing context (`Listing` aggregate) | Sourcing context (`SourcingEvent` aggregate) |

**Listing is NOT a subtype of SourcingEvent.** Separate aggregate with optional link.

### Three entry paths (all converge to SourcingEvent)

```
PATH 1 — Catalog / Marketplace
  Catalog → Listing → Discovery → [Inquiry/Order Intent]
    → CreateSourcingEvent(fromListingId) → Transaction

PATH 2 — Project / BOQ
  Project → BOQ/Requirement → Package → CreateSourcingEvent → Transaction

PATH 3 — Standalone
  StandaloneRequest → CreateSourcingEvent → Transaction
```

### Listing → SourcingEvent flow

```
Listing (ACTIVE)
  ↓ buyer inquiry / "Buy Now" / "Request Quote"
CreateSourcingEvent {
  listingId: ref
  scopeSnapshot: copied from listing + inquiry specifics
  eventTypeCode: derived (DIRECT_PURCHASE | RFQ | AUCTION...)
}
  ↓
SourcingEvent lifecycle (separate aggregate)
  ↓
On Award + fulfillment → Listing status → SOLD / PARTIALLY_SOLD
```

### Context boundary

**Bounded Context:** Sourcing & Commercial Exchange  
**Owns:** Listing, StandaloneRequest, SourcingEvent lifecycle, Offer, Bid, Award, FutureOffer  
**Does NOT own:** Product master (Catalog SoR), Contract, Evidence, Payment, Org master, Workforce profile data

### Core entities

```
Listing (aggregate — discovery)
  id, sellerOrgId, catalogProductRef?, title, spec, priceHint
  listingType: PRODUCT | SURPLUS | SCRAP | RENTAL | SERVICE
  visibility, status, spawnedEventIds[]

StandaloneRequest (aggregate — lightweight entry)
  id, requesterOrgId, intent, categoryRef, urgencyLevel

SourcingEvent (aggregate — lean transaction root)
  core refs + scopeSnapshot + profile refs + children

FutureDemandLink (entity — ref to Requirements signal)
```

---

## B. SourcingEvent Aggregate (Lean — Final)

### Definition

**`SourcingEvent`** = commercial transaction process instance — **lean root** delegating type logic to profiles.

### Key attributes (amended)

| Attribute | Description |
|-----------|-------------|
| `eventTypeCode` | Registry ref |
| `commerceMode` | PROJECT_BASED \| PROGRAM_BASED \| STANDALONE |
| `direction` | enum | BUY \| SELL \| HIRE \| RENT \| TRANSPORT \| SERVICE \| SUBCONTRACT \| DISPOSE \| RECOVER (+ AUCTION mechanism) |
| `listingId` | Optional — if spawned from Listing |
| `workflowProfileId` | External state machine |
| `policyBundleRef` | Type-specific rules |
| `evaluationProfileRef` | Qualification + Best Value config |
| `auctionProfileRef` | Optional — only when mechanism includes AUCTION |
| `qualificationGateRef` | Prequalification policy (OAD-013) |
| `urgencyLevel` | NORMAL → EMERGENCY |
| `scopeSnapshot` | Immutable post-publish |

### Invariants (amended)

1–7. *(unchanged from v1)*  
8. Type-specific rules resolved via `policyBundleRef` — **not** hard-coded in aggregate.  
9. Award requires `EvaluationRun` satisfying `evaluationProfileRef` gates — **unless** policy explicitly waives for event type (never for TENDER/RFP without ADR).  
10. **`winnerDetermination` ≠ LOWEST_PRICE** unless `evaluationProfile.explicitLowestPriceMode = true` (opt-in, not default).

---

## C. Event Type Registry (Final)

Extensible registry — each entry points to **Workflow + Policy + Evaluation profiles** — not embedded logic.

### Registry entry (amended)

```
EventTypeDefinition {
  code, direction, commercialMechanism
  workflowProfileId
  policyBundleRef
  evaluationProfileRef          // includes Best Value defaults
  qualificationGateRef          // OAD-013
  requiredCapabilities: { buyer?, seller? }
  optionalProjectLink: boolean
  listingSpawnable: boolean      // can originate from Listing
  defaultUrgency, visibilityDefault
  approvalPolicyRef, legalProfileRef
  enabled: boolean
}
```

### Event Types (v1 — unchanged list, profile-bound)

**BUY:** TENDER, RFQ, RFP, DIRECT_PURCHASE, URGENT_PURCHASE  
**HIRE/SERVICE:** WORKFORCE_REQUEST, SERVICE_REQUEST  
**RENT:** EQUIPMENT_RENTAL  
**TRANSPORT:** `TRANSPORT` *(unified — see Transport Mode below)*  
**SELL/DISPOSE/RECOVER:** SCRAP_SALE, SURPLUS_SALE, INVENTORY_CLEARANCE, PRODUCT_SALE

**Mechanisms:** AUCTION, REVERSE_AUCTION, sealed bid, time-bound bidding

---

## D. State Machine Matrix (Final)

State machines live in **Workflow Profile registry** — SourcingEvent holds `workflowInstanceRef` only.

| Event Type | Profile | Key states |
|------------|---------|------------|
| TENDER | `wf-tender-full` | Draft→Published→Submission→Qualification→Evaluation→Award→Contracted→Closed |
| RFQ | `wf-rfq-standard` | Draft→Published→Quoting→Evaluation→Award→Fulfillment→Closed |
| RFP | `wf-rfp-two-stage` | +TechnicalEval→CommercialEval |
| URGENT_PURCHASE | `wf-urgent` | Requested→PolicyMatch→Invited→Quoted→Accepted→Dispatched→Verified→Closed |
| SCRAP_SALE | `wf-scrap-auction` | Draft→Published→Bidding→Winner→Payment→Collection→Closed |
| EQUIPMENT_RENTAL | `wf-rental` | Draft→Published→Offers→Award→ActiveRental→Returned→Closed |
| WORKFORCE_REQUEST | `wf-workforce-hire` | Draft→Published→Qualification→Offers→Award→Active→Closed |
| DIRECT_PURCHASE | `wf-direct` | Draft→Approved→Ordered→Delivered→Closed |
| FUTURE_DEMAND | `wf-future` | Signal→Offers→Reserved→Triggered→RFQ→… |

**Matrix rule:** columns differ per profile — no forced universal path.

---

## E. Project → Package → Sourcing (Final)

```
Program → Project → Package → Lot? → SourcingEvent
                              ↗
BOQ/Requirement ────────────┘
```

Package status updated on `AwardIssued`. BOQ snapshot copied at publish — not live join.

---

## F. Standalone + Catalog Paths (Final)

```
PATH A: StandaloneRequest → SourcingEvent (STANDALONE)
PATH B: Listing → [Discovery] → SourcingEvent (listingId set)
PATH C: Project/Package → SourcingEvent (PROJECT_BASED)
```

All three produce **same lean SourcingEvent** — different `commerceMode`, refs, and profile selection.

---

## G. Buy / Sell / Hire / Transport (Final)

Direction = enum on SourcingEvent. Eligibility = **Party Network capabilities** — no per-scenario domains.

Scrap buyers = orgs with `BUY_SCRAP` capability — **not** a Scrap Buyer Domain.

---

## H. Auction Model (Final)

Auction = **mechanism** via `auctionProfileRef` — not domain, not God Aggregate logic.

`winnerDetermination` default = **BEST_VALUE** (via evaluation profile) — `LOWEST_BID`/`HIGHEST_BID` only when profile + legal rules explicitly set.

Full audit trail on every bid. `legalProfileRef` per jurisdiction.

---

## I. Future Demand Model (Final)

`FutureDemandSignal` (Requirements SoR) → `FutureOffer` (Sourcing) → convert to SourcingEvent on trigger.

Visibility: D6 policy levels. Auto-trigger: AI-suggest + manual confirm (OAD-006).

---

## J. Urgent Procurement (Amended)

### Urgency levels

NORMAL | PLANNED | URGENT | CRITICAL | EMERGENCY

### Invitation flow — Policy-based (NOT AI free invite)

```
Urgent Request (SourcingEvent, urgency ≥ URGENT)
  ↓
Matching Engine → Qualified Supplier Candidates (scored list)
  ↓
Policy-based Selection
  (pre-configured rules: pool, geography, cert, capacity, trust min)
  ↓
Authorized Invitations
  (system may send automatically ONLY if InvitationPolicy permits)
  ↓
Audit Trail
  (who/what policy/which candidates/why selected/excluded)
  ↓
Offers → Evaluation → Award
```

**AI role:** rank and recommend candidates — **never** send invitations without `InvitationPolicy` match + authorization record.

| Step | Authority |
|------|-----------|
| Candidate ranking | Matching + AI assist |
| Pool selection | InvitationPolicy (config) |
| Send invitations | Policy auto-send OR authorized user confirm |
| Audit | Mandatory event `InvitationsDispatched` |

---

## J2. Emergency Bypass (Amended)

### Approved: Pre-delegated authority + Audit + Post-Approval Review

**Emergency MAY bypass:** normal approval **timeline** / sequential workflow delays — **only** for pre-delegated roles per `EmergencyPolicy`.

**Emergency MUST NOT bypass:**

| Control | Always enforced |
|---------|-----------------|
| Financial limits | Hard ceiling per delegate + event |
| Segregation of Duties | Initiator ≠ sole approver on same event |
| Mandatory supplier qualification | Min qualification gate |
| Safety requirements | Category-mandatory certs |
| Regulatory requirements | Compliance pre-check |
| Audit trail | Automatic on every emergency action |

### Emergency flow

```
Emergency Declared (role + reason + scope)
  ↓
Emergency Approval (pre-delegated authority — time bypass only)
  ↓
Automatic Audit Record (immutable)
  ↓
Expedited Matching → Policy Invitations → Award
  ↓
Fulfillment + Evidence (may be post-delivery for EMERGENCY)
  ↓
Post-Approval Review (mandatory within N hours/days)
  ↓
ReviewOutcome: CONFIRMED | ESCALATED | FLAGGED
```

Protected Payment: emergency **≠** skip evidence for release — may defer evidence deadline per policy, not eliminate.

---

## J3. Workforce Integration (Final)

### Approved split

| Concern | Owner |
|---------|-------|
| **Hire transaction** (need 20 steel fixers × 1 month) | **Sourcing** — `WORKFORCE_REQUEST` event |
| **Skills, Certs, Availability, Professional profile** | **Workforce Domain** |
| **Job board postings** (construction-scoped) | **Workforce Domain** |

### Relationship diagram

```
Workforce Domain                    Sourcing Domain
  Skills ──────────────read────────► WORKFORCE_REQUEST scope
  Certifications ─────read────────► Qualification gate
  Availability ───────read────────► Matching input
  ProfessionalProfile ──read────────► Bidder eligibility
       ▲                                    │
       │                                    ▼
       └──────────── AwardIssued ──── Contract / Package ref
                         ▲
Project / Package ───────┘ (crew assigned to package/project)
```

### Example: 20 steel fixers for 1 month

```
Contractor → Package "Structure" on Project X
  → SourcingEvent(type=WORKFORCE_REQUEST, hireScope: {role, qty, duration, skills[]})
  → Qualification gate reads Workforce: STEEL_FIXER cert + availability
  → Offers from qualified providers
  → Best Value evaluation (skill match + rate + availability + trust)
  → Award → Contract (labour) → Execution
```

Workforce domain **never** owns Award or commercial terms.

---

## K. Qualification + Matching + Best Value (Final)

### K1. Prequalification / Qualification Funnel

**Not:** Lowest Price = Winner  
**Yes:** Gated funnel — rules configurable per event type, country, policy.

```
Eligible          (capability + category + visibility)
  ↓
Qualified         (Party Network qualification records)
  ↓
Compliant         (certs, regulatory, safety — Trust/Compliance read)
  ↓
Available         (capacity, inventory, workforce availability)
  ↓
Can Deliver       (lead time, logistics, geo — Matching)
  ↓
Trusted           (trust score ≥ threshold — Trust read)
  ↓
[Receive Offer / Bid]
  ↓
Technical Evaluation   (if profile requires — e.g. RFP, TENDER)
  ↓
Commercial Evaluation  (price, terms, payment)
  ↓
Best Value Winner      (weighted composite — NOT default lowest price)
```

Gates enforced via `qualificationGateRef` + `evaluationProfileRef`. Failed gate = excluded or flagged — policy defines hard vs soft fail.

### K2. Best Value Model

**Default winner determination = BEST_VALUE** (composite score).

```
BestValueScore =
  w1 × CommercialScore
+ w2 × TechnicalScore
+ w3 × DeliveryScore
+ w4 × QualityScore
+ w5 × TrustScore
+ w6 × RiskScore (inverse)
+ w7 × ComplianceScore
+ w8 × CapacityScore
```

| Dimension | Source | Notes |
|-----------|--------|-------|
| Commercial | Offer price/terms | Not sole factor |
| Technical | Evaluation run | Spec compliance, methodology |
| Delivery | Matching | Lead time, logistics |
| Quality | Trust history | NCR rate, inspection pass |
| Trust | Trust signals | Verification level |
| Risk | Intelligence | Anomaly, concentration |
| Compliance | Party + Trust | Certs valid |
| Capacity | Inventory/Workforce read | Can fulfill qty |

**Weights configurable** per `evaluationProfileRef`, event type, org policy, jurisdiction.

`LOWEST_PRICE` mode = **explicit opt-in** on profile — requires approver acknowledgment for TENDER/RFP classes.

### K3. Matching Architecture (amended)

Matching produces **candidate list** — invitations follow **InvitationPolicy** (see §J).

Inputs unchanged: Party, Catalog, Trust, Intelligence, Inventory read.

Output: `MatchRecommendation { orgId, funnelStage, scores, rank, policyEligible }`

---

## K4. Buyer Protection (No Delay — No Excuse — No Fraud)

ABC must support post-award protection chain — **design in ADR-023**, detailed execution in Contract/Trust ADRs.

### Issue types

| Issue | Detection | Path |
|-------|-----------|------|
| Wrong specification | Inspection / GRN | Claim → Evidence |
| Wrong product | QC / Evidence | NCR → Claim |
| Short quantity | GRN count vs PO | Claim |
| Damaged goods | Inspection photos | NCR → Claim |
| Late delivery | SLA vs actual | Penalty / Claim |
| Failed installation | Milestone evidence | Contract claim |
| Supplier default | Non-performance | Contract termination → Claim |
| Disputes | Party escalation | DisputeCase → mediation/arbitration ref |

### Protection chain

```
Sourcing (Award + scopeSnapshot + supplier ref)
  ↓
Contract (terms, milestones, penalties, warranty)
  ↓
Procurement (PO, delivery)
  ↓
Trust / Evidence (inspection, photos, certs, GRN)
  ↓
Quality (NCR, acceptance)
  ↓
Claim (Contract — progress or defect)
  ↓
Verification (Trust)
  ↓
Payment Instruction (hold / partial release / penalty)
  ↓
External Payment
```

**Principle:** Commercial commitment from Sourcing is **traceable** through Contract → Evidence → Claim → Payment. ABC coordinates — legal remedies per contract and applicable law.

Sourcing stores on Award: `warrantyProfileRef`, `acceptanceCriteriaRef`, `penaltyProfileRef` — applied downstream by Contract/Trust.

---

## L. AI Responsibility Boundaries (Final)

### AI MAY
Intent, classification, package suggestion, BOQ analysis, **candidate ranking**, price anomaly, risk, delay prediction, alternatives.

### AI MAY NOT
- Send invitations independently
- Award without policy-permitted automation
- Bypass qualification gates
- Bypass financial limits or segregation of duties
- Override Best Value evaluation without human approval

---

## M. Evidence / Trust Integration (Final)

Sourcing reads Trust Signals API — no ownership. Post-award: `EvidenceRequirements` template handoff on `AwardIssued`.

---

## N. Authorization Model (Final)

Layers: Organization → Project → Event → Financial → Regulatory.

Emergency: pre-delegated role only. Invitation dispatch: InvitationPolicy + audit.

`Organization ≠ Persona ≠ Role ≠ Capability ≠ Contract Party ≠ Permission`

---

## O. Domain Events (Final — amended)

| Event | Notes |
|-------|-------|
| `ListingCreated` / `ListingPublished` | Catalog path |
| `ListingInquiryReceived` | May trigger SourcingEvent |
| `SourcingEventCreated` | May include `listingId`, `packageId`, `standaloneRequestId` |
| `SourcingEventPublished` | Triggers matching — not auto-invite |
| `QualificationGateEvaluated` | Per participant, gate results |
| `InvitationsDispatched` | **Policy audit payload required** |
| `OfferSubmitted` / `OfferWithdrawn` | |
| `EvaluationStarted` / `EvaluationCompleted` | Includes BestValue scores |
| `AwardIssued` | Handoff to Contract, Procurement |
| `EmergencyDeclared` / `EmergencyApproved` / `PostApprovalReviewCompleted` | Emergency chain |
| `AuctionBidPlaced` / `AuctionExtended` | |
| `FutureOfferSubmitted` | |
| `BuyerClaimOpened` | Ref from Contract — Sourcing notified read-only |

---

## P. API Boundary Design (Final — amended)

### Commands (additions)

```
POST /api/v1/sourcing/listings                          CreateListing
POST /api/v1/sourcing/listings/{id}/inquire             Listing inquiry
POST /api/v1/sourcing/listings/{id}/start-event           Spawn SourcingEvent from Listing
POST /api/v1/sourcing/events/{id}/evaluate-qualification  Run qualification gate
POST /api/v1/sourcing/events/{id}/dispatch-invitations  Policy-based invite (auth)
POST /api/v1/sourcing/events/{id}/emergency/declare       Emergency flow
POST /api/v1/sourcing/events/{id}/emergency/review        Post-approval review
```

### Queries (additions)

```
GET /api/v1/sourcing/listings                           Discovery
GET /api/v1/sourcing/events/{id}/qualification-status   Gate results per participant
GET /api/v1/sourcing/events/{id}/best-value-matrix      Evaluation weights (auth)
GET /api/v1/sourcing/events/{id}/invitation-audit         Invitation audit trail
```

---

## Commercial Directions (Strategic — All via Same Architecture)

| Direction | Meaning | Example event types |
|-----------|---------|---------------------|
| **BUY** | Acquire goods/materials | RFQ, TENDER, URGENT_PURCHASE, DIRECT_PURCHASE |
| **SELL** | Dispose/sell goods | PRODUCT_SALE, SURPLUS_SALE, SCRAP_SALE |
| **HIRE** | Engage people/services by time | WORKFORCE_REQUEST, SERVICE_REQUEST |
| **RENT** | Temporary asset use | EQUIPMENT_RENTAL |
| **TRANSPORT** | Move goods/waste/capacity | `TRANSPORT` + `transportMode` in PolicyBundle |
| **SERVICE** | Deliver scoped service | SERVICE_REQUEST, maintenance |
| **SUBCONTRACT** | Package/work scope to third party | TENDER, RFP (project packages) |
| **DISPOSE** | Remove/sell waste/scrap | SCRAP_SALE, SURPLUS_SALE |
| **RECOVER** | Buy back / salvage / clearance | INVENTORY_CLEARANCE, AUCTION |
| **AUCTION** | Competitive mechanism (orthogonal) | Forward/reverse/scrap/surplus/liquidation/procurement |

**No new domain per direction** — `direction` + `eventTypeCode` + profiles.

### TRANSPORT registry clarification (Final)

**Decision:** Unify `TRANSPORT` and `TRANSPORT_REQUEST` into **one event type: `TRANSPORT`**.

There is no separate architectural aggregate — difference is **operational mode** via `PolicyBundle.transportMode`:

| transportMode | Former name | Use case | Workflow profile |
|---------------|-------------|----------|------------------|
| `ON_DEMAND` | TRANSPORT_REQUEST | Spot haul, waste removal, urgent move | `wf-transport-urgent` |
| `CAPACITY_AGREEMENT` | TRANSPORT (capacity) | Logistics company sells transport capacity | `wf-transport-capacity` |
| `SCHEDULED` | — | Project-linked planned logistics | `wf-transport-scheduled` |

`legalProfileRef` adds waste manifest / hazmat rules per mode. **Do not register TRANSPORT_REQUEST as separate EventType.**

---

## Universal Commerce Principle (Final — Baseline)

**Any eligible Party** may **buy, sell, offer, rent, or provide services** according to **capabilities + permissions** — not Persona alone.

| Party type | Example commercial actions (via Sourcing) |
|------------|-------------------------------------------|
| **Contractor** | Sell scrap, surplus materials, equipment; excess inventory |
| **Supplier** | Products, new stock, surplus, clearance |
| **Owner** | Surplus assets, equipment, products |
| **Equipment Company** | Equipment rental |
| **Logistics Company** | Transport capacity (`TRANSPORT` CAPACITY_AGREEMENT) |
| **Service Provider** | Maintenance, consultancy, scoped services |

**No separate domain per scenario** — `direction` + `eventTypeCode` + `Listing` + capabilities.

---

## OAD Decision Closure (Round 3 — Final Approval)

See § Decision Closure Detail below for OAD-002, 004, 006, 007, 009, 011, 013, 014, 015.

---

## Open Architectural Decisions (OAD-023-001 → 015) — Closure Table

| ID | Problem | Recommendation | Status |
|----|---------|----------------|--------|
| **OAD-023-001** | StandaloneRequest owner | Sourcing | ✅ Approved |
| **OAD-023-002** | Product Catalog SoR | **Product Catalog context (SoR) + Inventory snapshots + Sourcing owns commercial Offers** — see Ownership Matrix § | ✅ Approved |
| **OAD-023-003** | Listing vs SourcingEvent | Separate aggregates; Listing spawns event | ✅ Approved |
| **OAD-023-004** | Legal profiles | **Compliance domain owns LegalProfile registry** — jurisdiction-composable, no hard-code | ✅ Approved |
| **OAD-023-005** | Emergency bypass | Pre-delegated + audit + post-review | ✅ Approved |
| **OAD-023-006** | AI Future Demand | **Detect → Recommend → Human Confirm → FutureDemandSignal → SourcingEvent** + full audit | ✅ Approved |
| **OAD-023-007** | Workflow runtime | **ADR-012 shared runtime** — profiles versioned; core engine unchanged | ✅ Approved |
| **OAD-023-008** | Bid deposit | Defer ADR-025 | ⏸️ Deferred |
| **OAD-023-009** | Auction variants | **auctionProfile templates** + legalProfileRef per jurisdiction | ✅ Approved |
| **OAD-023-010** | Urgent invitations | Policy-based + audit | ✅ Approved |
| **OAD-023-011** | Legacy migration | **Strangler** — adapters → canonical → new APIs → retire | ✅ Approved |
| **OAD-023-012** | Workforce | Hire=Sourcing; Skills/Certs=Workforce | ✅ Approved |
| **OAD-023-013** | Prequalification | **Policy-driven QualificationPolicy** — mandatory rules by event/risk/value | ✅ Approved |
| **OAD-023-014** | Best Value | **Default BEST_VALUE; LOWEST_PRICE opt-in; AI scores assist, human decides** | ✅ Approved |
| **OAD-023-015** | Buyer Protection | **Full chain to Payment Instruction; No Evidence→No Release; no ADR-024 conflict** | ✅ Approved |

**Closed pending your Final Approval sign-off:** OAD-002, 004, 006, 007, 009, 011, 013, 014, 015

---

## Decision Closure Detail

### OAD-023-002 — Product Catalog Ownership Matrix

| Entity / Concern | System of Record | Sourcing relationship |
|------------------|------------------|------------------------|
| **ProductMaster** (canonical SKU, spec template, category) | **Product Catalog** context | Read `productRef`; snapshot into `scopeSnapshot` at publish |
| **SupplierProductOffer** (supplier-specific catalog line, list price hint) | **Product Catalog** (supplier overlay) | Read for Listing creation; not binding commercial offer |
| **Listing** (discovery) | **Sourcing** | Owns; refs ProductMaster |
| **Commercial Offer / Bid** (binding quote in a process) | **Sourcing** (`Offer` child of SourcingEvent) | Owns |
| **Stock / Availability snapshot** | **Inventory** context (supplier warehouse) | Read for matching; optional reservation via Procurement post-award |
| **Future capacity commitment** | **Sourcing** (`FutureOffer`) | Owns |
| **Award / commercial outcome** | **Sourcing** | Owns → handoff Contract |

**Supplier scenarios:**

| Scenario | Path |
|----------|------|
| منتج جديد | Catalog: draft ProductMaster → approve → Listing → SourcingEvent on inquiry |
| مخزون فائض | Listing(type=SURPLUS) + Inventory snapshot → SourcingEvent(SELL) |
| تصفية | Listing(type=CLEARANCE) or SourcingEvent(INVENTORY_CLEARANCE) |
| منتج مخصص | No ProductMaster required — `scopeSnapshot` spec in RFQ/RFP |
| مستورد من خارج الدولة | SourcingEvent + `legalProfileRef`(import) + compliance gates from Trust/Compliance read |

---

### OAD-023-004 — LegalProfile Registry

**Owner:** Compliance & Regulatory domain (config SoR)  
**Referenced by:** Sourcing (`legalProfileRef`, `auctionProfileRef.legalProfileRef`)

```
LegalProfile {
  id, jurisdictionCode          // AE, SA, … extensible
  effectiveFrom, version
  rules: {
    auction: { visibility, deposit, extension, coolingOff, bidderQualification }
    tender: { sealedBid, standstillPeriod, localContentRules? }
    scrap: { environmentalPermitRef, haulageRules }
    import: { customsRef, phytosanitary, conformityAssessment }
    transport: { wasteManifest, hazmatClasses }
    workforce: { visa/workPermit category refs }
  }
  regulatoryBodyRefs[]         // municipality, civil defense, engineering council — refs not embed
  visibilityDefaults
  enabled: boolean
}
```

**No hard-coded single country** — profiles composed per event via `legalProfileRef` selection (buyer org jurisdiction + event category + import flag).

Regulatory bodies = **ExternalRef** in Integration Hub + **ComplianceSnapshot** read models — ABC stores procedure refs, not authoritative registry data (ADR-022 Principle 9).

---

### OAD-023-006 — AI Future Demand Flow

```
1. AI Detect        → Intelligence: pattern from BOQ+Schedule+LeadTime (read-only)
2. AI Recommend     → RecommendationRecord (non-binding, Intelligence SoR)
3. Human Confirm    → Authorized user confirms/rejects (audit: userId, timestamp, reason)
4. FutureDemandSignal created (Requirements SoR) — only after step 3
5. FutureOffer collection (Sourcing) — optional, visibility per D6
6. Human Trigger    → ConvertToSourcingEvent (explicit command — never AI auto-create binding event)
```

**Audit events:** `FutureProcurementDetected`, `FutureProcurementRecommended`, `FutureProcurementConfirmed`, `FutureProcurementRejected`, `FutureDemandSignalCreated`, `SourcingEventCreatedFromFutureDemand`

**Principle:** AI may detect and recommend; **cannot** create binding procurement commitment.

---

### OAD-023-007 — Workflow Runtime (ADR-012)

**Confirmed:** ADR-012 shared workflow engine = **official runtime**.

| Shared (Core Engine) | Profile-Specific (Registry) |
|----------------------|----------------------------|
| Transition executor | State definitions |
| Guard evaluation framework | Transition map |
| History / audit log | Guard configs |
| Version pinning on instance | Side-effect handlers (domain commands) |
| Concurrent instance lock | Entry/exit actions |

**Add new workflow:** Register new `WorkflowProfile` document → assign `workflowProfileId` on EventType — **no core engine code change**.

**Versioning:** `SourcingEvent.workflowInstanceRef` pins `workflowDefinitionVersion`; existing instances stay on old version; new events use latest unless explicitly pinned.

---

### OAD-023-009 — auctionProfile Design

```
AuctionProfile {
  id, templateCode              // FORWARD | REVERSE | SCRAP | SURPLUS | LIQUIDATION | PROCUREMENT
  legalProfileRef
  bidDirection: UP | DOWN
  visibility: SEALED | RANK | OPEN | QUALIFIED_ONLY
  qualifiedBiddersOnly: boolean
  reservePrice?, minIncrement
  duration, softCloseExtensionMinutes, maxExtensions
  depositRuleRef?
  winnerMode: BEST_VALUE | LOWEST_BID | HIGHEST_BID  // default BEST_VALUE unless legal+eval opt-in price-only
  auditLevel: FULL
}
```

Templates map to event types: SCRAP_SALE→SCRAP, SURPLUS_SALE→SURPLUS, TENDER competitive→PROCUREMENT, etc. Legal/transparency per `legalProfileRef` — UAE vs KSA via profile swap, not code branch.

---

### OAD-023-011 — Strangler Migration Plan (Design Only)

```
Legacy Module          Adapter (Anti-Corruption)     Canonical Domain        New API (future)       Retirement
─────────────────────────────────────────────────────────────────────────────────────────────────────────────
procurement/RFQ    → SourcingLegacyAdapter       → SourcingEvent(RFQ)   → /sourcing/events      → deprecate /api RFQ v0
Tenders (fragment) → TenderLegacyAdapter         → SourcingEvent(TENDER) → /sourcing/events      → remove ProjectTender*
marketplace/       → ListingLegacyAdapter        → Listing + Sourcing    → /sourcing/listings    → merge product listing routes
product-catalog/   → (keep, reposition)          → Product Catalog SoR   → /catalog/*            → no retirement
inventory/         → (keep, reposition)          → Inventory SoR         → /inventory/*          → no retirement
quality/financial  → (keep)                      → Trust/Financial       → unchanged Phase 2     → N/A
```

**Keep temporarily:** All Phase 1 modules operational behind adapters.  
**Stop later:** Duplicate RFQ/Tender models once strangler routes ≥95% traffic (metric TBD in implementation phase).  
**No migration execution in Phase 2.**

---

### OAD-023-013 — QualificationPolicy (Policy-Driven)

```
QualificationPolicy {
  id, scope: GLOBAL | ORG | PROJECT | EVENT_TYPE
  triggers: {
    eventTypes[]              // TENDER, RFP, WORKFORCE_REQUEST, …
    minValueThreshold?
    riskClasses[]             // HIGH_RISK, SAFETY_CRITICAL, REGULATORY_SENSITIVE
    categories[]              // hazmat, structural, import, …
  }
  mandatory: boolean           // policy decides — not global always/never
  gates[]                     // sequence from Qualification Funnel
  minTrustScore?
  requiredCertRefs[]
}
```

Default policy pack (config, not code): TENDER/RFP/WORKFORCE/HIGH_RISK/SAFETY_CRITICAL/REGULATORY_SENSITIVE/HIGH_VALUE → `mandatory: true`.

---

### OAD-023-014 — Best Value Architecture

```
BestValueEvaluation {
  mode: BEST_VALUE | LOWEST_PRICE_EXPLICIT
  dimensions: {
    technical:   { weight, scoreSource: EvaluationRun.technical }
    quality:     { weight, scoreSource: Trust.history }
    compliance:  { weight, scoreSource: QualificationGate }
    delivery:    { weight, scoreSource: Matching.leadTime }
    capacity:    { weight, scoreSource: Inventory/Workforce read }
    trust:       { weight, scoreSource: Trust.score }
    commercial:  { weight, scoreSource: Offer.commercial }
    risk:        { weight, scoreSource: Intelligence.risk (inverse) }
  }
  compositeScore: weighted sum
  winnerSelection: AUTHORIZED_EVALUATOR | APPROVAL_COMMITTEE  // never AI alone
}
```

AI **may** propose dimension scores/explanations → stored as `AIScoreSuggestion` — evaluator **must** confirm or override for award.

---

### OAD-023-015 — Buyer Protection & ADR-024 Alignment

**Chain (no conflict):**

| Step | Domain | ADR-023 role | ADR-024 role |
|------|--------|--------------|--------------|
| Sourcing | Sourcing | Award + scopeSnapshot + profile refs | — |
| Contract | Contract | Receives `AwardIssued` | Creates Contract, Milestones |
| Evidence | Trust | Requirements template ref on award | Milestone triggers evidence |
| Claim | Contract | — | ProgressClaim / DefectClaim |
| Payment Instruction | Financial | — | Release after VerificationDecision |
| Bank/PSP | Integration | — | Executes instruction only |

**No Evidence → No Release** — Financial domain rule; Sourcing does not release payment.

**Owner Models A/B/C** — control views read chain; Sourcing unchanged.

**Protected Payment** — optional `PaymentMode` on Contract (ADR-024); ABC instructs, never custodies (ADR-022 D5).

**ADR-023 stores on Award:** refs only (`acceptanceCriteriaRef`, `warrantyProfileRef`, `penaltyProfileRef`, `evidenceProfileRef`) — Contract/Trust materialize.

---

## R. Scenario Acceptance Matrix (Expanded — 30 scenarios)

| # | Scenario | Mode | Direction | Type / Mechanism | Pass |
|---|----------|------|-----------|------------------|:----:|
| 1 | Owner — one chandelier | STANDALONE | BUY | DIRECT_PURCHASE / RFQ | ✅ |
| 2 | Owner — Jacuzzi from China | STANDALONE | BUY | RFQ + import LegalProfile | ✅ |
| 3 | Seedlings from Egypt | STANDALONE | BUY | RFP + phytosanitary gate | ✅ |
| 4 | Contractor — 2hr material | STANDALONE | BUY | URGENT_PURCHASE + EMERGENCY | ✅ |
| 5 | Material in 6 months | PROJECT | BUY | FUTURE_DEMAND → RFQ | ✅ |
| 6 | Contractor surplus materials | STANDALONE | SELL | SURPLUS_SALE | ✅ |
| 7 | Contractor sell 300t Scrap | STANDALONE | DISPOSE/SELL | SCRAP_SALE + AUCTION | ✅ |
| 8 | Supplier surplus 5000m tiles | STANDALONE | SELL | SURPLUS_SALE / Listing | ✅ |
| 9 | Supplier clearance | STANDALONE | RECOVER/SELL | INVENTORY_CLEARANCE | ✅ |
| 10 | Crane rental 6 months | STANDALONE | RENT | EQUIPMENT_RENTAL | ✅ |
| 11 | Waste transport | STANDALONE | TRANSPORT | TRANSPORT(ON_DEMAND) | ✅ |
| 12 | Developer — tower | PROJECT | BUY/SUBCONTRACT | Package TENDERs | ✅ |
| 13 | Neighborhood redevelopment | PROGRAM | SUBCONTRACT | Multi-project | ✅ |
| 14 | Government project tender | PROJECT/PROGRAM | BUY | TENDER + LegalProfile | ✅ |
| 15 | Bank progress view | Any | — | Read-only Integration | ✅ |
| 16 | Regulator evidence | Any | — | Compliance read | ✅ |
| 17 | PMC manages project | PROJECT | — | Model B permissions | ✅ |
| 18 | Owner self-manages | PROJECT | — | Model A | ✅ |
| 19 | ABC Digital Control only | Any | — | Control layer read | ✅ |
| 20 | External BOQ/Design/Schedule | PROJECT | — | Integration refs | ✅ |
| 21 | International purchase | STANDALONE/PROJECT | BUY | RFQ + import profile | ✅ |
| 22 | Forward Auction | STANDALONE | SELL | AUCTION profile | ✅ |
| 23 | Reverse Auction | PROJECT | BUY | REVERSE_AUCTION | ✅ |
| 24 | Emergency procurement | STANDALONE | BUY | URGENT + EmergencyPolicy | ✅ |
| 25 | Workforce request | PROJECT | HIRE | WORKFORCE_REQUEST | ✅ |
| 26 | Owner sell surplus furniture | STANDALONE | SELL | Listing → SURPLUS | ✅ |
| 27 | Equipment owner rent crane | STANDALONE | RENT | EQUIPMENT_RENTAL | ✅ |
| 28 | Logistics sell transport capacity | STANDALONE | TRANSPORT/SELL | TRANSPORT(CAPACITY_AGREEMENT) + Listing | ✅ |
| 29 | Service company maintenance | STANDALONE | SERVICE | SERVICE_REQUEST | ✅ |
| 30 | Liquidation auction | STANDALONE | RECOVER | AUCTION(LIQUIDATION) | ✅ |

**Architecture proof:** one engine, zero new domains for 30 scenarios.

---

## Dependencies with ADR-024 (Contract & Milestones)

| ADR-023 artifact | ADR-024 must define |
|------------------|---------------------|
| `AwardIssued` event | Contract creation command + ContractParty linking |
| `acceptanceCriteriaRef` | Milestone acceptance criteria template |
| `penaltyProfileRef` | Contract penalty clauses model |
| `evidenceProfileRef` | Milestone evidence requirements |
| `warrantyProfileRef` | Warranty period / defect liability |
| Buyer Protection chain | ProgressClaim, DefectClaim, DisputeCase |
| SUBCONTRACT direction | Contract type = SUBCONTRACT vs SUPPLY |
| No payment in Sourcing | PaymentInstruction only after Trust verification |

**No overlap:** Sourcing ends at Award; Contract owns execution terms; Trust owns verification; Financial owns payment instruction.

---

## Remaining Open Architectural Decisions (summary)

**Approved:** OAD-001, 003, 005, 010, 012

**Recommended for Final Approval (awaiting sign-off):** *(none — all closed)*

**Deferred:** OAD-008 → ADR-025

---

## Gate 1 — CLOSED ✅

ADR-023 **Approved / Baseline**. Proceed to ADR-024 (design only).

---

## References

- ADR-022 ✅ · Gate 0 ✅
- ADR-012 (Workflow Engine) · ADR-017 · ADR-019 · ADR-002 (legacy)
