# ADR-031: Experience & Owner Control Read Models

## التاريخ
2026-08-22

## آخر تحديث
2026-08-22 — **Gate 9 Final Approval** (OAD-031 closed + mandatory baseline rules)

## الحالة
**✅ FINAL APPROVED / BASELINE — Gate 9 CLOSED**

OAD-031-001 → OAD-031-010 ✅ Approved. Phase 2 Design Spine complete (ADR-022 → ADR-031).

Prerequisites: ADR-022 ✅ · ADR-023 ✅ · ADR-024 ✅ · ADR-025 ✅ · ADR-026 ✅ · ADR-027 ✅ · ADR-028 ✅ · ADR-029 ✅ · ADR-030 ✅ (Gate 8 CLOSED)

## Phase 2 Rule
Phase 2 Design Spine **CLOSED**. Phase 3 = Implementation Architecture & Roadmap (design only). ❌ No coding · ❌ No migrations · ❌ No UI implementation until Phase 3 plan approved

---

## السياق

ABC = **Construction Intelligence + Coordination + Transaction + Evidence + Owner Control Layer**

**المبدأ المعتمد (Gate 9):**

> **Experience is a presentation/composition layer — not a Source of Record and not a Business Domain authority.**

> **Owner Digital Eye = composed read models over Core Domains — not a duplicate database of business truth.**

```
Core Domains (SoR)
       ↓ domain events
Projection Layer (read-model builders)
       ↓
Read Models (materialized views)
       ↓
Experience API (composition + auth scope)
       ↓
Portal / Dashboard / Control Tower (presentation)
```

**ADR-022 D7:** Owner Control Layer — Models A/B/C · Portal ≠ Control  
**ADR-024 §8:** OwnerControlReadModel — composed from Contract + Trust + Financial  
**ADR-026 C7:** Full drill-down Program → Payment  
**ADR-027/028:** Golden Chain traceability APIs — Experience **delegates**, does not copy  
**ADR-030:** Compliance/Regulatory read slices — Experience displays, Compliance decides  
**ADR-019:** Persona × Capability × Permission — Experience configures presentation

---

## القرار

اعتماد **Experience** bounded context كـ **BASELINE**:

- **Portal configuration** — persona layouts, navigation, dashboard definitions
- **Read-model projections** — event-driven; Experience **builds/consumes** projections, **never** business SoR
- **Owner Digital Eye** — executive → transaction drill-down without traceability loss
- **Control Tower** — Planned / Actual / Claimed / Verified / Approved / Paid separation
- **Stakeholder-specific views** — Role + Organization + Project + Contract + Delegation + Data Scope
- **Golden Chain presentation** — delegates to canonical traceability APIs (ADR-027/028/030)
- **Alert presentation** — Signal ≠ Alert ≠ Decision ≠ Action
- **Freshness metadata** — every view exposes Last Updated / Source / Freshness SLA
- **Security model** — tenant → org → project → contract → role → delegation → data scope

**Experience owns:** presentation config, read-model projections, composition APIs, alert display.  
**Experience does NOT own:** any business aggregate state listed in §1.

---

## 1. Experience Domain Boundary

### 1.1 Owns (SoR — presentation metadata only)

| Entity | Responsibility |
|--------|----------------|
| **PortalConfig** | Tenant/persona portal settings |
| **DashboardDefinition** | Widget layout, data source refs, freshness display |
| **ViewComposition** | Which read models compose a screen |
| **NavigationProfile** | Menu/routes per persona + capability |
| **ReadModelProjection** | Projection registry + cursor/offset state |
| **ReadModelSnapshot** | Optional scheduled snapshot metadata (not business SoR) |
| **AlertPresentation** | Display state for alerts (read/dismissed/snoozed) |
| **NotificationPreference** | User notification channel prefs |
| **ExperienceAuditEntry** | View access audit (who saw what scope) |

### 1.2 Does NOT own (reads via projections / domain query APIs)

| Concern | SoR Owner |
|---------|-----------|
| Project / Program / WBS state | Project & Program |
| BOQ / Requirements | Requirements & BOQ |
| Sourcing / Award | Sourcing & Commercial Exchange |
| Contract / Milestone / Claim | Contract & Milestones |
| Evidence / Verification | Trust & Evidence |
| Compliance decisions / LegalProfile | Compliance & Regulatory |
| PaymentInstruction / Financial Policy | Financial & Payment |
| Organization master | Party Network |
| Integration state | Integration Hub |
| AI recommendations | Intelligence |

### 1.3 Boundary rule (Gate 9 — locked proposal)

> **Experience may compose, filter, mask, and present data — but may not create, mutate, or authoritatively decide business state.**

```
❌ Experience → Domain DB write
❌ Experience → PaymentInstruction create
❌ Experience → ComplianceDecision create
❌ Experience → VerificationDecision create
✅ Experience → Read Model query (scoped)
✅ Experience → Domain command dispatch (user action → domain API — not Experience deciding)
```

**Corollary:** Experience is **never** a new SoR for business truth — only for presentation preferences and projection metadata.

### 1.4 Mandatory Baseline Rules (Gate 9 — Locked)

| # | Rule |
|---|------|
| B1 | **Experience is never SoR** — under any circumstance |
| B2 | **Read models are rebuildable projections** — replay from source domain events |
| B3 | **No business decision created inside Experience** |
| B4 | **No duplicated authoritative state** |
| B5 | **Golden Chain delegated** to ADR-027 / ADR-028 / ADR-030 canonical APIs |
| B6 | **Financial truth** → Financial domain |
| B7 | **Compliance truth** → Compliance domain |
| B8 | **Evidence / Verification truth** → Trust domain |
| B9 | **Contract truth** → Contract domain |
| B10 | **Sourcing truth** → Sourcing domain |
| B11 | **Project / Program truth** → Project domain |
| B12 | **AI recommendations never become decisions implicitly** |
| B13 | **All sensitive views** require authorization + audit |
| B14 | **All projections** expose freshness / status metadata (`FreshnessMeta`) |

---

## 2. Owner Digital Eye — Drill-Down Hierarchy

### 2.1 Canonical navigation chain

```
Portfolio
  ↓
Program
  ↓
Project
  ↓
Phase
  ↓
WBS
  ↓
Package
  ↓
Sourcing (Event / Award)
  ↓
Contract
  ↓
Milestone
  ↓
Claim (Progress Claim)
  ↓
Evidence
  ↓
Verification
  ↓
Payment (Instruction / status)
```

Owner navigates **Executive View → Transaction Detail** with **breadcrumb + correlationId** preserved at every level.

### 2.2 OwnerControlTowerView (top-level aggregate read model)

```
OwnerControlTowerView {
  portfolioId?, programId?, projectId?
  asOf, freshnessMeta

  executiveSummary {
    projectsActive, projectsAtRisk
    budgetPlanned, budgetCommitted, budgetSpent
    schedulePlannedPct, scheduleActualPct, scheduleVarianceDays
    complianceBlockingCount, paymentHeldCount
  }

  drillDownRefs {
    programs[], projects[], phases[], wbsNodes[], packages[]
    sourcingEvents[], contracts[], milestones[]
    claims[], evidencePackages[], verificationDecisions[]
    paymentInstructions[]
  }

  traceabilityRef?              // correlationId for Golden Chain
}
```

### 2.3 Questions answered at each level

| Level | Owner questions |
|-------|-----------------|
| Portfolio/Program | Where is capital deployed? Which programs at risk? |
| Project | On time? On budget? Compliance clear? |
| Package/Sourcing | What was procured? From whom? At what value? |
| Contract/Milestone | What committed? What done? What verified? |
| Claim/Evidence | What proof? What's missing? Who verified? |
| Payment | What paid? What held? Why? |

---

## 3. Executive Control Tower

### 3.1 Control Tower panels

| Panel | Primary read model source | Progress layers shown |
|-------|---------------------------|----------------------|
| **Projects** | ProgramPortfolioView | status, phase, scale |
| **Schedule** | ScheduleSyncSnapshot | Planned vs Actual |
| **Budget** | BudgetEnvelope + CommitmentRegister | Planned vs Committed |
| **Commitments** | CommitmentRegister | Award + Contract value |
| **Sourcing** | SourcingEventSummary | open / awarded |
| **Contracts** | ContractSummaryReadModel | active / variations |
| **Progress** | ProjectProgressSummary | Physical / Claimed |
| **Evidence** | EvidenceStatusReadModel | submitted / verified / missing |
| **Payments** | OwnerFinancialControlReadModel | see §6 |
| **Compliance** | ComplianceReadView | blocking / warning / expired |
| **Risks** | ProjectRiskRegister + Intelligence signals | risk score |
| **Variations** | VariationPipelineReadModel | pending / approved |
| **Delays** | DelayRegisterReadModel | cause, responsible party |
| **Handover** | HandoverStatusReadModel | completion phase |

### 3.2 Six-layer progress separation (mandatory display)

Every financial/progress widget **must** distinguish:

| Layer | Meaning | SoR |
|-------|---------|-----|
| **Planned** | Baseline plan | Project / Contract |
| **Actual** | Physical / field progress | Contract (physical layer) |
| **Claimed** | Progress claim submitted | Contract |
| **Verified** | Evidence verified | Trust |
| **Approved** | Milestone/claim approved | Contract |
| **Paid** | Payment instruction executed | Financial |

**Experience displays all six — never collapses Claimed into Paid.**

---

## 4. Stakeholder Views

### 4.1 View resolution dimensions

Every view resolved by **six dimensions** — not role alone:

```
Tenant
  → Organization (Party)
  → Project / Program scope
  → Contract scope (if applicable)
  → Role + Persona (ADR-019)
  → DelegationMatrix grants (ADR-024)
  → Data Scope (field/row filter)
```

### 4.2 Stakeholder read models

| Stakeholder | Read Model | Data scope highlights |
|-------------|------------|---------------------|
| **Owner** | OwnerControlTowerView + full drill-down | Full visibility Models A/B/C; delegation does not hide |
| **PMC** | PMCOperationalView | Operational actions + delegated authority; no owner financial secrets beyond policy |
| **Contractor** | ContractorProjectView | Assigned contracts, claims, evidence submit, payment status (own) |
| **Supplier** | SupplierCommerceView | PO, deliveries, invoices, sourcing participation |
| **Consultant** | ConsultantVerificationView | Assigned verification, technical review, evidence review |
| **Bank** | BankProjectProgressView (ADR-024/026) | Budget, verified progress, payment requests — **masked** |
| **Regulator** | RegulatoryComplianceReadModel (ADR-030) | Permits, inspections, compliance — **restricted fields** |
| **Internal Management** | PortfolioExecutiveView | Cross-project KPIs, aggregated — tenant admin scope |

### 4.3 Owner vs PMC (Gate 9)

```
Owner Control
      ↓
Full visibility (read — always)
      ↓
DelegationMatrix
      ↓
PMC operational authority (write — delegated actions only)
```

| Concern | Owner | PMC (delegated) |
|---------|-------|-----------------|
| View all project financials | ✅ Always | Per policy |
| Approve payment | ✅ | If delegated |
| Submit claim | — | ✅ If delegated |
| See compliance blocking | ✅ | ✅ |
| Waive compliance | ✅ | If DelegationMatrix allows |
| Hide data from Owner | **❌ Never** | — |

---

## 5. Read Model Architecture

### 5.1 Event-driven projection pipeline

```
Core Domain Events (publisher owns event)
       ↓
Projection Handler (Experience or dedicated projector — consumes events)
       ↓
Read Model Store (materialized view — NOT business SoR)
       ↓
Experience Composition API (auth + scope + mask)
       ↓
Portal / Dashboard / Control Tower
```

**Rule:** Experience **does not** call 10+ domain APIs synchronously per screen — **pre-composed read models** + targeted lazy-load for drill-down.

### 5.2 Projection registry

```
ReadModelProjection {
  id, projectionCode           // e.g. OWNER_CONTROL_TOWER
  sourceEvents[]               // domain events subscribed
  sourceDomains[]              // Project, Contract, Trust, Financial, Compliance…
  targetReadModel
  freshnessClass: REALTIME | NEAR_REALTIME | EVENTUAL | SCHEDULED_SNAPSHOT
  freshnessSlaSeconds?
  lastProcessedEventId?
  lastUpdatedAt
  staleFlag?
}
```

### 5.3 Composition pattern

| Pattern | Use when |
|---------|----------|
| **Single projection** | Bank view, Regulator view — one primary read model |
| **Composite view** | Owner Control Tower — merges multiple projections |
| **Lazy drill-down** | Transaction detail — fetch child read model on expand |
| **Proxy traceability** | Golden Chain — delegate to Trust/Compliance/Requirements APIs |

### 5.4 Read models catalog (Experience consumes/builds)

| Read Model | Builder consumes events from | Freshness class |
|------------|------------------------------|-----------------|
| `OwnerControlTowerView` | Project, Contract, Trust, Financial, Compliance | Near-real-time |
| `OwnerFinancialControlReadModel` | Financial, Contract, Trust | Near-real-time |
| `EvidenceStatusReadModel` | Trust | Near-real-time |
| `ComplianceReadView` | Compliance | Eventual |
| `SourcingEventSummary` | Sourcing | Near-real-time |
| `MilestonePaymentStatus` | Contract, Trust, Financial | Near-real-time |
| `ProgramPortfolioView` | Project, Financial | Scheduled snapshot |
| `BankProjectProgressView` | Project, Trust, Financial | Scheduled snapshot |
| `RegulatoryComplianceReadModel` | Compliance, Trust | Eventual |
| `VariationPipelineReadModel` | Contract | Near-real-time |
| `DelayRegisterReadModel` | Contract, Project, Intelligence | Eventual |
| `AlertFeedReadModel` | All domains + Integration + Intelligence | Real-time |
| `IntegrationHealthSlice` | Integration Hub | Near-real-time |

---

## 6. Financial View (Display Only)

### 6.1 OwnerFinancialControlReadModel (ADR-025 B6 — presentation)

```
OwnerFinancialControlReadModel {
  projectId?, contractId?
  asOf, freshnessMeta

  budgetPlanned
  committed                  // awards + contracts
  claimed                    // progress claims
  verified                   // Trust verified %
  approved                   // Contract approved
  reserved                   // PSP reservation (read from Financial)
  paid
  held                       // dispute / partial hold
  disputed
  retention
  remaining                  // contract value - paid - retention - held

  // Experience NEVER recalculates authority — displays Financial SoR values
  sourceRefs { budgetEnvelopeId, commitmentRegisterId, … }
}
```

### 6.2 Financial boundary (locked proposal)

| Experience MAY | Experience MAY NOT |
|--------------|-------------------|
| Display amounts from Financial read APIs | Calculate release amount |
| Show held/disputed/retention status | Create PaymentInstruction |
| Link to Golden Chain "Why Paid?" | Override Financial Policy |
| Mask fields per Bank role | Store authoritative balances |

---

## 7. Evidence / Trust View

```
EvidenceStatusReadModel {
  subjectType, subjectId       // milestone, claim, contract
  packages[] {
    status, completenessPct
    evidenceItems[] { id, type, status, integrityFlag, duplicateFlag }
    verificationStatus       // Trust VerificationDecision ref
    missingRequirements[]
    waiverRefs[]               // Trust EvidenceWaiver — read only
  }
  goldenChainApiRef            // GET /traceability/... — proxy, not copy
}
```

| Display | Source |
|---------|--------|
| Evidence status | Trust projection |
| Verification status | Trust VerificationDecision |
| Missing / rejected | Trust EvidenceRequirement |
| Waivers | Trust EvidenceWaiver + Compliance ComplianceWaiver |
| Integrity alerts | Trust EvidenceTamperDetected events |
| History | Trust audit — immutable chain |

**Golden Chain:** Experience UI calls canonical APIs — ADR-027 why-purchased, ADR-028 why-paid, ADR-030 why-blocked.

---

## 8. Compliance View (Display Only)

```
ComplianceReadView {
  subjectType, subjectId
  jurisdictionCode, legalProfileVersion

  obligations[] {
    category, status           // REQUIRED…EXPIRED…RENEWAL_REQUIRED
    gateSeverity               // BLOCKING | WARNING | INFORMATIONAL
    complianceDecisionRef?     // read only
    ruleVersionRef
    expiryAt?, renewalDueAt?
  }

  gateSummary { blocking, warning, informational, expired, pending }
  regulatoryRiskScore?       // Intelligence — labeled "Signal" not Decision
  freshnessMeta { lastSyncedAt, staleFlag, source }
}
```

Experience **displays** ComplianceDecision — **never** issues it.

---

## 9. Alerts & Risk Model

### 9.1 Five-layer distinction (OAD-031-009 — locked)

| Layer | Definition | Example | Experience role |
|-------|------------|---------|-----------------|
| **Signal** | Raw indicator / domain metric | Schedule variance % | Display |
| **Alert** | Actionable notification | "Compliance BLOCK at mobilization" | Display + route |
| **Recommendation** | AI or system suggestion | "Consider renewal in 14 days" | **Labeled — not decision** |
| **Decision** | Authoritative domain outcome | ComplianceDecision, VerificationDecision | Display ref only |
| **Action** | User/domain command | Approve claim, submit evidence | Route to domain API |

### 9.2 Alert types (catalog)

| Alert code | Source domain | Default severity |
|------------|---------------|------------------|
| `SCHEDULE_DELAY` | Project / Contract | WARNING |
| `COST_VARIANCE` | Project / Financial | WARNING |
| `MISSING_EVIDENCE` | Trust | BLOCKING |
| `COMPLIANCE_BLOCK` | Compliance | BLOCKING |
| `LICENSE_EXPIRING` | Compliance | WARNING |
| `PAYMENT_FAILED` | Financial / Integration | BLOCKING |
| `CONTRACT_VARIATION` | Contract | INFORMATIONAL |
| `DISPUTE_OPENED` | Contract / Financial | WARNING |
| `QUALITY_NCR` | Trust | WARNING |
| `SAFETY_ISSUE` | Trust / Compliance | BLOCKING |
| `INTEGRATION_FAILURE` | Integration Hub | WARNING |

### 9.3 AlertPresentation aggregate

```
AlertPresentation {
  id, alertCode, severity
  sourceDomain, sourceEventId
  subjectType, subjectId
  tenantId, targetUserId?, targetOrgId?
  status: ACTIVE | READ | DISMISSED | SNOOZED | ESCALATED
  linkedDecisionRef?         // if Decision exists — display only
  aiSignalRef?               // if Signal from Intelligence — labeled
  createdAt, expiresAt?
}
```

---

## 10. Freshness Model

Every read model response includes:

```
FreshnessMeta {
  lastUpdatedAt
  sourceDomains[]            // which SoR fed this view
  freshnessClass             // REALTIME | NEAR_REALTIME | EVENTUAL | SCHEDULED_SNAPSHOT
  staleFlag                  // true if SLA exceeded or external unavailable
  staleReason?               // INTEGRATION_DOWN | PROJECTION_LAG | SNAPSHOT_TTL
  nextScheduledRefreshAt?
}
```

### 10.1 Default freshness SLAs (proposal — OAD-031-003)

| Read Model | Freshness class | Default SLA | Stale behavior |
|------------|-----------------|-------------|----------------|
| Owner Control Tower | Near-real-time | 60s projection lag | Show stale badge |
| Financial control | Near-real-time | 60s | Stale badge; no fake recalc |
| Evidence status | Near-real-time | 30s | Stale badge |
| Compliance view | Eventual | 5min / on event | staleFlag from Compliance FreshnessPolicy |
| Schedule snapshot | Scheduled | Daily + on-demand | Show snapshot date |
| Bank/Regulator views | Scheduled snapshot | Daily | Explicit snapshot timestamp |
| Integration health | Near-real-time | 120s | Degraded indicator |

**UI rule:** Financial, Compliance, Schedule widgets **must** show Last Updated + Source + Freshness — never silent stale data.

---

## 11. Security Model

### 11.1 Authorization chain

```
Tenant
  → Organization membership
  → ProjectStakeholder / ContractParty
  → Role + Persona (ADR-019)
  → Permission grants (Identity)
  → DelegationMatrix (Contract/Project)
  → Data Scope resolver
  → Row-level filter + Field-level mask
```

### 11.2 Masking rules

| Stakeholder | Masking |
|-------------|---------|
| **Bank** | No supplier commercial detail beyond financing scope; verified progress only |
| **Regulator** | No unrelated contract values; compliance + permit fields only |
| **Contractor** | Own contract/claim only; no other bidder data |
| **Supplier** | Own PO/delivery; no owner internal budget |
| **PMC** | Full ops; owner-confidential per tenant policy |

### 11.3 ExperienceAuditEntry

Every sensitive view access logged: userId, orgId, readModelCode, scope, timestamp — WORM.

---

## 12. Golden Chain UI/API (Delegation — Not Copy)

Experience **proxies** canonical traceability APIs — **never** duplicates chain data in Experience store.

| Question | Canonical API (owner domain) |
|----------|------------------------------|
| **Why Purchased?** | ADR-027 `GET /api/v1/traceability/golden-chain/why-purchased` |
| **Why Contracted?** | ADR-027 forward + Contract refs |
| **Why Verified?** | ADR-028 `GET /api/v1/trust/traceability/segment` |
| **Why Approved?** | Contract audit + Compliance gate trace |
| **Why Paid?** | ADR-028 `GET /api/v1/traceability/golden-chain/why-paid` |
| **Why Blocked?** | ADR-030 `GET /api/v1/compliance/trace/why-blocked` |

```
Experience Golden Chain UI
       ↓ proxy (auth scope check)
Canonical Traceability API
       ↓
Domain SoR segments composed in response
```

---

## 13. AI / Intelligence Presentation

| Display | Labeling requirement |
|---------|---------------------|
| AI insight / prediction | **"AI Recommendation"** badge |
| Risk score | **"Signal — not decision"** |
| Anomaly | Link to source data; no auto-action |
| Authorized decision | **"Compliance Decision"** / **"Verification Decision"** — domain refs |

> **AI Recommendation ≠ Authorized Decision** — mandatory labeling; recommendations **never** auto-promote to Decision (OAD-031-009).

Intelligence writes to `RecommendationRecord` — Experience reads and displays — **never** promotes to domain decision.

---

## 14. Cross-Domain Integration Map

| Domain | Experience relationship |
|--------|-------------------------|
| **Identity & Access** | Auth context, permission checks |
| **Party Network** | Org/persona display |
| **Project & Program** | Primary navigation hierarchy |
| **Requirements/BOQ** | Package drill-down, why-purchased |
| **Sourcing** | Sourcing panel, award pipeline |
| **Contract** | Milestone, claim, variation, delay views |
| **Trust & Evidence** | Evidence panel, verification status |
| **Financial** | Financial control panel — read only |
| **Compliance** | Compliance panel — read only |
| **Workforce** | Workforce assignment compliance slice |
| **Integration Hub** | Integration health alerts |
| **Intelligence** | Signals/alerts — labeled recommendations |

---

## 15. Domain Events (Experience)

| Event | Payload highlights |
|-------|-------------------|
| `ReadModelProjectionUpdated` | projectionCode, lastUpdatedAt |
| `ReadModelStaleDetected` | readModelCode, reason |
| `OwnerControlViewRefreshed` | projectId, asOf |
| `AlertPresented` | alertId, userId |
| `AlertDismissed` | alertId, userId |
| `DashboardDefinitionPublished` | dashboardId, persona |
| `ExperienceViewAccessed` | readModelCode, scope — audit |
| `GoldenChainViewRequested` | questionType, entityId — audit |

---

## 16. API Boundaries (Design Draft)

### Experience Composition Queries

```
GET  /api/v1/experience/owner/control-tower?portfolioId=&programId=&projectId=
GET  /api/v1/experience/owner/drill-down/{level}/{id}     portfolio|program|project|…|payment
GET  /api/v1/experience/financial/owner-control?projectId=
GET  /api/v1/experience/evidence/status?milestoneId=
GET  /api/v1/experience/compliance/view?projectId=
GET  /api/v1/experience/alerts?scope=
GET  /api/v1/experience/stakeholder/{stakeholderType}/view?projectId=
GET  /api/v1/experience/golden-chain/proxy?question=why-paid&entityId=
GET  /api/v1/experience/freshness?readModelCode=
```

### Experience Configuration (Experience SoR)

```
GET  /api/v1/experience/portal/config?persona=&orgId=
PUT  /api/v1/experience/dashboards/{id}                  Admin — layout only
GET  /api/v1/experience/navigation?persona=
```

### User actions (route to domain — not Experience deciding)

```
POST /api/v1/experience/actions/dispatch               Routes to domain command with auth check
       { domainCommand, payload }                       Experience = router, not authority
```

---

## 17. Multi-Language / RTL (OAD-031-010)

- Presentation strings via i18n keys (ADR-019 pattern) — `ar`, `en`, `ur` minimum
- RTL layout flag per portal config — **presentation only**; domain data locale-neutral
- Numeric/date formatting per user locale — display layer

---

## 18. Scale Scenarios (Villa → Mega Program)

| Scale | Experience behavior | New SoR? |
|-------|---------------------|----------|
| **Villa** | Single project control view; simplified tower | ❌ |
| **Tower** | Multi-phase drill-down; evidence-heavy widgets | ❌ |
| **District** | Program rollup; portfolio executive panel | ❌ |
| **Mega Program** | Portfolio → many programs; aggregated projections; lazy drill-down | ❌ |

Same read models — depth/count/aggregation config via `projectScaleProfileRef`.

---

## 19. Acceptance Tests (Design-Level)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Villa — Owner control tower | ✅ Single project; full drill-down to payment |
| 2 | Tower — phased evidence view | ✅ Milestone-level evidence status |
| 3 | District — program rollup | ✅ ProgramPortfolioView aggregates projects |
| 4 | Mega program — portfolio executive | ✅ Lazy drill-down; no single massive payload |
| 5 | Owner — full financial visibility | ✅ All six layers displayed |
| 6 | PMC — delegated ops view | ✅ Operational actions; owner data not hidden from owner |
| 7 | Contractor — scoped view | ✅ Own contracts only |
| 8 | Supplier — commerce view | ✅ PO/delivery scope |
| 9 | Consultant — verification view | ✅ Assigned verification only |
| 10 | Bank — masked view | ✅ Verified progress; commercial detail masked |
| 11 | Regulator — compliance read model | ✅ Permits/inspections; unrelated costs hidden |
| 12 | Delegation — PMC approve claim | ✅ Action routed to Contract domain |
| 13 | Owner retains visibility when PMC delegated | ✅ Owner sees all; PMC sees delegated scope |
| 14 | Financial masking — Bank | ✅ No raw PaymentInstruction secrets |
| 15 | Compliance block displayed | ✅ BLOCKING badge; links to why-blocked proxy |
| 16 | Evidence failure displayed | ✅ Missing/rejected/tamper from Trust projection |
| 17 | Payment hold displayed | ✅ Held/disputed from Financial — no Experience calc |
| 18 | Dispute — partial hold visible | ✅ Financial read model |
| 19 | Variation pipeline | ✅ Pending/approved from Contract projection |
| 20 | Delay alert | ✅ Signal vs Alert labeled |
| 21 | Golden Chain — Why Paid proxy | ✅ Delegates to ADR-028 API; no copy in Experience |
| 22 | Golden Chain — Why Purchased | ✅ Delegates to ADR-027 API |
| 23 | Golden Chain — Why Blocked | ✅ Delegates to ADR-030 API |
| 24 | AI recommendation displayed | ✅ "AI Recommendation" badge; not decision |
| 25 | Multi-tenant isolation | ✅ Tenant A cannot load Tenant B control tower |
| 26 | Arabic UI labels | ✅ i18n ar keys; RTL flag |
| 27 | English UI labels | ✅ i18n en keys |
| 28 | RTL layout | ✅ Portal config rtl=true |
| 29 | Stale read model — financial | ✅ staleFlag + Last Updated shown |
| 30 | External system unavailable — schedule | ✅ Snapshot date shown; stale badge |
| 31 | Integration failure alert | ✅ Integration health slice |
| 32 | Experience attempts PaymentInstruction | ✅ **REJECTED** — routes to Financial domain only |
| 33 | Experience stores business contract state | ✅ **REJECTED** — projection read only |
| 34 | Six-layer progress — not collapsed | ✅ Claimed ≠ Paid displayed separately |
| 35 | Signal vs Alert vs Recommendation vs Decision | ✅ Five layers distinguished |
| 36 | Experience view access audited | ✅ ExperienceViewAccessed event |
| 37 | Owner emergency — compliance block visible | ✅ BLOCKING shown; no Experience bypass |
| 38 | Compliance LegalProfile version shown | ✅ ruleVersionRef in compliance view |
| 39 | Workforce cert expiry alert | ✅ Compliance renewal alert |
| 40 | Internal management portfolio view | ✅ Cross-project aggregate scoped to tenant |

**Result: 40/40 PASS (design-level — Gate 9)**

---

## 20. OAD-031 Architectural Decisions — ✅ CLOSED (Gate 9)

### OAD-031-001 — Read Model Storage ✅
**Decision:** Dedicated Read Model Store primary; OLTP for simple cases only; Experience never SoR.

### OAD-031-002 — Projection Strategy ✅
**Decision:** Event-driven projections + scheduled reconciliation/snapshots; rebuild/replay from source events mandatory.

### OAD-031-003 — Freshness SLAs ✅
**Decision:** REALTIME · NEAR_REALTIME · EVENTUAL · SNAPSHOT per read model; FreshnessMeta shown especially for financial/compliance views.

### OAD-031-004 — DashboardDefinition ✅
**Decision:** Configurable + versioned; must NOT store business state or business rules.

### OAD-031-005 — Authorization ✅
**Decision:** Six dimensions (Tenant + Org + Project + Contract + Role + Delegation + Data Scope); read scope only — no business authority.

### OAD-031-006 — Owner / PMC ✅
**Decision:** Same domain events; different projections/filters; Owner full read; PMC per DelegationMatrix.

### OAD-031-007 — Financial Masking ✅
**Decision:** Field-level + row-level masking; Financial sole SoR for financial data.

### OAD-031-008 — Notifications ✅
**Decision:** Derived from domain events/signals; no notification creates Award/Approval/Payment/ComplianceDecision.

### OAD-031-009 — Alerts & AI ✅
**Decision:** Signal ≠ Alert ≠ Recommendation ≠ Decision ≠ Action; AI labeled; never auto-becomes Decision.

### OAD-031-010 — History / i18n / RTL / Mobile ✅
**Decision:** Same APIs for snapshots, ar/en/ur, RTL/LTR, all form factors; no separate mobile business logic.

---

## 21. What Experience Is NOT (Reconfirmed)

| Experience is | Experience is NOT |
|---------------|-------------------|
| Presentation + composition layer | Business domain SoR |
| Read-model consumer/builder | Contract/Payment/Compliance authority |
| Golden Chain UI proxy | Traceability data store |
| Alert/notification presentation | Alert business logic owner |
| Dashboard configuration SoR | Project/BOQ/Evidence database |

---

## 22. Consequences

### Positive
- Owner Digital Eye completes ADR-022 D7 vision without duplicating business truth
- Stakeholder views with proper masking (Bank, Regulator, Contractor…)
- Six-layer progress separation visible to Owner
- Golden Chain unified in UI via proxy to canonical APIs
- Event-driven projections avoid N+1 domain calls

### Negative
- Projection infrastructure operational overhead
- Freshness/staleness UX complexity
- Six-dimension auth resolver implementation care

---

## Gate 9 — ✅ CLOSED

| Item | Status |
|------|--------|
| Mandatory Baseline Rules B1–B14 | ✅ Locked |
| Experience Boundary | ✅ Approved |
| Owner Digital Eye + Control Tower | ✅ Approved |
| Read model architecture + replay | ✅ Approved |
| OAD-031-001 → 010 | ✅ Closed |
| Acceptance Tests 40/40 | ✅ Pass (design-level) |

**ADR-031 → FINAL APPROVED / BASELINE**

**Phase 2 Design Spine complete:** ADR-022 → ADR-031 ✅

Phase 3 (Implementation Architecture & Roadmap) — design only; **no implementation until Phase 3 plan approved**

---

## References

- ADR-019 ✅ Persona × Capability × Permission · portal i18n
- ADR-022 ✅ D7 Owner Control · Experience domain #13
- ADR-024 ✅ OwnerControlReadModel · DelegationMatrix · Bank/Regulator views
- ADR-025 ✅ B6 Owner Financial Control Read Model
- ADR-026 ✅ C7 drill-down · stakeholder read models · OAD-026-013
- ADR-027 ✅ Golden Chain / why-purchased
- ADR-028 ✅ Golden Chain / why-paid · evidence status
- ADR-030 ✅ ComplianceReadView · why-blocked · LegalProfile display
- ADR-029 ✅ Integration health slice
- Phase 2 Gate 0 ✅ Read model ownership table · Experience last in implementation order
