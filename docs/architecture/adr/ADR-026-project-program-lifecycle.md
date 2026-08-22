# ADR-026: Project & Program Lifecycle Architecture

## التاريخ
2026-08-22

## آخر تحديث
2026-08-22 — **Gate 4 Final Approval** + Critical Clarifications (C1–C7)

## الحالة
**✅ FINAL APPROVED / BASELINE — Gate 4 CLOSED**

## Phase 2 Rule
ADR-026 closed. ADR-027 in progress (design only). ❌ No coding · ❌ No migrations · ❌ No UI · ❌ No Primavera/BIM/ERP clone

---

## السياق

ABC = **Construction Intelligence + Coordination + Transaction + Evidence + Owner Control Layer**

**ليس:** Primavera · BIM authoring · AutoCAD · ERP · General Ledger · Bank · Regulatory master registry

ADR-026 يحدد **Project & Program** domain — هيكل المشاريع من **Villa → District/Redevelopment Program** مع ربط واضح بـ BOQ، Schedule (external)، Contracts، Procurement، Control views.

**Principle 9 (ADR-022):** ABC is not SoR for everything — integrates with specialized systems.

---

## القرار (Proposal)

اعتماد **Project & Program Lifecycle** مع:

- Hierarchy: **Portfolio → Program → Project → Phase → WBS → Package → Lot**
- **Lean aggregates** + `projectControlProfileRef` (anti God Aggregate)
- **ABC Control View** — planned vs actual, budget, commitments, risk (read/composed)
- **External SoR refs** for CPM schedule, BIM, ERP, GL, regulatory
- Stakeholder bindings via Party Network + project roles (Owner, PMC, Contractor, Consultant, Bank, Regulator)
- Single architecture scales Villa through District Redevelopment

---

## 1. ABC Role — NOT Primavera / NOT BIM SoR

```
┌─────────────────────────────────────────────────────────────┐
│  ABC — Project & Program (Control + Coordination Layer)      │
│    Owns: hierarchy, control snapshots, stakeholder bindings  │
│    Links: BOQ, contracts, sourcing, procurement, evidence   │
└──────────────────────────┬──────────────────────────────────┘
                           │ Integration Hub (sync/read)
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
 Primavera/P6          BIM (Revit/IFC)        ERP / Accounting
 (Schedule SoR)        (Model SoR)            (GL/Finance SoR)
     │                     │                     │
     └─────────────────────┴─────────────────────┘
                           │
                    Bank / Regulatory (external SoR)
```

| System | External SoR for | ABC keeps |
|--------|------------------|-----------|
| **Primavera / MS Project** | Detailed CPM, critical path, resource leveling | `scheduleExternalRef`, sync snapshots, milestone alignment |
| **BIM / Revit / AutoCAD** | Models, drawings, clash detection | `bimElementRefs[]`, drawing refs, quantity takeoff **snapshots** |
| **ERP** | Enterprise resource planning | PO sync refs, material master optional |
| **Accounting / GL** | Ledger, journal entries | Budget/commitment **control view** + export events |
| **Bank** | Loan disbursement, balances | BankProjectReadModel (ADR-024/025) |
| **Regulatory** | Permit registry authority | PermitRef, ComplianceSnapshot |

**We do NOT build Primavera inside ABC.** ABC consumes schedule **read models** and aligns milestones/contracts — does not replace CPM engine.

---

## 2. Hierarchy Model (Universal Scale)

```
Portfolio (optional — developer/government entity level)
  └── Program (e.g. District Redevelopment, Infrastructure Program)
        └── Project (e.g. Tower A, Villa cluster, Road segment)
              └── Phase (e.g. Foundation, Superstructure, Fit-out)
                    └── WBS Node (work breakdown tree)
                          └── Package (procurement/contract boundary — Requirements domain)
                                └── Lot (optional competitive subdivision)
```

### Scale mapping (same model)

| Scale | Example | Program | Projects | Packages |
|-------|---------|---------|----------|----------|
| **Repair** | Small works | — | 1 | 1–5 |
| **Villa** | Single home | — | 1 | 5–15 |
| **Building** | Low-rise block | optional | 1 | 20–50 |
| **Tower** | High-rise | optional | 1 | 50–200 |
| **Complex** | Multi-building campus | 1 | 3–10 | 100+ |
| **District** | Neighborhood redevelopment | 1 | 20–100+ | 1000+ |
| **Redevelopment Program** | Gov mega-program | 1 | many | many |

**Scale codes:** REPAIR | VILLA | BUILDING | TOWER | COMPLEX | DISTRICT | REDEVELOPMENT_PROGRAM

---

## Critical Clarifications (Gate 4 — Baseline Locked)

### C1. BOQ Ownership — No Duplication

| Domain | Owns |
|--------|------|
| **Requirements & BOQ** | BOQ, Specifications, Requirements (SoR) |
| **Project & Program** | Project, Phase, WBS, **refs/links only** to BOQ versions, budget/control |

**Rule:** `Project references BOQ — does NOT create competing BOQ copy.`  
Project holds: `boqVersionRef`, `baselineBoqSnapshotId?` for control — live BOQ edits in Requirements only.

### C2. Package = Commercial / Project-Control Boundary (Not a Domain)

Package is **entity in Requirements domain** — primary link point:

```
Tower → Package (HVAC) → Lot (Chillers) → Sourcing → Award → Contract
  → Milestones → Evidence → Payment → Handover
```

Not a separate bounded context — **boundary concept** spanning Requirements → Sourcing → Contract.

### C3. Budget ≠ Accounting

| ABC Budget Control | ERP/Accounting GL |
|--------------------|-------------------|
| BudgetEnvelope | Official ledger |
| Approved budget | Journal entries |
| Commitments, Forecast, Variance | Source of financial truth |
| Contract value, pending commitments | |

ABC **calculates and tracks control metrics** — GL remains external SoR.

### C4. Project Control ≠ Full PM Software

ABC **does not replace Primavera**. ABC **aggregates operational + commercial truth** from:

Primavera + BIM + BOQ + Procurement + Contracts + Evidence + Financial + Regulatory

→ **Owner Digital Eye** — core ABC value proposition.

### C5. Future Procurement Integration

```
WBS + Package + BOQ + ScheduleSyncSnapshot + Lead Time
  → Future Demand (Requirements)
  → Detect → Recommend → Human Confirm → Sourcing (ADR-023)
```

Example: "In 6 months Package HVAC needs equipment X" — intelligence from linked data.

### C6. Progress Layers (ADR-024/025 Aligned)

**Never collapse to single number:**

| Layer | Source |
|-------|--------|
| Planned Progress | Schedule snapshot + WBS plan |
| Actual Physical Progress | Field / PhysicalProgressSnapshot |
| Claimed Progress | ProgressClaim (Contract) |
| Verified Progress | VerificationDecision (Trust) |
| Approved Progress | Milestone approval (Contract) |
| Paid Amount | PaymentInstruction (Financial) |

### C7. Owner Digital Eye — Full Drill-Down

```
Program → Project → Phase → WBS → Package → Contract → Milestone
  → Evidence → Payment
```

Owner answers: Where are we? Why late? Who responsible? What evidence? Commitment? Paid? What's next?

---

## Stakeholder Read Models (Not Generic Users)

Each external party: **Role + Permission + Read Model + Evidence Scope**

| Party | Read Model | Scope |
|-------|------------|-------|
| **Bank / Lender** | BankProjectReadModel | Budget, commitments, contracts, verified progress, payment requests, risks |
| **Municipality / Regulator** | RegulatoryComplianceReadModel | Permits, drawings, inspections, certificates, safety, evidence, completion |
| **Engineering Council** | EngineeringCouncilReadModel | Engineer qualification, license/registration, project role, required evidence |
| **Civil Defense** | CivilDefenseReadModel | Fire/life safety, approved drawings, inspections, certificates, testing, evidence |

Regulatory **authoritative SoR remains external** unless official integration makes ABC part of submission workflow.

---
| **Building** | Low-rise block | optional | 1 | 20–50 |
| **Tower** | High-rise | optional | 1 | 50–200 |
| **Complex** | Multi-building campus | 1 | 3–10 | 100+ |
| **District** | Neighborhood redevelopment | 1 | 20–100+ | 1000+ |
| **Redevelopment Program** | Gov mega-program | 1 | many | many |

**No separate architecture per scale** — depth + count vary; `projectScaleProfileRef` configures defaults.

---

## 3. Domain Boundary — Ownership Matrix

### Project & Program — Owns (SoR)

| Entity | Responsibility |
|--------|----------------|
| **Portfolio** | Strategic grouping of programs |
| **Program** | Multi-project initiative (district, redevelopment) |
| **Project** | Primary delivery container |
| **Phase** | Lifecycle stage within project |
| **WBSNode** | Work breakdown structure (ABC control tree) |
| **ProjectStakeholder** | Org + role on project (Owner, PMC, Contractor, Consultant, Bank, Regulator) |
| **ProjectControlSettings** | Owner model A/B/C, abcPlatformRole |
| **BudgetEnvelope** | Approved budget **control snapshot** (not GL) |
| **CommitmentRegister** | Committed $ from awards/contracts (computed/register) |
| **ProjectRiskRegister** | Risk items (ABC-owned register; Intelligence assists) |
| **ScheduleSyncSnapshot** | Read-only snapshot from external schedule |
| **ProjectProgressSummary** | Composed planned vs actual (not field SoR) |
| **HandoverStatusRef** | Link to Contract completion (ADR-024) |

### Requirements & BOQ (adjacent — linked)

| Entity | Owner | Link to Project |
|--------|-------|-----------------|
| **BOQ**, **Requirement**, **Package**, **Lot** | Requirements domain | `projectId`, `wbsNodeId`, `phaseId` |

### Does NOT own

| Concern | Owner |
|---------|-------|
| Detailed CPM schedule | Primavera / external |
| BIM models | Revit/BIM server |
| Drawings CAD | External |
| GL / accounting entries | ERP/Accounting |
| Contract terms, Milestones | Contract (ADR-024) |
| Sourcing events | Sourcing (ADR-023) |
| Evidence | Trust |
| Payment | Financial (ADR-025) |
| Organization master | Party Network |

---

## 4. Core Aggregates

### 4.1 Program

```
Program {
  id, code, name, description
  ownerOrgId
  status: PLANNING | ACTIVE | ON_HOLD | COMPLETED | CANCELLED
  portfolioId?
  jurisdictionRef, legalProfileRef?
  plannedStartDate, plannedEndDate
  budgetEnvelopeId?
  projectScaleProfileRef     // DISTRICT | REDEVELOPMENT | ...
  abcPlatformRole
  version
}
```

### 4.2 Project

```
Project {
  id, programId?, code, name
  projectType: VILLA | BUILDING | TOWER | COMPLEX | INFRASTRUCTURE | OTHER
  status: INITIATION | PLANNING | EXECUTION | MONITORING | CLOSING | CLOSED
  ownerOrgId, pmcOrgId?       // Party refs — not embedded
  locationRef, geoBounds?
  plannedStartDate, plannedEndDate, actualStartDate?, actualEndDate?

  // External SoR links (Integration Hub)
  scheduleExternalRef?       // Primavera project ID
  bimProjectRef?
  erpProjectRef?
  accountingProjectRef?

  budgetEnvelopeId
  projectControlSettingsId
  completionPhaseRef?         // link to ADR-024 completion
  version
}
```

### 4.3 Phase

```
Phase {
  id, projectId, code, name, sequence
  status: PLANNED | ACTIVE | COMPLETED
  plannedStartDate, plannedEndDate
  wbsRootNodeId?
}
```

### 4.4 WBSNode

```
WBSNode {
  id, projectId, phaseId?, parentWbsNodeId?
  code, name, level
  plannedQty?, plannedCost?
  // Control view fields (snapshots / rolled up from children)
  actualProgressPct?, earnedValue?    // informational — claim is in Contract
  scheduleActivityRefs[]             // external activity IDs — not SoR
  packageIds[]                       // refs to Requirements Package
}
```

### 4.5 ProjectStakeholder

```
ProjectStakeholder {
  id, projectId OR programId
  organizationId
  role: OWNER | PMC | MAIN_CONTRACTOR | SUBCONTRACTOR | CONSULTANT | ENGINEER
        | SUPPLIER | BANK_LENDER | REGULATOR | INSPECTOR | OTHER
  permissions[]                      // project-scoped — not Persona
  contractPartyRefs[]                // link to Contract parties when contracted
  delegationMatrixRef?               // ADR-024 PMC delegation
  readOnly: boolean                  // Bank, Regulator
}
```

---

## 5. BOQ & Requirements Relationship

```
Project / WBS / Phase
  ↓
Requirements Domain: BOQ (live) → Package → Lot
  ↓ snapshot at sourcing/contract time
SourcingEvent.scopeSnapshot / ContractScope (immutable)
```

| Rule | Detail |
|------|--------|
| R1 | BOQ **master** lives in Requirements — editable until baselined |
| R2 | **Baseline BOQ** event locks version for change control |
| R3 | Package belongs to Requirements — refs `projectId`, optional `wbsNodeId` |
| R4 | Variations (ADR-024) amend contract scope — may trigger BOQ revision workflow |

---

## 6. Schedule Relationship (External — NOT ABC SoR)

```
Primavera (SoR)
  ↓ sync (Integration Hub — scheduled/event)
ScheduleSyncSnapshot {
  projectId, externalScheduleId, syncedAt
  activities[] { externalActivityId, name, plannedStart, plannedEnd, float?, critical? }
  milestones[] { externalActivityId, name, plannedDate }  // alignment hints
}
  ↓
WBSNode.scheduleActivityRefs[]     // link WBS to external activities
Milestone.plannedDates (Contract)  // contractual dates — may differ from CPM
FutureDemandSignal (Requirements)  // fed from schedule snapshot
```

**ABC uses schedule for:** alignment, delay prediction (Intelligence), future procurement — **does not** compute critical path internally.

---

## 7. Project Control Layer (Owner Digital Eye)

### ProjectControlReadModel (composed)

```
Program/Project Control View:
  Hierarchy (Program → Project → Phase → WBS → Package)
  Stakeholders (Owner, PMC, Contractors, Consultants, Bank, Regulator)
  Schedule snapshot vs milestone dates (variance)
  BOQ baseline vs current
  Budget: approved | committed | spent | remaining
  Sourcing: active events | awards pending
  Contracts: active | milestones status rollup
  Progress: planned vs actual vs claimed vs verified
  Evidence: open bundles | verification pending
  Financial: reserved | released | paid | held | disputed | retention
  Risks: open items + AI alerts
  Variations: pending | approved
  Handover / completion phase
  Procurement: PO status rollup
```

**Owner questions (Model A/B/C):** What done? Late? Why? Who responsible? Budget status? Risks? Evidence gaps?

---

## 8. Budget & Commitments (Control — Not GL)

### BudgetEnvelope

```
BudgetEnvelope {
  id, projectId OR programId
  approvedAmount, currency
  categories[] { code, allocatedAmount, spentAmount?, committedAmount? }
  revisionHistory[]                  // controlled revisions
  status: DRAFT | APPROVED | SUPERSEDED
}
```

### CommitmentRegister (event-sourced rollup)

```
CommitmentEntry {
  projectId, sourceType: AWARD | CONTRACT | PO | VARIATION
  sourceId, amount, committedAt
}
```

**Spent** comes from Financial (payments) — **GL remains external** unless integrated.

---

## 9. Progress & Risk

### Progress (separation per ADR-024)

| Layer | Source |
|-------|--------|
| **Planned progress** | Schedule snapshot + WBS plan |
| **Physical progress** | PhysicalProgressSnapshot (Contract) / field updates |
| **Claimed progress** | ProgressClaim (Contract) |
| **Verified progress** | VerificationDecision (Trust) |
| **Financial progress** | Payments / % paid (Financial) |

Project domain **aggregates read view** — does not override Contract/Trust truth.

### ProjectRiskRegister

```
RiskItem {
  projectId, category, description, probability, impact
  ownerStakeholderRef?, mitigationPlan
  status: OPEN | MITIGATED | CLOSED
  aiRiskScore?                     // Intelligence assist — not authoritative
}
```

Intelligence: predictive delay (supplier not delivered → HVAC delay 18 days) → RiskItem or alert.

---

## 10. Cross-Domain Links

```
Project & Program
  ↔ Requirements (BOQ, Package)
  ↔ Sourcing (events by project/package)
  ↔ Procurement (PO by project)
  ↔ Contract (contracts by project)
  ↔ Trust (evidence rollup)
  ↔ Financial (budget vs payment rollup)
  ↔ Compliance (permits, regulatory read)
  ↔ Integration (schedule, BIM, ERP sync)
```

### End-to-end on a Package

```
Project → Package (Requirements) → SourcingEvent → Award
  → Contract → Milestones → Claims → Evidence → Payment
  → Variation → amended scope
  → Handover (project completion status update)
```

---

## 11. Stakeholder Models

| Stakeholder | ProjectStakeholder role | Typical access |
|-------------|-------------------------|----------------|
| **Owner** | OWNER | Full control view; approvals |
| **PMC** | PMC | Delegated ops; Owner visibility retained |
| **Main Contractor** | MAIN_CONTRACTOR | Package/contract scoped |
| **Subcontractors** | SUBCONTRACTOR | Sub-contract scoped |
| **Consultants** | CONSULTANT / ENGINEER | Verify, review, recommend |
| **Bank/Lender** | BANK_LENDER | BankProjectReadModel read-only |
| **Regulator** | REGULATOR | RegulatoryComplianceReadModel read-only |

**Organization ≠ Persona ≠ ProjectStakeholder role** (ADR-022 D1).

---

## 12. Handover & Project Closure

Project **CLOSED** when (policy-driven):

- All contracts COMPLETED or TERMINATED with settlement
- Program-level handover if applicable
- Final completion phases reached (ADR-024)
- Retention/warranty tracking continues — project may be CLOSED with active warranty refs

```
Project.status → CLOSED
Program.status → COMPLETED (when all projects closed)
```

---

## 13. Anti God Aggregate — Project Profiles

```
ProjectControlProfile {
  id, projectType / scale
  defaultPhases[]
  defaultWbsTemplateRef?
  stakeholderRolesRequired[]
  budgetCategoriesTemplate[]
  scheduleSyncRequired: boolean
  bimLinkOptional: boolean
  controlDashboardWidgets[]
}
```

Lean `Project` aggregate + profile — not embedded villa vs tower logic.

---

## 14. Domain Events

| Event | Consumers |
|-------|-----------|
| `ProgramCreated` / `ProgramActivated` | Experience, Compliance |
| `ProjectCreated` / `ProjectStatusChanged` | All domains |
| `PhaseStarted` / `PhaseCompleted` | Notifications, Intelligence |
| `WBSNodeAdded` / `WBSProgressUpdated` | Control views |
| `ProjectStakeholderAssigned` | Access, Notifications |
| `BudgetEnvelopeApproved` | Financial control |
| `CommitmentRecorded` | Budget rollup |
| `ScheduleSyncCompleted` | WBS alignment, Future Demand |
| `BimSyncCompleted` | Quantity snapshot triggers |
| `ProjectRiskIdentified` | Intelligence, Owner alerts |
| `ProjectControlViewRefreshed` | Experience (read model) |
| `ProjectClosed` | Program rollup, Analytics |

---

## 15. API Boundaries (Design Draft)

```
POST   /api/v1/programs
POST   /api/v1/projects
POST   /api/v1/projects/{id}/phases
POST   /api/v1/projects/{id}/wbs-nodes
POST   /api/v1/projects/{id}/stakeholders
POST   /api/v1/projects/{id}/budget-envelopes
GET    /api/v1/projects/{id}/control-view          Owner Digital Eye
GET    /api/v1/programs/{id}/rollup                  Program dashboard
GET    /api/v1/projects/{id}/commitments
POST   /api/v1/integration/schedule/sync             Trigger schedule pull
GET    /api/v1/projects/{id}/schedule-snapshot
GET    /api/v1/projects/{id}/risks
```

Commands route through Project domain services — **no cross-domain Prisma**.

---

## 16. OAD-026 Decision Matrix

| ID | Decision | Recommendation | Reason | Impact | Status |
|----|----------|----------------|--------|--------|--------|
| **OAD-026-001** | Portfolio entity | **Optional top level** — Program sufficient for MVP district | Avoid over-modeling | Portfolio when multi-program owner | ✅ Approved |
| **OAD-026-002** | WBS depth limit | **Profile-based** — no hard platform limit | District needs deep WBS | Performance via pagination | ✅ Approved |
| **OAD-026-003** | Schedule sync direction | **Primavera → ABC** primary; ABC → Primavera milestone export optional | Primavera is SoR | One-way default | ✅ Approved |
| **OAD-026-004** | BIM quantity takeoff | **Snapshot on sync** — not live BIM in ABC | BIM is SoR | Integration event | ✅ Approved |
| **OAD-026-005** | Budget vs GL | **BudgetEnvelope = control; GL = external** | ADR-022 P9 | Export/commitment events | ✅ Approved |
| **OAD-026-006** | Program budget rollup | **Sum of project envelopes + program-level line** | District financing | Aggregated read model | ✅ Approved |
| **OAD-026-007** | Villa simplified profile | **projectScaleProfile=VILLA** — shallow WBS, optional schedule sync | UX simplicity | Same domain | ✅ Approved |
| **OAD-026-008** | Multi-PMC on program | **One PMC per project; program coordinator optional** | Governance | ProgramStakeholder | ✅ Approved |
| **OAD-026-009** | BOQ SoR | **Requirements domain only** — Project refs | No duplication | Mandatory | ✅ Approved |
| **OAD-026-010** | Package boundary | **Commercial control boundary in Requirements** | Not separate domain | Mandatory | ✅ Approved |
| **OAD-026-011** | Progress layers | **Planned ≠ Actual ≠ Claimed ≠ Verified ≠ Paid** | ADR-024/025 | Mandatory | ✅ Approved |
| **OAD-026-012** | Future procurement | **WBS+Package+BOQ+Schedule → Future Demand** | ADR-023 chain | Mandatory | ✅ Approved |
| **OAD-026-013** | Owner drill-down | **Full Program→Payment navigation** | Digital Eye | Mandatory | ✅ Approved |
| **OAD-026-014** | Stakeholder read models | **Role-specific read models + evidence scope** | Bank/Regulator/etc. | Mandatory | ✅ Approved |

---

## 17. Ownership Matrix (Summary)

| Data | ABC SoR | External SoR |
|------|---------|--------------|
| Program/Project/Phase/WBS | ✓ | |
| Package/BOQ master | | Requirements (ABC) |
| CPM schedule detail | | Primavera |
| BIM models | | Revit/BIM |
| CAD drawings | | External |
| Contract/Milestone | | Contract domain |
| Evidence | | Trust |
| Payment | | Financial + PSP |
| GL entries | | ERP/Accounting |
| Permits (authoritative) | | Regulatory |

---

## 18. Acceptance Scenarios

| # | Scenario | Scale | Pass |
|---|----------|-------|:----:|
| 1 | Single villa | VILLA | ✅ |
| 2 | Low-rise building | BUILDING | ✅ |
| 3 | 40-floor tower | TOWER | ✅ |
| 4 | Multi-tower complex | COMPLEX | ✅ |
| 5 | District redevelopment | DISTRICT / Program | ✅ |
| 6 | Government mega-program | PROGRAM | ✅ |
| 7 | Owner + PMC Model B | Any | ✅ |
| 8 | Bank lender read-only | TOWER | ✅ |
| 9 | Regulator inspection view | DISTRICT | ✅ |
| 10 | Primavera schedule sync | TOWER | ✅ |
| 11 | BIM ref on WBS | COMPLEX | ✅ |
| 12 | Package → Sourcing → Contract chain | Any | ✅ |
| 13 | Budget commitment on award | Any | ✅ |
| 14 | Variation impacts project budget | Any | ✅ |
| 15 | Predictive delay alert | TOWER | ✅ |
| 16 | Program rollup dashboard | DISTRICT | ✅ |
| 17 | Project close with active warranty | Any | ✅ |
| 18 | Standalone project (no program) | VILLA | ✅ |
| 19 | ERP project ref sync | Any | ✅ |
| 20 | Owner control view full chain | Any | ✅ |

---

## 19. Consequences

### Positive
- Single hierarchy scales villa to district without Primavera rebuild
- Clear external SoR boundaries
- Owner Digital Eye at project/program level completes control story

### Negative
- Schedule/BIM sync design before integrations exist
- Program rollup queries need read-model investment

### Neutral
- Phase 1 `Project` model shallow — strangler to ADR-026 (like sourcing/contracts)

---

## Gate 4 — CLOSED ✅

ADR-026 **FINAL APPROVED / BASELINE**. Proceed to ADR-027 (design only).

❌ No coding · ❌ No migrations · ❌ No UI · ❌ No Primavera/BIM/ERP/GL/Bank/Regulatory clone

---

## References

- ADR-022 ✅ Principle 9, Owner Control, D7
- ADR-023 ✅ Sourcing by project/package
- ADR-024 ✅ Milestones, completion, stakeholders
- ADR-025 ✅ Financial rollup in control view
- Gate 0 — Package/Lot boundaries
- Phase 1 `Project` model — legacy strangler pending
