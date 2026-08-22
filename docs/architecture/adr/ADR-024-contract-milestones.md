# ADR-024: Contract & Milestones Domain

## التاريخ
2026-08-22

## آخر تحديث
2026-08-22 — **Gate 2 Final Approval**

## الحالة
**✅ FINAL APPROVED / BASELINE — Gate 2 CLOSED**

Core decisions locked — amendments only via new ADR or documented amendment.

Prerequisite: ADR-023 ✅ Approved / Baseline

## Phase 2 Rule
❌ No coding · ❌ No migrations · ❌ No UI · ❌ No implementation · ❌ No ADR-025 until ADR-024 Final Approval

---

## السياق

ADR-023 ينتهي عند **`AwardIssued`**.  
ADR-024 يحدد **Contract & Milestones** — Award → Contract → Milestone → Claim → Evidence → Verification → Payment.

**قواعد ملزمة:**
- **Progress ≠ Payment** (physical progress ≠ claim ≠ payment)
- **No Evidence → No Release**
- **ABC ليست Contract Party تلقائيًا**
- **Owner / PMC / Independent Control Models**
- **Protected Payment** optional — ABC instructs, لا custody

---

## القرار (Proposal — Amended)

- **`Contract`** aggregate root — lean + `contractProfileRef`
- **`Milestone`** — **separate aggregate** (OAD-024-001 ✅)
- **`ProgressClaim`**, **`Variation`**, **`DelayEvent`**, **`DisputeCase`**, completion lifecycle entities
- Evidence / Verification in **Trust** — multi-source (OAD-024-009)
- AI assists verification — **never** final approval or payment (OAD-024-010)
- **DelegationMatrix** + **Owner Digital Eye** read models (OAD-024-011)
- **Bank / Regulatory Read Models** — outside Contract domain (OAD-024-016/017)

---

## 1. ABC Role — Not Automatic Contract Party

| ABC Platform Role | Model |
|-------------------|-------|
| `PLATFORM_ONLY` | Hosting only |
| `OWNER_DIGITAL_CONTROL` | Model A — Owner's Digital Eye |
| `PMC_OPERATING_LAYER` | Model B — PMC through ABC |
| `INDEPENDENT_CONTROL_LAYER` | Model C — + external stakeholders read |

Legal parties = **ContractParties** (Organizations). ABC = digital control layer unless explicit rare config.

---

## 2. Contract Domain Boundary

### Owns (SoR)

Contract · ContractParty · ContractScope · **Milestone** · ProgressClaim · PhysicalProgressSnapshot · Variation · DelayEvent · DefectRecord · RetentionSchedule · RetentionRelease · CompletionPhase · HandoverPackage · PunchList · DisputeCase · TerminationRecord · DelegationMatrix (policy ref)

### Does NOT own

Evidence · VerificationDecision · PaymentInstruction · Organization · BOQ live · Bank balances · Regulatory master registry · AI models

---

## 3. Milestone Architecture (Final — OAD-024-001)

### Decision: Milestone = **Separate Aggregate**

| Aspect | Decision |
|--------|----------|
| **Aggregate** | **`Milestone`** is its own aggregate root — not embedded in Contract |
| **Relationship** | `Milestone.contractId` → Contract (required); optional `packageId`, `parentMilestoneId` |
| **Rationale** | Scales Villa → Tower → District (hundreds of milestones); independent lifecycle; dependency graph |

```
Contract (1) ──► (N) Milestone
                      ├── dependencies[] → other Milestone IDs
                      ├── deliverables[]
                      └── links to Trust evidence requirements
```

### Milestone model (universal — no per-project-type design)

```
Milestone {
  id, contractId, sequence, code, title, description
  categoryCode              // from registry: INSTALL_QTY | FLOOR_COMPLETE | DELIVERY
                            | TEST_COMMISSION | HANDOVER | RETENTION | CUSTOM
  measurementMode: QUANTITY | PERCENTAGE | AMOUNT | DELIVERABLE_COUNT | MILESTONE_BINARY

  // Scope linkage (snapshot refs — not live BOQ)
  deliverables[] { description, specRef?, acceptanceStandard? }
  boqLineSnapshots[] { lineRef, description, qty, unit, unitRate? }
  targetQuantity?, completedQuantity?     // e.g. 100 windows
  targetPercentage?, claimedPercentage?   // e.g. 5th floor = 20% of tower shell
  valueAmount?, currency?                 // monetary milestone

  // Schedule
  plannedStartDate, plannedEndDate, dueDate
  actualStartDate?, actualEndDate?
  dependencies[] { predecessorMilestoneId, dependencyType: FS | SS | FF | SF, lagDays? }

  // Acceptance & evidence (refs to Trust profiles)
  acceptanceCriteriaRef
  evidenceProfileRef

  // Payment linkage (rule only — payment NOT automatic on progress)
  paymentEligible: boolean       // can this milestone trigger payment when verified?
  paymentPercentageOfContract?
  retentionDeductPct?

  status: PLANNED | IN_PROGRESS | DUE | CLAIMED | UNDER_VERIFICATION
        | VERIFIED | APPROVED | PAID | DISPUTED | CLOSED
  version
}
```

### Example mappings (same model)

| Scenario | categoryCode | measurementMode | Example |
|----------|--------------|-----------------|---------|
| 100 windows installed | INSTALL_QTY | QUANTITY | targetQuantity=100 |
| 5th floor complete | FLOOR_COMPLETE | PERCENTAGE | targetPercentage=20 |
| Equipment delivery | DELIVERY | MILESTONE_BINARY | deliverables[] |
| HVAC test & commission | TEST_COMMISSION | DELIVERABLE_COUNT | acceptanceCriteria |
| District package batch | CUSTOM | AMOUNT | valueAmount |

**No special villa/tower/district types** — `contractProfileRef` + milestone templates populate the universal model.

---

## 4. Progress ≠ Payment (OAD-024-008 — Architectural Rule)

### Hard separation

```
Physical Progress (field reality / planned vs actual)
       ↓  (may inform, never triggers payment alone)
Progress Claim (party assertion — "we claim X% complete")
       ↓
Evidence (Trust — multi-source)
       ↓
Verification (Trust — human authorized + AI assist)
       ↓
Approval (Contract — authorized approver per DelegationMatrix)
       ↓
Payment Instruction (Financial — policy gate)
       ↓
Bank / PSP (Integration)
```

### FORBIDDEN path

```
Contractor says 70%  →  Payment   ❌ NEVER
```

### Entities

| Entity | Domain | Meaning |
|--------|--------|---------|
| **PhysicalProgressSnapshot** | Contract (read/update from field) | Planned vs actual qty/%, schedule variance — **informational** |
| **ProgressClaim** | Contract | Formal assertion requesting verification (and optionally payment eligibility) |
| **VerificationDecision** | Trust | Authorized determination that claim is valid |
| **PaymentInstruction** | Financial | Money movement instruction — **only** after verification + approval + policy |

### Invariants

| # | Rule |
|---|------|
| P1 | `ProgressClaim` alone **cannot** emit `PaymentInstruction` |
| P2 | Financial rejects payment without `verificationDecisionId` + `approvalRecordId` |
| P3 | Physical progress % may differ from claimed % — both visible to Owner |
| P4 | Milestone `PAID` status set only after Financial confirms instruction issued |

---

## 5. Progress Claim Flow

```
ProgressClaim {
  id, contractId, milestoneId
  claimantOrgId, claimDate
  claimedQuantity? / claimedPercentage? / claimedAmount?
  physicalProgressSnapshotRef?    // optional link to field data
  narrative, status
  evidenceBundleRef             // Trust
  verificationDecisionRef?      // Trust — required for approval
  approvalRecordRef?            // Contract — who approved
  disputedAmount?               // if partial dispute (OAD-024-014)
}
```

---

## 6. Evidence — Multi-Source Architecture (OAD-024-009)

**Evidence owned by Trust & Evidence domain.** Contract triggers requirements; Trust stores artifacts.

### EvidenceItem types (Trust SoR)

| Source type | Examples |
|-------------|----------|
| `PHOTO` | Site photos |
| `VIDEO` | Progress video |
| `GPS_LOCATION` | Geo-stamped capture |
| `TIMESTAMP` | Trusted time attestation |
| `INSPECTION_REPORT` | Third-party / consultant |
| `DOCUMENT` | PDFs, reports |
| `CERTIFICATE` | Test certs, compliance |
| `QUANTITY_RECORD` | Measured quantities |
| `DELIVERY_RECORD` | GRN, delivery note |
| `SITE_REPORT` | Daily/weekly reports |
| `DRAWING` | As-built, redlines |
| `BIM_REFERENCE` | Model element ref (Integration) |
| `AR_VISUAL` | AR capture session ref |
| `THIRD_PARTY_INSPECTION` | External inspector sign-off |
| `CONSULTANT_APPROVAL` | Engineer approval record |
| `REGULATORY_INSPECTION` | Municipality / civil defense ref |

### Evidence provenance

```
EvidenceItem {
  id, bundleId, type, mimeRef, hash
  capturedAt, capturedByOrgId, capturedByUserId?
  geoLat?, geoLng?, geoAccuracy?
  deviceAttestationRef?
  sourceSystem: UPLOAD | MOBILE_APP | IOT | INTEGRATION | THIRD_PARTY
  integrityHash, tamperSeal?
  linkedMilestoneRef?, linkedClaimRef?
  verificationStatus: PENDING | VERIFIED | REJECTED | FLAGGED
}
```

Contract stores **`evidenceProfileRef`** per milestone — Trust materializes required types. Source verification via hash, attestation, integration sync metadata.

---

## 7. AI in Progress Verification (OAD-024-010)

### AI MAY (Intelligence + Trust assist)

- Analyze photos/video vs scope
- Compare progress to BOQ snapshot
- Match evidence to acceptance criteria
- Detect contradictions, duplicate evidence, tampering indicators
- Compare planned vs actual schedule; predict delay
- Alert Owner / PMC

### AI MAY NOT

- Final **milestone approval**
- Final **verification decision** (authoritative)
- **Payment instruction** or release
- Override DelegationMatrix

### Flow

```
Evidence submitted
  ↓
AI Analysis → RiskScore + Recommendation + AnomalyFlags (Intelligence/Trust read models)
  ↓
Authorized Verifier (Consultant / Owner / PMC per DelegationMatrix)
  ↓
VerificationDecision (Trust — human authoritative)
  ↓
Financial Policy check
  ↓
PaymentInstruction (if approved)
```

---

## 8. Owner Digital Eye (OAD-024-011)

### OwnerControlReadModel (composed — not Contract SoR)

Built from Contract + Milestone + Trust + Financial events:

```
Owner sees at any moment:
  Contract summary
    → Milestones (planned / actual / variance)
    → Physical progress vs claimed progress
    → Evidence bundles + verification status
    → Claims (open / approved / disputed)
    → Payments (paid / pending / held)
    → Remaining commitment (contract value - paid - retention)
    → Delays + causes + responsible party
    → Variations pending/approved
    → Risks + AI alerts
    → Retention status
    → Completion phase
```

**Questions answered:** What done? Not done? Late? Why? Who responsible? Paid? Remaining? Evidence? Risks?

Available to **Owner in all Models A/B/C** — PMC delegation does not hide Owner visibility.

---

## 9. PMC Delegation Matrix (OAD-024-011 / OAD-024-004)

**Delegation ≠ ownership transfer.** Owner retains full read; PMC acts within matrix.

```
DelegationMatrix {
  contractId OR projectId OR orgPolicyRef
  grants[] {
    action: CREATE_CLAIM | VERIFY_PROGRESS | APPROVE_MILESTONE | PAYMENT_APPROVAL
          | RELEASE_INSTRUCTION | PROPOSE_VARIATION | APPROVE_VARIATION | RECORD_DELAY
    allowedRoles: OWNER | PMC | CONSULTANT | CONTRACTOR
    conditions: { maxAmount?, milestoneTypes?, requiresOwnerCounterSign? }
  }
}
```

### Default matrix (configurable)

| Action | Owner | PMC | Consultant | Contractor | ABC |
|--------|:-----:|:---:|:----------:|:----------:|:---:|
| Create Claim | ✓ | ✓ | | ✓ | platform |
| Verify Progress | ✓ | ✓ | ✓* | | |
| Approve Milestone | ✓ | ✓* | ✓* | | |
| Payment Approval | ✓ | delegated* | | | |
| Release Instruction | ✓ | delegated* | | | |
| Propose Variation | ✓ | ✓ | recommend | request | |
| Approve Variation | ✓ | delegated* | ✓* | | |

\* Per DelegationMatrix policy — not automatic.

---

## 10. Variation / Change Order (OAD-024-012)

```
Original Scope (ContractScope snapshot)
  ↓
VariationRequest {
  reason, description, requestedByOrgId
  scopeDelta, costImpact, scheduleImpactDays
  status: DRAFT → SUBMITTED → TECHNICAL_REVIEW → COMMERCIAL_REVIEW
        → PENDING_APPROVAL → APPROVED → REJECTED
  technicalReviewRef?, commercialReviewRef?
  approvedBy[], effectiveDate
  contractAmendmentRef    // creates amended scope snapshot + milestone impacts
}
  ↓
Contract Amendment (new scope snapshot version + milestone add/modify)
```

### AI assist (alert only)

- Variation similar to original BOQ item → flag duplicate scope
- Repeated variations from same contractor → pattern alert
- Abnormal cost escalation → anomaly alert

---

## 11. Delay Management (OAD-024-013)

### DelayEvent (expanded — not minimal DelayRecord)

```
DelayEvent {
  id, contractId, milestoneId?
  plannedDate, actualDate?, delayDays
  cause, causeCategory: WEATHER | SUPPLIER | OWNER | DESIGN | LABOR | REGULATORY | OTHER
  responsiblePartyRef?
  excusable: boolean          // Excusable vs Non-Excusable
  costImpact?, scheduleImpactDays?
  evidenceRefs[]             // Trust
  noticeDate?, noticeRef?
  status: IDENTIFIED → NOTICE_SENT → UNDER_REVIEW → APPROVED | REJECTED
  penaltyApplied?, extensionGrantedDays?
  linkedVariationId?
}
```

### Predictive Delay Intelligence (Intelligence — read)

```
AI monitors: supplier delivery status, milestone dependencies, schedule, inventory
  → DelayRiskAlert { milestoneId, predictedDelayDays, confidence, reason }
  → Owner/PMC notified BEFORE delay occurs

Example: "Supplier not delivered — HVAC likely delayed ~18 days"
```

Predictive alerts **do not** auto-modify contract — human accepts/rejects delay notice.

---

## 12. Retention (OAD-024-005 — Final)

```
RetentionSchedule {
  contractId
  retentionPct                 // e.g. 5-10%
  retentionCapAmount?          // ceiling
  holdFromMilestoneType?       // when retention starts deducting

  releases[] {
    trigger: SUBSTANTIAL_COMPLETION | FINAL_COMPLETION | DEFECTS_PERIOD_END | CUSTOM_MILESTONE
    releasePctOfRetention      // partial release supported
    evidenceProfileRef         // evidence required for release
    status: PENDING | ELIGIBLE | RELEASED | HELD
  }

  defectsLiabilityPeriodDays
  partialReleaseRules[]
  finalReleaseMilestoneId?
}
```

Retention is **lifecycle-managed** — not a static contract field.

---

## 13. Dispute & Partial Payment Hold (OAD-024-014)

```
DisputeCase {
  contractId, relatedClaimId?, relatedMilestoneId?
  totalClaimedAmount
  disputedAmount              // e.g. AED 100,000 of 1,000,000
  undisputedAmount            // computed: total - disputed
  disputedLineItems[]?
  holdPolicy: FULL | PARTIAL | NONE
  status: OPEN → … → RESOLVED
}
```

### Rule

| Situation | Behavior |
|-----------|----------|
| Claim AED 1M, dispute AED 100K | **Undisputed AED 900K** may proceed if verified + approved |
| Disputed portion | **Partial hold** on disputed amount only |
| Policy + authorization + audit | Required for any hold override |

Financial: `PaymentInstruction` may be **split** — undisputed released, disputed held.

---

## 14. Completion & Handover Lifecycle (OAD-024-015)

**Project 100% ≠ Completed.** Distinct phases:

```
SUBSTANTIAL_COMPLETION
  ↓
PUNCH_LIST (items[] — Contract owns PunchList entity)
  ↓
RECTIFICATION (linked defects/milestones)
  ↓
TESTING_AND_COMMISSIONING (milestones type TEST_COMMISSION)
  ↓
REGULATORY_APPROVALS (Compliance refs — not SoR)
  ↓
FINAL_COMPLETION
  ↓
HANDOVER
  ↓
WARRANTY / DEFECTS_LIABILITY_PERIOD
```

### HandoverPackage contents

As-built · O&M manuals · Certificates · Warranties · Inspection records · Test results · Regulatory approval refs · Asset information (Integration/BIM refs)

### CompletionPhase entity

```
CompletionPhase {
  contractId, phase: SUBSTANTIAL | FINAL | WARRANTY
  status, targetDate, achievedDate?
  evidenceProfileRef, regulatoryRefs[]
}
```

---

## 15. Multi-Party Project Scale

| Scale | Parties | Milestones | Architecture |
|-------|---------|------------|--------------|
| **Villa** | Owner → Contractor | ~10–30 | 1 Contract, Milestone aggregate |
| **Tower** | Owner → Main → Subs → Suppliers | ~100–500 | Main + SUBCONTRACTs, package-linked milestones |
| **District** | Gov/Developer → PMC → many contractors | ~1000+ | Program → many Contracts → Milestone per package; same aggregate model |

**Same Milestone aggregate** — scale via count + templates, not different design.

---

## 16. Bank Read Model (OAD-024-016)

**Not part of Contract domain.** Built by Experience/Integration from events.

```
BankProjectReadModel {
  projectId, contractIds[]        // filtered by bank financing agreement
  contractValue, approvedBudget, committedAmount
  paidToDate, remaining, retentionHeld
  verifiedProgressPct
  upcomingMilestones[]
  pendingPaymentRequests[]
  riskIndicators[]               // Intelligence summaries
}
```

Bank org = read permission via Integration — **not** ContractParty unless explicitly in financing agreement.

---

## 17. Regulatory Read Model (OAD-024-017)

```
RegulatoryComplianceReadModel {
  projectId, jurisdictionRef
  visiblePerRegulatorRole: {
    approvedDrawings[], permits[], inspections[]
    progressEvidence[], certificates[], safetyEvidence[]
    completionStatus, handoverStatus
  }
}
```

ABC **not authoritative regulatory system** unless official integration — stores refs + snapshots (ADR-022 Principle 9).

---

## 18. International Contracts

`contractProfileRef` includes:

| Field | Source |
|-------|--------|
| `jurisdictionCode` | LegalProfile (Compliance) |
| `currency`, `taxProfileRef` | Contract |
| `paymentTermsRef` | Contract profile |
| `applicableLawRef`, `disputeMechanismRef` | LegalProfile |
| `digitalSignaturePolicyRef` | Integration + LegalProfile |
| `importRequirementsRef` | LegalProfile (import rules) |
| `regulatoryRequirementsRef[]` | Compliance |

**No UAE-only hard-code** — profile + LegalProfile per jurisdiction.

---

## 19. Contract Aggregate (lean)

Contract + `contractProfileRef` — types registry unchanged (MAIN, SUBCONTRACT, SUPPLY, TURNKEY, PMC, SPOT, …).

PaymentMode: STANDARD | PROTECTED (optional — ADR-025).

---

## 20. Domain Events (amended)

`MilestoneDefined` · `MilestoneStatusChanged` · `PhysicalProgressRecorded` · `ProgressClaimSubmitted` · `VerificationCompleted` · `MilestoneApproved` · `VariationSubmitted` · `VariationApproved` · `ContractAmended` · `DelayIdentified` · `DelayRiskPredicted` · `RetentionReleaseEligible` · `DisputeOpened` · `PartialPaymentHoldApplied` · `CompletionPhaseReached` · `HandoverSubmitted` · `PunchListItemClosed` · `ContractCompleted`

---

## 21. API Boundary (amended additions)

```
GET  /api/v1/contracts/{id}/owner-control-view
GET  /api/v1/contracts/{id}/milestones/{mid}/dependencies
GET  /api/v1/projects/{id}/bank-read-model          (bank auth)
GET  /api/v1/projects/{id}/regulatory-read-model    (regulator auth)
POST /api/v1/contracts/{id}/milestones/{mid}/physical-progress
POST /api/v1/contracts/{id}/variations/{vid}/technical-review
POST /api/v1/contracts/{id}/retention/release-request
POST /api/v1/disputes/{id}/partial-hold
```

---

## 22. OAD-024 Decision Matrix (001–017)

| ID | Decision | Recommendation | Reason | Impact | Status |
|----|----------|----------------|--------|--------|--------|
| **001** | Milestone aggregate | **Separate aggregate** with contractId | Scale villa→district; rich model | Independent milestone APIs | ✅ Approved |
| **002** | Digital signature | **Integration Hub adapter** — status only | Not PKI owner | External sign providers | ✅ Approved |
| **003** | Partial milestone pay | **Split milestones** — no pay without verification split | Progress≠Payment | More milestones, clearer audit | ✅ Approved |
| **004** | PMC delegation | **DelegationMatrix policy** per contract/project | Owner visibility retained | Configurable governance | ✅ Approved |
| **005** | Retention release | **RetentionSchedule.releases[]** lifecycle + evidence gates | Not static field | Partial/final release | ✅ Approved |
| **006** | Dispute hold | **Partial hold** — disputed vs undisputed | Fair payment flow | Financial split instructions | ✅ Approved |
| **007** | Legacy migration | **Strangler** — adapters, no big bang | Zero downtime | Phase 1 coexists | ✅ Approved |
| **008** | Progress≠Payment | **Hard architectural separation** + invariants P1–P4 | Core ABC principle | Financial gate enforcement | ✅ Approved |
| **009** | Multi-source evidence | **Trust EvidenceItem types** + provenance | Beyond upload | Trust domain expanded | ✅ Approved |
| **010** | AI verification | **AI assist → Authorized Verification → Payment** | No AI final authority | Aligns ADR-022 D4 | ✅ Approved |
| **011** | Owner Digital Eye | **OwnerControlReadModel** + DelegationMatrix | Model A/B/C real | Experience/control API | ✅ Approved |
| **012** | Variation governance | **Full CO workflow** + Contract Amendment | Scope control | AI alert only | ✅ Approved |
| **013** | Predictive delay | **DelayEvent + DelayRiskAlert** (Intelligence) | Early warning | Proactive control | ✅ Approved |
| **014** | Partial dispute hold | **disputedAmount / undisputedAmount** split | No full stop on partial dispute | Financial partial release | ✅ Approved |
| **015** | Completion lifecycle | **CompletionPhase** + PunchList + Handover | 100%≠Complete | Clear handover | ✅ Approved |
| **016** | Bank view | **BankProjectReadModel** outside Contract | Bank not in domain | Integration read API | ✅ Approved |
| **017** | Regulatory view | **RegulatoryComplianceReadModel** outside Contract | Not authoritative SoR | Filtered read | ✅ Approved |

---

## 23. Acceptance-Test Matrix (24 scenarios)

| # | Scenario | Pass | Key elements |
|---|----------|:----:|--------------|
| 1 | Villa construction | ✅ | 1 contract, ~20 milestones |
| 2 | Tower construction | ✅ | Main + subs, floor milestones |
| 3 | District redevelopment | ✅ | 1000+ milestones, program scale |
| 4 | Renovation | ✅ | SPOT/SERVICE contract |
| 5 | Small repair | ✅ | Single milestone SPOT |
| 6 | Supply contract | ✅ | DELIVERY milestones |
| 7 | Subcontract | ✅ | SUBCONTRACT type |
| 8 | Equipment rental | ✅ | RENTAL periodic milestones |
| 9 | Transport | ✅ | pickup/delivery milestones |
| 10 | Consultancy | ✅ | deliverable milestones |
| 11 | PMC | ✅ | PMC_CONTRACT + delegation |
| 12 | Turnkey | ✅ | TURNKEY profile |
| 13 | Variation | ✅ | CO workflow + amendment |
| 14 | Delay | ✅ | DelayEvent + predictive alert |
| 15 | Defect | ✅ | DefectRecord + warranty |
| 16 | Dispute | ✅ | partial hold |
| 17 | Retention | ✅ | partial + final release |
| 18 | Partial payment | ✅ | undisputed 900K released |
| 19 | Final completion | ✅ | phase lifecycle |
| 20 | Handover | ✅ | HandoverPackage |
| 21 | Warranty | ✅ | defects liability period |
| 22 | Bank financing | ✅ | BankReadModel |
| 23 | Regulatory inspection | ✅ | RegulatoryReadModel |
| 24 | Owner + PMC + ABC | ✅ | DelegationMatrix + Owner view |
| 25 | International contract | ✅ | jurisdiction profile |

---

## 24. ADR-023 / ADR-025 Alignment

| Chain step | Domain |
|------------|--------|
| Award | ADR-023 Sourcing |
| Contract → Milestone → Claim | ADR-024 |
| Evidence → Verification | Trust (ADR-017 extended) |
| Payment Instruction | Financial (ADR-025 deferred) |
| Bank/PSP | Integration |

**No conflict:** Sourcing ends at Award; Contract never releases payment; Protected Payment optional on Contract.

---

## Gate 2 — CLOSED ✅

ADR-024 **FINAL APPROVED / BASELINE**. Proceed to ADR-025 (design only).

❌ No coding · ❌ No migrations · ❌ No UI · ❌ No ADR-026 until ADR-025 approved

---

## References

- ADR-022 ✅ · ADR-023 ✅ · ADR-012 · ADR-016 · ADR-017
