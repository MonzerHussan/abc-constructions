# ADR-027: Requirements, BOQ & Design Intelligence Architecture

## التاريخ
2026-08-22

## آخر تحديث
2026-08-22 — **Gate 5 Final Approval** + Baseline Principles R1–R8

## الحالة
**✅ FINAL APPROVED / BASELINE — Gate 5 CLOSED**

OAD-027-001 → OAD-027-008 ✅ Approved. Amendments only via new ADR.

## Phase 2 Rule
ADR-027 closed. ❌ No ADR-028 until explicit approval. ❌ No coding · ❌ No migrations · ❌ No UI · ❌ No implementation

---

## السياق

**Golden question ABC must answer:**

> *لماذا اشترينا هذه المادة؟ ومن أين جاءت الكمية والمواصفة؟ ومن وافق عليها؟ وهل تغيرت منذ التصميم الأول؟*

**Requirements & BOQ Domain = SoR** for requirements, specifications, BOQ, packages, lots, quantities.

**ABC is NOT:** AutoCAD · Revit/BIM authoring · Primavera · Specification writing CAD replacement

**ABC IS:** traceability layer from Owner Requirement → Design refs → BOQ → Package → Sourcing → Future Demand — with revision control, snapshots, AI assist, human approval, audit.

---

## القرار (Proposal)

اعتماد **Requirements & BOQ** bounded context مع:

- Aggregates: **`OwnerRequirement`**, **`BOQ`**, **`BOQLine`**, **`Specification`**, **`DesignDocumentRef`**, **`Package`**, **`Lot`**, **`FutureDemandSignal`**
- **Design Intelligence** via cross-cutting AI (extract, compare, clash assist) — not authoring
- **Revision control** + **baseline/snapshot** model for procurement/contract immutability
- **Design-to-procurement traceability** chain
- External refs for BIM/AutoCAD/Revit — Integration Hub sync

---

## Baseline Principles R1–R8 (Gate 5 — Locked)

### R1 — End-to-End Traceability

Every **BOQLine** MUST support full chain query:

```
Requirement → Design/Spec Ref → BOQ Line → Package
  → Sourcing Event → Award → Contract → Milestone → Evidence → Payment
```

Answers golden question: *why bought? qty/spec origin? who approved? changed?*

Implemented via **`TraceabilityRecord`** + **`GET .../why-purchased`** (Golden Question API — R6).

### R2 — Quantity & Measurement (Not Flat Spreadsheet)

Each quantity carries:

| Field | Purpose |
|-------|---------|
| `quantity`, `unit` | Value |
| `measurementBasis` | What is being measured |
| `measurementMethodRef` | COUNT/LENGTH/AREA/VOLUME/… |
| `sourceReference` | Manual / BIM snapshot / OCR / import |
| `calculationMethod` | Formula ref or narrative |
| `revisionNumber` | Line revision |
| `approvalRecordRef` | Who approved qty |
| **`QuantityChangeHistory[]`** | Append-only change log |

```
QuantityChangeHistory {
  boqLineId, previousQty, newQty, reason, changedBy, changedAt
  sourceReference?, approvalRecordRef?
}
```

### R3 — Design Revision Impact (Non-Destructive)

On **DesignRevision ISSUED**:

```
Design Change
  → ImpactAssessment (new — does NOT auto-modify history)
  → affected Specs (suggested/confirmed)
  → affected BOQ Lines
  → affected Packages
  → affected Future Demand signals (flag for review)
  → affected open Sourcing Events (alert — snapshots immutable)
```

Historical snapshots and closed sourcing **never auto-modified** — new revision → ScopeChange workflow → new BOQ version → new snapshot.

### R4 — Baseline Governance

When `projectControlProfile.baselineRequired = true` (policy):

| Action | Guard |
|--------|-------|
| Publish SourcingEvent | Requires `boqSnapshotId` from **BASELINED** BOQ |
| Create Contract from Award | Requires snapshot ref |
| PaymentInstruction | Requires contract linked to snapshot chain |

**Cannot** create Sourcing / Contract / Payment from unapproved live BOQ when policy mandates baseline.

### R5 — AI Governance

| AI MAY | AI MAY NOT (alone) |
|--------|-------------------|
| Extract, Compare, Detect, Suggest, Flag | Approve BOQ |
| Draft lines for human confirm | Change quantity (without human command) |
| Impact assessment suggest | Change specification |
| Future demand recommend | Baseline BOQ |
| | Create commercial commitment (Sourcing/Award) |

### R6 — Golden Question API (First-Class Capability)

Official query — not UI-only:

```
GET /api/v1/requirements/traceability/why-purchased
  ?boqLineId= | sourcingEventId= | contractId= | paymentInstructionId=
```

Returns: `WhyPurchasedResponse` with full chain, approvals, revisions, snapshots, evidence refs, payment refs.

### R7 — External Design Systems

ABC builds: **Integration + Reference + Snapshot + Traceability**  
ABC does NOT build: AutoCAD · Revit · BIM authoring · Primavera CPM

### R8 — No Duplicate SoR (Explicit Rule)

**ABC must not become SoR for data owned by external systems:**

| Data | External SoR |
|------|--------------|
| BIM geometry | BIM / Revit system |
| CPM schedule detail | Primavera |
| General ledger | ERP / Accounting |
| Client funds | Bank / PSP |
| Official regulatory permits | Authority (unless formal integration) |

ABC holds **refs, snapshots, control views, audit** — not authoritative duplicates.

---

## 1. Domain Boundary

### Requirements & BOQ — Owns (SoR)

| Entity | Responsibility |
|--------|----------------|
| **OwnerRequirement** | Original need / brief from owner |
| **Requirement** | Structured requirement tree |
| **Specification** | Technical spec (text + structured fields) |
| **BOQ** | Bill of quantities container (versioned) |
| **BOQLine** | Line item: qty, unit, description, spec link |
| **Measurement** | Quantity rules, measurement method refs |
| **MaterialSpec** | Material/product specification |
| **ApprovedAlternative** | Substitute approved for a line/spec |
| **DesignDocumentRef** | Pointer to drawing/BIM/doc (not the file SoR) |
| **DesignRevision** | Revision metadata + approval state |
| **Package** | Commercial/project-control grouping |
| **Lot** | Subdivision within package for sourcing |
| **BOQSnapshot** | Immutable baseline for sourcing/contract |
| **ScopeChange** | Controlled scope change record |
| **FutureDemandSignal** | Forward procurement signal (ADR-023) |

### Does NOT own

| Concern | Owner |
|---------|-------|
| DWG/RVT/IFC file content | AutoCAD / Revit / BIM server |
| CPM schedule detail | Primavera |
| SourcingEvent, Award | Sourcing |
| Contract, ContractScope snapshot copy | Contract (receives snapshot) |
| Evidence of installation | Trust |
| Project hierarchy shell | Project (refs BOQ version) |
| AI model execution metadata | Intelligence (orchestration) |

---

## 2. Canonical Traceability Chain

```
Owner Requirement
  ↓
Design (external — refs only)
  ↓
Drawing / BIM Element Ref
  ↓
Specification
  ↓
BOQ (versioned)
  ↓
BOQ Line (quantity + measurement)
  ↓
Package → Lot (optional)
  ↓
Sourcing Event (scope snapshot)
  ↓
Future Demand (schedule + lead time)
```

Every **BOQLine** traceable backward to requirement/spec/design ref and forward to sourcing/contract snapshots.

---

## 3. Owner Requirement → Design

```
OwnerRequirement {
  id, projectId?, programId?
  title, narrative, priority
  categoryCode, requestedByOrgId
  status: DRAFT → APPROVED → BASELINED → SUPERSEDED
  linkedRequirementIds[]
  approvalRecordRef?
}
```

**Design** = external process — ABC stores:

```
DesignDocumentRef {
  id, projectId, packageId?
  documentType: DRAWING | BIM_MODEL | SKETCH | CALCULATION | OTHER
  externalRef              // Integration Hub: AutoCAD drawing ID, Revit model GUID
  revisionCode, title
  discipline: ARCH | STRUCT | MEP | CIVIL | …
  sourceSystem: AUTOCAD | REVIT | PDF_UPLOAD | OTHER
  syncStatus, lastSyncedAt
  designRevisionId
}
```

**No CAD/BIM editing in ABC** — upload/register/sync refs only.

---

## 4. BOQ Architecture (SoR)

### BOQ aggregate

```
BOQ {
  id, projectId, packageId?, wbsNodeRef?
  code, title, version, revisionNumber
  status: DRAFT → IN_REVIEW → APPROVED → BASELINED → SUPERSEDED
  currency?, measurementStandardRef?   // e.g. NRM, CSI, local
  baselinedAt?, baselinedBy?
  previousBoqVersionId?                // revision chain
  totalEstimatedValue?
}
```

### BOQLine (R2 enriched)

```
BOQLine {
  id, boqId, lineNumber, code
  description, longDescription?
  quantity, unit
  measurementBasis, measurementMethodRef
  sourceReference: MANUAL | BIM_SNAPSHOT | OCR | IMPORT | CALCULATED
  calculationMethod?, calculationRef?
  revisionNumber
  quantityApprovalRef?
  unitRate?, amount?
  specificationId?, materialSpecId?
  ownerRequirementId?
  designDocumentRefs[], designRevisionIds[]
  approvedAlternativeIds[]
  wbsNodeRef?, packageId?
  status: ACTIVE | SUPERSEDED | ON_HOLD
  traceabilityHash?
}
```

Quantity change history: separate **`QuantityChangeHistory`** append-only entries (R2).

### Baseline rule (ADR-026 C1)

- **Live BOQ** edited in Requirements only
- **Baselined BOQ** → creates **BOQSnapshot** (immutable)
- Sourcing/Contract consume **snapshot** — not live join
- Project domain holds `boqVersionRef` / `baselineBoqSnapshotId` — **no duplicate BOQ**

---

## 5. Specifications & Materials

```
Specification {
  id, code, title, body (structured + rich text ref)
  category, standardRefs[]             // ASTM, BS, local codes
  designDocumentRefs[]
  approvalStatus, approvedBy?
}

MaterialSpec {
  id, productCategoryRef?, manufacturerRef?
  properties[] { key, value, unit }
  complianceCertRefs[]
  approvedAlternativeGroupId?
}

ApprovedAlternative {
  id, groupId, primaryBoqLineId?, substituteSpecId
  reason, approvedBy, effectiveDate
  conditions?
}
```

---

## 6. Package & Lot Formation

**Package** = commercial + project-control boundary (ADR-026 C2) — **entity in this domain**

```
Package {
  id, projectId, wbsNodeRef?, phaseId?
  code, name, discipline
  boqId                              // primary BOQ for package
  status: PLANNED → BOQ_READY → SOURCING → AWARDED → IN_EXECUTION → CLOSED
  budgetCategoryRef?
  sourcingEventIds[]                 // refs — not owned
  contractIds[]                      // refs
}
```

```
Lot {
  id, packageId, code, name
  boqLineIds[]                       // subset of lines for competitive event
  status
}
```

Example: Tower → Package HVAC → Lot Chillers → Sourcing TENDER

---

## 7. Revision Control & Scope Changes

```
DesignRevision {
  id, designDocumentRefId
  revisionCode, changeDescription
  status: PROPOSED → APPROVED → ISSUED
  approvedBy?, issuedAt?
  supersedesRevisionId?
  impactAssessmentRef?               // links to ScopeChange if BOQ affected
}

ScopeChange {
  id, projectId, boqId
  changeType: DESIGN | CLIENT | REGULATORY | VALUE_ENGINEERING | ERROR_CORRECTION
  description, requestedByOrgId
  affectedBoqLineIds[]
  costImpactEstimate?, scheduleImpactDays?
  status: PROPOSED → TECHNICAL_REVIEW → APPROVED → INCORPORATED
  approvalChain[]
  incorporatedInBoqVersionId?
}
```

**Contract variations (ADR-024)** = post-award. **ScopeChange** = pre-award (R3/R4).

### Design Revision Impact Assessment (R3)

```
DesignImpactAssessment {
  id, designRevisionId
  status: DRAFT → REVIEWED → ACKNOWLEDGED
  affectedSpecificationIds[]
  affectedBoqLineIds[]
  affectedPackageIds[]
  affectedFutureDemandSignalIds[]
  openSourcingEventAlerts[]    // refs — snapshots unchanged
  aiSuggestedImpact?           // Intelligence assist
  reviewedBy?, reviewedAt?
}
```

Does **not** auto-edit BOQ — triggers ScopeChange workflow when incorporated.

---

## 8. BOQ Snapshots

```
BOQSnapshot {
  id, boqId, snapshotVersion
  createdAt, createdReason: BASELINE | SOURCING_PUBLISH | CONTRACT_AWARD | VARIATION
  triggeredByEventId?, triggeredByEventType?
  lines[]                             // frozen copy of BOQLine state at moment
  checksum
}
```

| Trigger | Consumer |
|---------|----------|
| BASELINE | Project control reference |
| SOURCING_PUBLISH | SourcingEvent.scopeSnapshot |
| CONTRACT_AWARD | ContractScope |
| VARIATION | Contract amendment delta |

---

## 9. Quantity & Measurement

```
MeasurementDefinition {
  id, code, name
  method: COUNT | LENGTH | AREA | VOLUME | WEIGHT | LUMP_SUM | PERCENTAGE
  unit, roundingRules?, wasteFactorDefault?
  bimQuantityRuleRef?                 // how to pull from BIM snapshot — not live BIM
}
```

Quantity on BOQLine may originate from:
- Manual entry (human)
- BIM sync **snapshot** (Integration)
- OCR/AI extraction (human confirmed)
- Import spreadsheet (validated)

---

## 10. External Design Systems Integration

| System | ABC role | Integration |
|--------|----------|-------------|
| **AutoCAD** | DesignDocumentRef + drawing revision | Integration Hub: file metadata, sheet list |
| **Revit / BIM** | BIM element refs on BOQLine | IFC/GUID sync → quantity snapshot |
| **PDF drawings** | Uploaded ref + OCR | Document store external; OCR → draft BOQ lines |
| **Primavera** | Schedule link for Future Demand | ScheduleSyncSnapshot (ADR-026) |

**BIM clash detection** — assistive via Intelligence reading exported clash reports — **not** Revit-native clash engine in ABC.

---

## 11. Design Intelligence (AI — Assistive)

Per ADR-022 D4 — **human approval required** for BOQ/spec changes affecting procurement.

### AI MAY

| Capability | Output |
|------------|--------|
| OCR / document extraction | Draft BOQ lines — **human confirm** |
| BOQ comparison (versions) | Diff report |
| Spec vs BOQ consistency | Gap/mismatch flags |
| Design revision impact | Suggested affected lines |
| Clash/risk assist | Alert from imported clash report |
| Quantity sanity check | Anomaly flags |
| Material spec extraction | Draft MaterialSpec |
| Future demand detect | Recommend → Human Confirm (ADR-023) |
| Duplicate line detection | Alert |
| Alternative suggestion | Recommend — ApprovedAlternative needs human approve |

### AI MAY NOT

- Approve BOQ baseline independently
- Publish sourcing scope without human
- Modify baselined snapshot
- Author CAD/BIM geometry

### Flow

```
AI Extract / Compare / Recommend
  ↓
RecommendationRecord (Intelligence)
  ↓
Human Review + Approval
  ↓
BOQ / Spec / ScopeChange update (Requirements command)
  ↓
AuditTrail entry
```

---

## 12. Future Procurement (ADR-023 / ADR-026)

```
Package + BOQ lines + ScheduleSyncSnapshot + LeadTimeProfile
  ↓
Intelligence: Detect need (e.g. HVAC equipment in 6 months)
  ↓
Recommend → Human Confirm
  ↓
FutureDemandSignal {
  packageId, boqLineIds[], productRef/categoryRef
  quantity, expectedDateRange, leadTimeEstimate
  visibilityPolicy (D6)
  status: DRAFT → ACTIVE → FULFILLED | TRIGGERED
}
  ↓
ConvertToSourcingEvent (human trigger)
```

---

## 13. Design-to-Procurement Traceability

### TraceabilityRecord (R1 — full chain)

```
TraceabilityRecord {
  boqLineId
  ownerRequirementId?, specificationId?, materialSpecId?
  designDocumentRefs[], designRevisionIds[]
  packageId?, lotId?
  boqSnapshotIds[]
  sourcingEventIds[], awardIds[], contractIds[]
  milestoneIds[], evidenceBundleRefs[], paymentInstructionIds[]
  approvalChain[] { action, actor, timestamp, refType, refId }
  quantityChangeHistoryRefs[]
  scopeChangeIds[], contractVariationIds[]    // "did it change?"
}
```

### WhyPurchasedResponse (R6 — Golden Question API)

```
WhyPurchasedResponse {
  queryRef { type, id }
  summary: { why, qtyOrigin, specOrigin, approvers[], changedSinceDesign: boolean }
  chain: TraceabilityRecord
  revisionDiffSummary?
  evidenceRefs[], paymentRefs[]
}
```

---

## 14. Audit Trail

Append-only **RequirementsAuditEntry** for:
- BOQ line create/edit/delete
- Baseline events
- Snapshot creation
- Spec approval
- Scope change approval
- Alternative approval
- AI recommendation accept/reject

---

## 15. Relationship to Adjacent Domains

| Domain | Relationship |
|--------|--------------|
| **Project** | `projectId`, `wbsNodeRef`, `boqVersionRef` — no BOQ duplicate |
| **Sourcing** | BOQSnapshot → scopeSnapshot; Package → SourcingEvent |
| **Contract** | BOQSnapshot → ContractScope |
| **Trust** | Spec compliance evidence links to MaterialSpec |
| **Intelligence** | OCR, compare, future detect |
| **Integration** | AutoCAD, Revit, OCR pipeline |

---

## 16. Domain Events

| Event | Consumers |
|-------|-----------|
| `OwnerRequirementApproved` | BOQ planning |
| `BOQVersionCreated` / `BOQBaselined` | Project, Audit |
| `BOQSnapshotCreated` | Sourcing, Contract |
| `SpecificationApproved` | BOQ validation |
| `PackageDefined` / `PackageReadyForSourcing` | Sourcing |
| `LotDefined` | Sourcing |
| `ScopeChangeApproved` | BOQ revision, Intelligence |
| `DesignRevisionIssued` | Impact assessment |
| `ApprovedAlternativeAdded` | BOQ lines, Sourcing |
| `FutureDemandSignalCreated` | Sourcing, Suppliers |
| `DesignImpactAssessmentCreated` | BOQ, Package, Sourcing alert |
| `QuantityChanged` | Audit, Traceability |
| `BaselineGovernanceViolationBlocked` | Audit (sourcing/contract rejected) |
| `GoldenQuestionQueried` | Analytics (audit) |
| `AISuggestionAccepted` / `Rejected` | Audit |

---

## 17. API Boundaries (Design Draft)

```
POST   /api/v1/requirements/owner-requirements
POST   /api/v1/requirements/boq
POST   /api/v1/requirements/boq/{id}/lines
POST   /api/v1/requirements/boq/{id}/baseline          Create baseline + snapshot
POST   /api/v1/requirements/boq/{id}/snapshots
POST   /api/v1/requirements/packages
POST   /api/v1/requirements/packages/{id}/lots
POST   /api/v1/requirements/scope-changes
POST   /api/v1/requirements/specifications
POST   /api/v1/requirements/design-refs                  Register external drawing
POST   /api/v1/requirements/future-demand
GET    /api/v1/requirements/traceability/why-purchased     Golden Question API (R6)
       ?boqLineId= | sourcingEventId= | contractId= | paymentInstructionId=
GET    /api/v1/requirements/boq/{id}/traceability/{lineId}
GET    /api/v1/requirements/boq-lines/{id}/quantity-history
GET    /api/v1/requirements/design-revisions/{id}/impact
POST   /api/v1/requirements/design-revisions/{id}/assess-impact
POST   /api/v1/intelligence/boq/suggest                   AI suggest (confirm separate)
POST   /api/v1/intelligence/boq/extract
POST   /api/v1/intelligence/boq/compare
```

**Baseline guard (R4):** Sourcing/Contract commands reject if `baselineRequired` and no valid `boqSnapshotId`.

---

## 18. OAD-027 Decision Matrix

| ID | Decision | Recommendation | Reason | Impact | Status |
|----|----------|----------------|--------|--------|--------|
| **OAD-027-001** | BOQ versioning | **Revision chain + BASELINED status** | Traceability | Snapshot triggers | ✅ Approved |
| **OAD-027-002** | BIM quantity source | **Snapshot on sync event** — not live | BIM is SoR | Integration | ✅ Approved |
| **OAD-027-003** | OCR BOQ import | **AI draft → human approve → lines** | Accuracy | ADR-023 D4 | ✅ Approved |
| **OAD-027-004** | Spec format | **Structured fields + rich text ref** | Search/compare | Flexible | ✅ Approved |
| **OAD-027-005** | Package-BOQ cardinality | **1 primary BOQ per package; lines may cross-ref** | HVAC example | Clear ownership | ✅ Approved |
| **OAD-027-006** | ScopeChange vs Variation | **ScopeChange=pre-award BOQ; Variation=post-award contract** | ADR-024 split | No overlap | ✅ Approved |
| **OAD-027-007** | Measurement standards | **Configurable measurementStandardRef per BOQ** | International | NRM/CSI/local | ✅ Approved |
| **OAD-027-008** | Design doc storage | **External object store + ref in ABC** | Not file SoR | Integration | ✅ Approved |

**Baseline principles R1–R8:** ✅ Approved (Gate 5)

---

## 19. Ownership Matrix

| Entity | SoR | Project refs | Sourcing consumes |
|--------|-----|--------------|-------------------|
| OwnerRequirement | Requirements | projectId | — |
| BOQ / BOQLine | Requirements | boqVersionRef | via Snapshot |
| Specification | Requirements | — | scopeSnapshot |
| Package / Lot | Requirements | wbsNodeRef | packageId |
| BOQSnapshot | Requirements | baselineBoqSnapshotId | scopeSnapshot |
| DesignDocumentRef | Requirements | projectId | — |
| FutureDemandSignal | Requirements | packageId | ConvertToEvent |
| DWG/RVT files | External | — | — |

---

## 20. Acceptance Scenarios (Gate 5 — Expanded)

| # | Scenario | Principle | Pass |
|---|----------|-----------|:----:|
| 1 | Owner requirement → BOQ line traceability | R1 | ✅ |
| 2 | **BOQ revision** — v1→v2 with history | R2 | ✅ |
| 3 | **Design revision impact** — assessment, no auto-edit | R3 | ✅ |
| 4 | **Quantity change** — logged with approval | R2 | ✅ |
| 5 | **Scope change** pre-award incorporated | R3/R4 | ✅ |
| 6 | **Baseline** blocks sourcing without snapshot | R4 | ✅ |
| 7 | **Future procurement** from BOQ+schedule | R1/R5 | ✅ |
| 8 | **Golden Question API** full chain to payment | R6 | ✅ |
| 9 | **AI suggestion + human approval** for OCR lines | R5 | ✅ |
| 10 | Revit quantity snapshot → BOQ line | R7/R8 | ✅ |
| 11 | AutoCAD drawing ref on spec | R7 | ✅ |
| 12 | BOQ baseline → sourcing snapshot | R4 | ✅ |
| 13 | Variation post-award (Contract) ≠ ScopeChange | OAD-006 | ✅ |
| 14 | Approved alternative on line | R1 | ✅ |
| 15 | Package HVAC → Lot Chillers | R1 | ✅ |
| 16 | No duplicate BOQ in Project domain | R8 | ✅ |
| 17 | Contract scope from BOQSnapshot only | R4 | ✅ |
| 18 | Open sourcing unchanged when design rev issued | R3 | ✅ |
| 19 | Villa / Tower scale | — | ✅ |
| 20 | Audit trail on baseline + quantity changes | R2 | ✅ |

---

## 22. Proposed Next ADRs (Do NOT start until approved)

| ADR | Topic | Scope |
|-----|-------|-------|
| **ADR-028** | Trust & Evidence Domain (detail) | Multi-source evidence, verification SM, R9 from ADR-024 |
| **ADR-029** | Integration Hub Architecture | Primavera, BIM, ERP, PSP adapters, sync contracts |
| **ADR-030** | Compliance & Regulatory + LegalProfile runtime | OAD-023-004 implementation design |
| **ADR-031** | Experience / Owner Control Read Models | Compose Program→Payment UI contracts |
| **Phase 3** | Implementation Roadmap ADR | Strangler order across legacy modules |

**Await explicit approval before ADR-028.**

---

## Gate 5 — CLOSED ✅

ADR-027 **FINAL APPROVED / BASELINE**.

❌ No ADR-028 · ❌ No coding · ❌ No migrations · ❌ No UI · ❌ No implementation

---

## References

- ADR-026 ✅ C1 BOQ SoR, C2 Package boundary, C5 Future procurement
- ADR-023 ✅ Future demand flow, snapshots
- ADR-024 ✅ Contract scope from snapshot, ScopeChange vs Variation
- ADR-022 ✅ Principle 9, Intelligence cross-cutting
