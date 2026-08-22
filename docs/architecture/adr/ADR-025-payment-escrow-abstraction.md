# ADR-025: Payment & Protected Payment / Escrow Abstraction

## التاريخ
2026-08-22

## آخر تحديث
2026-08-22 — **Gate 3 Final Approval**

## الحالة
**✅ FINAL APPROVED / BASELINE — Gate 3 CLOSED**

OAD-025-001 → OAD-025-008 ✅ Approved. Amendments only via new ADR.

## Phase 2 Rule
ADR-025 closed. ADR-026 in progress (design only). ❌ No coding · ❌ No migrations · ❌ No UI · ❌ No PSP selection · ❌ No custodial wallet

---

## السياق

سلسلة ABC المعتمدة:

```
Contract → Milestone → Progress Claim → Evidence → Verification → Approval
  → Payment Instruction → Bank / PSP
```

**ADR-024 Gate 2** اعتمد:
- Progress ≠ Payment
- **No Evidence → No Release**
- Trust owns Evidence/Verification
- **Financial owns PaymentInstruction**
- Protected Payment **optional** — ABC **ليس** بنكًا أو custodian

ADR-025 يحدد **Financial & Payment** domain — abstraction layer للدفع المحمي والتعليمات المالية **دون** بناء نظام بنكي أو حفظ أموال داخل ABC.

## Baseline Requirements (Gate 3 — Locked)

### B1. ABC is NOT a Bank or Custodian
ABC: creates instructions, validates gates, links evidence/verification/authorization, tracks status, audit trail, PSP integration.  
ABC **does NOT**: hold client funds, maintain custodial balance SoR.

### B2. Protected Payment = Owner Choice
`STANDARD` or `PROTECTED` per contract — owner selects. Protected: reserve at PSP → release only after verified milestone + approval chain.

### B3. Release Chain (Mandatory)
```
Contract → Milestone → Progress Claim → Evidence → Verification
  → Authorized Approval → Payment Instruction → PSP/Bank → Release
```
**No Evidence → No Verification → No Release.** Invoice or claim alone **insufficient**.

### B4. Partial Release
Disputed portion on Hold; undisputed verified portion may Release (e.g. release 600K, hold 100K of 700K verified).

### B5. Retention Lifecycle
Payment → Retention deduct → Retention Release only per: contract terms, milestone/completion, evidence, approvals, warranty/DLP.

### B6. Owner Financial Control Read Model
Owner sees: total value, reserved, released, paid, held, disputed, retention, remaining, pending verification, pending approval.

### B7. PMC = Delegated Authority
PMC financial powers = delegation with limits + audit — **not** ownership of funds. Owner retains full visibility.

### B8. AI Financial Boundary
AI: anomaly, evidence analysis, qty variance, delay prediction, release **suggest**, duplicate invoice, payment risk.  
AI **cannot**: independent Release — final decision = Policy + Verification + Authorization + Financial controls.

---

اعتماد **Payment & Escrow Abstraction Layer** مع:

- Aggregate roots: **`PaymentInstruction`**, **`PaymentReservation`**, **`PaymentRelease`**, **`PaymentHold`**
- **PSP/Bank adapters** via Integration Hub — ABC emits instructions only
- **Authorization chain** linked to Contract approval + VerificationDecision
- **Segregation of Duties** enforced in Financial domain
- State machines for instruction, reservation, release, hold, refund
- **No custodial balance** in ABC schema as SoR for client funds

---

## 1. Architectural Principle — Protection Chain

```
Contract (MilestoneApproved + approvalRecordRef)
       +
Trust (VerificationDecision = APPROVED)
       +
Financial (AuthorizationPolicy satisfied)
       ↓
PaymentInstruction (created)
       ↓
[If PROTECTED] PaymentReservation → PSP/Escrow Hold
       ↓
PaymentRelease (on verified conditions)
       ↓
PSP/Bank executes transfer
```

### FORBIDDEN

```
ProgressClaim % alone  →  PaymentInstruction   ❌
Contractor assertion   →  Release              ❌
AI recommendation      →  PaymentInstruction   ❌
```

Financial domain **rejects** instruction creation without:
1. `verificationDecisionId` (Trust)
2. `milestoneApprovalRef` or equivalent authorized approval (Contract)
3. Passing `AuthorizationPolicy` + Segregation of Duties

---

## 2. Domain Boundary

### Financial & Payment — Owns (SoR)

| Entity | Responsibility |
|--------|----------------|
| **PaymentInstruction** | Intent to pay — amount, payee, purpose, refs |
| **PaymentAuthorization** | Approval chain record for instruction |
| **PaymentReservation** | Request to hold funds at PSP (Protected mode) |
| **PaymentRelease** | Request to release held/partial amount |
| **PaymentHold** | Dispute / retention / manual hold on amount |
| **Invoice** | Commercial invoice record (existing — repositioned) |
| **RefundInstruction** | Reverse/refund request |
| **ReversalRecord** | Failed/settled reversal audit |
| **FinancialAuditEntry** | Immutable financial action log |
| **PaymentReconciliationRecord** | Match PSP settlement to instructions |

### Does NOT own

| Concern | Owner |
|---------|-------|
| Evidence, VerificationDecision | Trust |
| Contract, Milestone, Claim, Approval | Contract |
| Award, Sourcing | Sourcing |
| Actual bank balance / escrow custody | **PSP/Bank (external SoR)** |
| Payment execution rails | Integration Hub adapters |

### ABC vs Bank/PSP — Responsibility Matrix

| Responsibility | ABC (Financial) | Bank / PSP |
|----------------|-----------------|------------|
| Decide **if** payment should occur | ✓ (policy + verification gate) | |
| Decide **how much** (incl. partial/dispute split) | ✓ | |
| Store instruction & audit trail | ✓ | |
| **Hold custodial funds** | ❌ | ✓ |
| Execute wire/transfer | ❌ (instruct only) | ✓ |
| Regulatory licensing for money custody | ❌ | ✓ |
| Settlement reconciliation source of truth for cash | ❌ (mirror + reconcile) | ✓ |
| Dispute on execution failure | ABC tracks; PSP resolves rail | ✓ |

**ABC = Control + Instruction + Evidence linkage + Audit**  
**PSP = Execution + Custody (when Protected)**

---

## 3. Payment Modes

| Mode | Contract.paymentMode | Financial behavior |
|------|---------------------|-------------------|
| **STANDARD** | STANDARD | PaymentInstruction → payer's process (outside or via PSP notify) |
| **PROTECTED** | PROTECTED | Reservation at PSP → Release after verification milestones |

Protected Payment is **opt-in per contract** — not mandatory platform-wide.

---

## 4. Core Aggregates

### 4.1 PaymentInstruction

```
PaymentInstruction {
  id, instructionNumber
  contractId, milestoneId?, claimId?
  verificationDecisionId      // REQUIRED — No Evidence → No Release
  milestoneApprovalRef        // Contract approval record
  payerOrgId, payeeOrgId

  amount: Money VO
  currency
  paymentMode: STANDARD | PROTECTED

  purpose: MILESTONE | RETENTION_RELEASE | PARTIAL | REFUND | PENALTY | OTHER
  status: DRAFT → PENDING_AUTHORIZATION → AUTHORIZED → SUBMITTED_TO_PSP
        → EXECUTING → COMPLETED | FAILED | CANCELLED | REVERSED

  reservationId?              // if PROTECTED
  holdIds[]                   // dispute/retention holds applied
  netPayableAmount            // amount after holds/retention deduction

  authorizationRecords[]
  pspInstructionRef?          // external ref from Integration
  failureReason?, retryCount?
  version
}
```

### 4.2 PaymentAuthorization

```
PaymentAuthorization {
  id, paymentInstructionId
  authorizerUserId, authorizerOrgId
  role: OWNER | PMC | FINANCE_DELEGATE | SYSTEM_POLICY
  action: APPROVE | REJECT | ESCALATE
  thresholdAmount?, segregationCheckPassed: boolean
  timestamp, auditHash
}
```

**Segregation of Duties:** initiator of claim ≠ sole payment authorizer (configurable per DelegationMatrix + Financial policy).

### 4.3 PaymentReservation (Protected only)

```
PaymentReservation {
  id, paymentInstructionId?, contractId
  amount, currency
  status: REQUESTED → HELD_AT_PSP → PARTIALLY_RELEASED → FULLY_RELEASED | CANCELLED
  pspAccountRef                 // external escrow/sub-account ref — NOT ABC balance
  pspReservationRef             // PSP confirmation ID
  heldAt?, expiresAt?
  releaseSchedule[]             // links to milestones/retention
}
```

ABC stores **reservation status mirror** — PSP is SoR for held funds.

### 4.4 PaymentRelease

```
PaymentRelease {
  id, reservationId?, paymentInstructionId
  releaseAmount
  trigger: VERIFICATION | MILESTONE_APPROVAL | RETENTION_SCHEDULE
        | PARTIAL_DISPUTE_CLEAR | MANUAL_AUTHORIZED
  verificationDecisionId?     // required unless retention policy exception
  status: REQUESTED → AUTHORIZED → SUBMITTED_TO_PSP → COMPLETED | FAILED
  pspReleaseRef?
}
```

### 4.5 PaymentHold

```
PaymentHold {
  id, paymentInstructionId?, reservationId?
  holdAmount
  holdType: DISPUTE | RETENTION | REGULATORY | MANUAL | PARTIAL_DISPUTE
  disputeCaseId?, retentionReleaseId?
  disputedAmount?, undisputedAmount?   // OAD-024-014 partial hold
  status: ACTIVE → RELEASED | EXPIRED | CONVERTED
  authorizedBy?, reason, auditRef
}
```

**Partial dispute example:** Claim 1M, dispute 100K → hold 100K, release instruction for 900K if verified.

---

## 5. State Machines

### 5.1 PaymentInstruction SM

```
DRAFT
  ↓ (validate: verification + approval refs)
PENDING_AUTHORIZATION
  ↓ (SegregationOfDuties + threshold approvers)
AUTHORIZED
  ↓
[PROTECTED] → create Reservation → SUBMITTED_TO_PSP
[STANDARD]  → SUBMITTED_TO_PSP (or COMPLETED if external)
  ↓
EXECUTING
  ↓
COMPLETED | FAILED | CANCELLED | REVERSED
```

### 5.2 PaymentReservation SM (Protected)

```
REQUESTED → SUBMITTED_TO_PSP → HELD_AT_PSP
  → PARTIALLY_RELEASED → FULLY_RELEASED
  → CANCELLED (refund path)
```

### 5.3 PaymentRelease SM

```
REQUESTED → AUTHORIZED → SUBMITTED_TO_PSP → COMPLETED | FAILED
```

Failed release → retry policy or manual reconciliation — **no silent success**.

### 5.4 PaymentHold SM

```
ACTIVE → RELEASED (on dispute resolve / retention conditions)
      → EXPIRED (policy timeout)
      → CONVERTED (to refund/penalty instruction)
```

### 5.5 Refund / Reversal SM

```
REFUND_REQUESTED → AUTHORIZED → SUBMITTED_TO_PSP → COMPLETED | FAILED
REVERSAL_RECORDED (audit — linked to failed EXECUTING)
```

---

## 6. Flows

### 6.1 Standard Milestone Payment

```
MilestoneApproved (Contract) + VerificationDecision APPROVED (Trust)
  ↓
CreatePaymentInstruction (Financial — validates gates)
  ↓
PaymentAuthorization chain (SoD check)
  ↓
SUBMITTED_TO_PSP or marked external-complete
  ↓
FinancialAuditEntry
  ↓
Milestone → PAID (event to Contract)
```

### 6.2 Protected Payment — Reserve then Release

```
Contract activated (paymentMode=PROTECTED)
  ↓
PaymentReservation REQUESTED (contract value or tranche)
  ↓
PSP confirms HELD_AT_PSP (Integration callback)
  ↓
… milestone cycle …
  ↓
PaymentRelease (net amount - retention - dispute hold)
  ↓
PSP executes → COMPLETED
```

### 6.3 Partial Dispute Hold

```
DisputeOpened (disputedAmount=100K, undisputed=900K)
  ↓
PaymentHold ACTIVE (100K)
  ↓
PaymentInstruction for 900K (if verified) — proceeds
  ↓
DisputeResolved → hold RELEASED or REFUND
```

### 6.4 Retention Release

```
RetentionReleaseEligible (Contract event)
  ↓
Evidence requirements satisfied (Trust)
  ↓
PaymentRelease (retention portion) + VerificationDecision
  ↓
PSP release
```

---

## 7. PSP / Bank Integration (Abstraction — No Provider Selected)

### Integration Hub — PaymentProviderAdapter interface (design)

```
IPaymentProviderAdapter {
  createReservation(request) → pspReservationRef
  confirmReservation(ref) → status
  releaseFunds(releaseRequest) → pspReleaseRef
  refund(refundRequest) → pspRefundRef
  getStatus(externalRef) → status
  reconcile(settlementBatch) → reconciliationLines[]
}
```

| Adapter impl (future) | Status |
|-----------------------|--------|
| UAE escrow provider | Not selected — Phase 3+ |
| KSA payment provider | Not selected — Phase 3+ |
| Generic bank API | Not selected — Phase 3+ |

ABC **never** stores `availableBalance` as authoritative — optional **read-only mirror** from PSP for display.

---

## 8. Segregation of Duties & Authorization

| Rule | Enforcement |
|------|-------------|
| SOD-1 | Claim submitter org ≠ sole payment approver |
| SOD-2 | PaymentInstruction creator ≠ final authorizer (above threshold) |
| SOD-3 | Emergency payment requires pre-delegated role + audit (ADR-023) |
| SOD-4 | Hold release requires different role than hold creator (dispute) |
| AUTH-1 | Amount thresholds → multi-sign approval |
| AUTH-2 | PMC delegate limits from DelegationMatrix (ADR-024) |

---

## 9. Financial Audit Trail

Every financial action → **FinancialAuditEntry** (append-only):

```
FinancialAuditEntry {
  id, timestamp, actionType
  paymentInstructionId?, reservationId?, releaseId?, holdId?
  actorUserId, actorOrgId, role
  amount?, currency?
  beforeStatus, afterStatus
  policyRef, verificationDecisionId?, approvalRef?
  pspExternalRef?
  integrityHash, previousHash    // chain optional
}
```

---

## 10. Failure & Reconciliation

### Failure scenarios

| Scenario | ABC behavior |
|----------|--------------|
| PSP timeout | Instruction → FAILED; retry policy; alert |
| Insufficient held funds | Reject release; audit; notify |
| Partial PSP success | ReconciliationRecord; manual or auto retry |
| Duplicate instruction | Idempotency key on instructionNumber |
| Verification revoked after instruction | Block release; hold if not yet executed |

### Reconciliation

```
PaymentReconciliationRecord {
  pspSettlementBatchId
  lines[] { pspRef, instructionId, expectedAmount, actualAmount, status: MATCH | MISMATCH }
  reconciledAt, reconciledBy
}
```

PSP settlement file/API = source for cash truth — ABC matches instructions to settlements.

---

## 11. Relationship to Existing Modules

| Phase 1 module | ADR-025 reposition |
|----------------|-------------------|
| `financial` PaymentReservation/Hold/Release | Evolve to aggregates above |
| `invoicing` Invoice | Stays — linked to PaymentInstruction |
| Quality/Financial Trust (ADR-017) | Trust verifies; Financial pays |

**Strangler:** existing financial trust flows map to new instruction model gradually (OAD-025-005).

---

## 12. Domain Events

| Event | Consumers |
|-------|-----------|
| `PaymentInstructionCreated` | Audit, Experience |
| `PaymentAuthorizationRequired` | Notifications |
| `PaymentInstructionAuthorized` | Integration |
| `PaymentInstructionSubmittedToPsp` | Integration |
| `PaymentInstructionCompleted` | Contract (milestone PAID), Experience |
| `PaymentInstructionFailed` | Alerts, Reconciliation |
| `PaymentReservationHeld` | Contract, Experience |
| `PaymentReleaseRequested` | Integration |
| `PaymentReleaseCompleted` | Contract, Audit |
| `PaymentHoldApplied` | Contract, Dispute |
| `PaymentHoldReleased` | Financial release path |
| `RefundInstructionCreated` | Integration, Audit |
| `PaymentReconciliationCompleted` | Analytics, Compliance |
| `PartialPaymentReleasedDespiteDispute` | Audit (requires policy ref) |

---

## 13. API Boundaries (Design Draft)

### Commands (Financial domain only)

```
POST /api/v1/financial/payment-instructions          Create (internal — from milestone event)
POST /api/v1/financial/payment-instructions/{id}/authorize
POST /api/v1/financial/payment-instructions/{id}/submit-to-psp
POST /api/v1/financial/reservations                    Create reservation (protected)
POST /api/v1/financial/releases                          Request release
POST /api/v1/financial/holds                             Apply hold (dispute/retention)
POST /api/v1/financial/holds/{id}/release
POST /api/v1/financial/refunds                           Create refund instruction
POST /api/v1/financial/reconciliation/run               Admin reconcile batch
```

### Integration callbacks (webhook design)

```
POST /api/v1/integration/psp/reservation-confirmed
POST /api/v1/integration/psp/release-completed
POST /api/v1/integration/psp/payment-failed
POST /api/v1/integration/psp/settlement-batch
```

### Queries

```
GET /api/v1/financial/payment-instructions/{id}
GET /api/v1/contracts/{id}/payment-status
GET /api/v1/financial/audit-trail?contractId=
GET /api/v1/financial/reconciliation/{batchId}
```

**No public API to move money without authorization chain.**

---

## 14. Decision Matrix (OAD-025)

| ID | Decision | Recommendation | Reason | Impact | Status |
|----|----------|----------------|--------|--------|--------|
| **OAD-025-001** | Custodial balance in ABC | **Never — PSP SoR** | Regulatory + ADR-022 D5 | Mirror status only | ✅ Approved |
| **OAD-025-002** | Instruction vs Release split | **Separate aggregates** | Protected mode lifecycle | Clear state machines | ✅ Approved |
| **OAD-025-003** | Idempotency | **instructionNumber + idempotencyKey** | PSP retry safety | Duplicate prevention | ✅ Approved |
| **OAD-025-004** | Multi-currency | **Money VO per ADR-016** + FX ref external | International contracts | Integration FX adapter | ✅ Approved |
| **OAD-025-005** | Legacy financial module | **Strangler** to PaymentInstruction | Coexist Phase 1 | Gradual migration | ✅ Approved |
| **OAD-025-006** | Auto-release tiers | **Policy-only — no AI** | D4 alignment | Rule catalog per milestone type | ✅ Approved |
| **OAD-025-007** | Invoice before instruction | **Invoice optional link** — instruction requires verification not invoice | Supply vs works | Flexible | ✅ Approved |
| **OAD-025-008** | Retention reservation model | **Single reservation + partial releases** (profile may allow tranches) | Cash efficiency | Configurable | ✅ Approved |

---

## 15. Ownership Matrix

| Entity | SoR | Created by | Triggered by |
|--------|-----|------------|--------------|
| PaymentInstruction | Financial | Financial service | MilestoneApproved + Verification |
| PaymentAuthorization | Financial | Authorizer action | Policy threshold |
| PaymentReservation | Financial (status) / PSP (funds) | Financial | PROTECTED contract |
| PaymentRelease | Financial | Financial | Verification + release rules |
| PaymentHold | Financial | Financial/Contract event | Dispute/Retention |
| RefundInstruction | Financial | Authorized user | Failure/cancellation policy |
| VerificationDecision | Trust | Trust | Evidence review |
| MilestoneApproval | Contract | Contract | DelegationMatrix |
| PSP execution state | PSP | PSP | Adapter callbacks |

---

## 16. Acceptance Scenarios

| # | Scenario | Mode | Expected |
|---|----------|------|----------|
| 1 | Milestone verified → standard pay | STANDARD | Instruction → complete |
| 2 | Protected contract → reserve full | PROTECTED | Reservation HELD at PSP |
| 3 | Milestone release partial tranche | PROTECTED | Partial PaymentRelease |
| 4 | Dispute 100K of 1M | PROTECTED | Hold 100K; release 900K |
| 5 | Retention 10% deducted | Both | netPayable = milestone - retention |
| 6 | Retention release at DLP end | PROTECTED | Release with evidence |
| 7 | Verification rejected | Both | **No instruction created** |
| 8 | Claim without approval | Both | **Rejected at Financial gate** |
| 9 | AI suggests pay | Both | **No instruction** until human auth |
| 10 | PSP failure | Both | FAILED + audit + retry |
| 11 | Reconciliation mismatch | Both | ReconciliationRecord MISMATCH |
| 12 | Refund on cancelled contract | PROTECTED | RefundInstruction |
| 13 | Emergency pay (ADR-023) | STANDARD | Pre-delegated auth + audit |
| 14 | PMC delegate within limit | Both | Authorization with delegate role |
| 15 | PMC exceeds delegate limit | Both | Owner counter-sign required |
| 16 | Segregation violation | Both | **Rejected** |
| 17 | Spot supply invoice pay | STANDARD | Instruction linked to invoice optional |
| 18 | Bank read model update | Both | Event → BankProjectReadModel |
| 19 | Multi-milestone one reservation | PROTECTED | Partial releases per milestone |
| 20 | Reversal after duplicate PSP credit | Both | ReversalRecord + refund |

---

## 17. Consequences

### Positive
- Clear ABC vs PSP boundary; No Evidence → No Release enforced in Financial gate
- Protected Payment optional without building a bank
- Partial dispute/retention first-class

### Negative
- Adapter + reconciliation design surface before PSP selection
- Legacy financial module strangler needed

### Neutral
- PSP selection deferred to implementation phase post-approval

---

## Gate 3 — CLOSED ✅

ADR-025 **FINAL APPROVED / BASELINE**. Proceed to ADR-026 (design only).

❌ No coding · ❌ No migrations · ❌ No UI · ❌ No implementation until ADR-026+ approved

---

## References

- ADR-022 ✅ (D5 Protected Payment, No Evidence → No Release)
- ADR-023 ✅ (Emergency payment auth)
- ADR-024 ✅ (Milestone approval, partial dispute, retention, DelegationMatrix)
- ADR-016 Money VOs · ADR-017 Quality/Financial Trust
- OAD-023-008 (bid deposit — related, deferred)
