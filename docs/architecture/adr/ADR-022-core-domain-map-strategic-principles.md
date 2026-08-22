# ADR-022: Core Domain Map & Strategic Architectural Principles

## التاريخ
2026-08-22

## آخر تحديث
2026-08-22 — Decision Approval (D1–D8 + Principle 9)

## الحالة
**معتمد — جاهز لـ Phase 2 (Detailed Domain & Sourcing Architecture Design)**  
*لا coding / migrations / UI / implementation حتى إكمال Phase 2 design ADRs.*

---

## السياق

ABC = **Construction Intelligence & Transaction Ecosystem**

مبدأ التطوير: **Domains First → Architecture → Approval → Implementation**

Phase 1 Assessment معتمد. هذا ADR يثبت المبادئ الاستراتيجية والقرارات المعمارية D1–D8 قبل Phase 2.

---

## الرؤية: ABC ليست «دورة مشروع» فقط

ABC أربعة أدوار **متداخلة**:

```
                        ABC
                         │
      ┌──────────────────┼──────────────────┐
      │                  │                  │
   MARKET           PROJECT            TRUST
                      CONTROL           LAYER
      │                  │                  │
  Buy/Sell           Execution         Evidence
  Sourcing           Monitoring        Verification
  Auction            Progress          Payment rules
  RFQ/RFP            Quality           Compliance
  Supplier           Cost              Risk
  matching           Procurement

              ═══════════════════════════════
                    INTELLIGENCE
              (Cross-Domain Layer — ليس domain منفصل)
              Classification · Matching · Forecasting
              OCR · Price · Risk · Progress verification
```

| Role | المعنى |
|------|--------|
| **MARKET** | سوق — Unified Sourcing Engine + Commerce (Buyer/Seller/Both) |
| **PROJECT CONTROL** | تشغيل ورقابة — Owner Digital Eye عبر ABC |
| **TRUST LAYER** | Evidence → Verification → Payment Instruction |
| **INTELLIGENCE** | ذكاء عابر — Verify/Recommend، لا سلطة مالية مستقلة |

---

## المبادئ المعمارية (ملزمة)

### 1. Owner Control Layer — «عين المالك» ✅ D7

ABC **Digital Control & Transparency Layer for the Owner** — ليس PM tool فقط.

| النموذج | الوصف |
|---------|--------|
| **A — Owner + ABC** | المالك يراقب عبر ABC: وقت، تكلفة، مشتريات، مقاولين، موردين، جودة، إنجاز، مخاطر، مستندات، دفعات |
| **B — Owner + PMC + ABC** | PMC تعمل **through ABC**؛ ABC = نظام التشغيل والرقابة |
| **C — Owner + PMC/Consultant + ABC + External Stakeholders** | ABC = طبقة رقابة رقمية مستقلة مع stakeholders خارجيين (auditors, regulators read-only) |

**في جميع النماذج:**
- ABC = Owner's Digital Control & Transparency Layer
- المسؤوليات القانونية والتعاقدية تبقى لدى الأطراف المختصة
- Portal ≠ Control — Control views/APIs منفصلة عن Experience layer

---

### 2. Verified Progress → Payment («No Evidence → No Release»)

```
Contract Milestone → Progress Claim → Evidence → Verification → Approval?
   NO → Hold          YES → Payment Instruction → Financial Institution
```

**Payment follows verified progress** — لا contractor-reported progress كحقيقة نهائية.

---

### 3. Protected Payment — Optional، ABC ليست بنكًا ✅ D5

| Mode | الوصف |
|------|--------|
| **Standard Payment** | دفع حسب العقد — خارج ABC أو عبر تعليمات فقط |
| **Protected Payment** | حجز/تخصيص؛ release بعد verified conditions |

**ABC = Control + Evidence + Verification + Payment Instruction** — **ليس** custodian للأموال.

**D5 — Deferred:** لا PSP/Escrow provider في هذه المرحلة.  
**Payment/Escrow Abstraction Layer** يسمح بالتكامل لاحقًا مع البنوك ومزودي الدفع المرخصين حسب الدولة.

---

### 4. Universal Commerce — ليس «Scrap Module»

أي eligible party (Persona + Permission) = **Buyer | Seller | Both**

Scrap / Surplus / Rental / Transport = **Event Types / Listing Types** — ليس bounded contexts منفصلة.

---

### 5. Unified Sourcing Engine ✅ D2 + D3

**قرار معتمد:** Unified Sourcing/Commercial **Event Model** — **Unified model ≠ Unified workflow**.

أولوية Phase 2 = **Unified Sourcing Engine** (ليس Tender Hub vs Auction كأولويتين منفصلتين).

Tender و Auction و RFQ = **capabilities / event types** داخل المحرك الموحّد.

**Event Types (مستقبلية — extensible):**

| Category | Event Types |
|----------|-------------|
| Competitive | Tender, RFQ, RFP, Auction, Reverse Auction |
| Direct | Direct Purchase, Service Request |
| Asset / Capacity | Rental, Transport, Scrap Sale, Surplus Sale |
| Forward | Future Offer, Reserve Stock |

كل type له **workflow rules** خاصة — shared infrastructure فقط (participants, offers, awards, audit).

---

### 6. Future Procurement ✅ D6

```
Project Schedule + BOQ + Lead Time + Supplier Capacity → Future Demand Signal
```

**Visibility — Permission/Policy controlled:**

| Level | الوصف |
|-------|--------|
| **Public** | إشارات عامة غير حساسة |
| **Qualified Suppliers** | موردون معتمدون في الفئة |
| **Invited Suppliers** | مدعوون لحدث/مشروع محدد |
| **Project Participants** | أطراف المشروع فقط |
| **Internal** | Owner/PMC/internal roles |

حماية البيانات التجارية الحساسة إلزامية.

---

### 7. AI — Cross-Domain Intelligence ✅ D4

AI **طبقة عابرة** — **ليس** domain #12.

**AI يستطيع:** Verify (assist), Analyze, Detect anomalies, Calculate risk, Recommend

**AI لا يملك:** سلطة نهائية غير مقيدة للإفراج عن الأموال.

Payment release يخضع لـ:
**Contract + Policy + Evidence + Authorized Approval + Financial Institution/Payment Layer**

يمكن لاحقًا أتمتة حالات مسموح بها وفق **قواعد وصلاحيات واضحة** — دون منح AI سلطة مالية مستقلة.

---

### 8. Construction Workforce & Training — scoped

Employment + Training **لقطاع الإنشاءات والقطاعات المصاحبة فقط** — ليس general job marketplace.

Workforce → Skills → Training → Certification → Employment

---

### 9. ABC Is Not the System of Record for Everything ✅ NEW

ABC = **Intelligence + Coordination + Transaction + Evidence + Control Layer**

**لا** تحاول إعادة بناء كل نظام متخصص داخلها.

| ABC owns (SoR) | External SoR — Integration only |
|----------------|----------------------------------|
| Sourcing events, offers, awards | BIM models (Revit/AutoCAD) |
| Evidence, verification decisions | Detailed scheduling (Primavera) |
| Payment instructions (not funds) | General ledger / Accounting |
| Project control read-models | Bank balances / Escrow custody |
| Audit trail, compliance snapshots | Regulatory master data |

**Integration Hub** = anti-corruption layers + sync contracts — **لا** duplicate specialized domain logic.

---

## D1 — PMC Model ✅

**Approved with clarification:**

- **PMC = Organization** في ABC (legal entity registered on platform)
- **PMC = Contract Party** عند وجود عقد يربطها بالمشروع

**فصل صارم — لا خلط:**

```
Organization ≠ Persona ≠ Role ≠ Capability ≠ Contract Party ≠ Permission
```

| Concept | Meaning |
|---------|---------|
| **Organization** | كيان قانوني (Owner, PMC, Contractor, Supplier…) |
| **Persona** | تجربة Portal (ADR-019) |
| **Role** | RBAC assignment |
| **Capability** | what the org can do on platform |
| **Contract Party** | stakeholder في عقد محدد |
| **Permission** | grant على resource/action |

---

## Final Core Domain Map

> 13 domains + 1 cross-cutting Intelligence layer  
> **ليست** 1:1 مع pages أو modules الحالية

| # | Domain | MARKET | CONTROL | TRUST | Primary Aggregates / SoR |
|---|--------|:------:|:-------:|:-----:|--------------------------|
| 1 | **Identity & Access** | | | ✓ | User, Session, RBAC, Org membership |
| 2 | **Party Network** | ✓ | ✓ | | Organization, PartyProfile, Qualification, Network link |
| 3 | **Project & Program** | | ✓ | | Program, Project, Phase, WBS (ABC control view) |
| 4 | **Requirements & BOQ** | | ✓ | | Requirement, BOQ, Spec, Package, PlannedRequirement |
| 5 | **Sourcing & Commercial Exchange** | ✓ | | | **SourcingEvent**, Listing, Offer, Bid, Award |
| 6 | **Procurement & Fulfillment** | ✓ | ✓ | ✓ | PR, PO, GRN, Delivery, Shipment |
| 7 | **Contract & Milestones** | | ✓ | ✓ | Contract, ContractParty, Milestone, Claim, Variation |
| 8 | **Trust & Evidence** | | ✓ | ✓ | Evidence, Inspection, NCR, Certificate, VerificationDecision |
| 9 | **Financial & Payment** | | | ✓ | Invoice, Reservation, PaymentInstruction, ReleaseRequest |
| 10 | **Compliance & Regulatory** | | ✓ | ✓ | Permit ref, ComplianceSnapshot, AuditEntry |
| 11 | **Workforce & Training** | ✓ | | | Job (construction), Course, Skill, Certification, Assessment |
| 12 | **Integration Hub** | | ✓ | | Connector, ExternalRef, SyncJob, PaymentAbstraction |
| 13 | **Experience** | | | | Portal config, CMS, Notification prefs (presentation only) |
| — | **Intelligence (cross-cutting)** | ✓ | ✓ | ✓ | AIJob, Recommendation — **no business aggregate ownership** |

### Domain rename note

**Commercial Exchange → Sourcing & Commercial Exchange**  
Reflects D3: Unified Sourcing Engine as the MARKET core.

---

## Final Bounded Context Map

### Canonical contexts (13 + Intelligence)

| Context | Owns (Aggregates) | Does NOT own |
|---------|-------------------|--------------|
| **Identity & Access** | User, Role, Permission grant | Org business profile |
| **Party Network** | Organization, PartyProfile, Qualification | Contract terms |
| **Project & Program** | Project, Program, Phase, WBS node | Detailed CPM schedule (Primavera SoR) |
| **Requirements & BOQ** | BOQ, Spec, Package, PlannedRequirement | Sourcing awards |
| **Sourcing & Commercial Exchange** | SourcingEvent, Listing, Offer, Bid, Award | PO execution, Contract |
| **Procurement & Fulfillment** | PR, PO, Delivery, GRN | Sourcing event lifecycle |
| **Contract & Milestones** | Contract, Milestone, Claim, Variation | Payment execution |
| **Trust & Evidence** | Evidence, Inspection, VerificationDecision | PaymentInstruction |
| **Financial & Payment** | Invoice, PaymentInstruction, Reservation | Custodial balance, Evidence |
| **Compliance & Regulatory** | ComplianceSnapshot, PermitRef | Authoritative permit registry |
| **Workforce & Training** | Job, Course, Skill, Cert (construction-scoped) | General HR/payroll |
| **Integration Hub** | Connector, ExternalRef, SyncContract | Domain business rules |
| **Experience** | PortalSection, CMSBlock | Any domain state |
| **Intelligence** | AIJob, ModelRun metadata | Milestone, Payment, Award |

### D8 — Context Consolidation (approved in principle, **no merge yet**)

**قبل أي دمج أو حذف** يجب توثيق لكل context:

- [ ] Canonical Domain Map entry
- [ ] Aggregate boundaries
- [ ] Data ownership (SoR vs read-model)
- [ ] Domain events catalog
- [ ] API surface (commands / queries)
- [ ] Read models
- [ ] Integration boundaries

**ADR-002 (16 contexts)** → mapping table in Phase 2 — **no deletion until signed-off**.

### ADR-002 → ADR-022 mapping (draft — Phase 2 to finalize)

| ADR-002 (legacy) | ADR-022 (canonical) | Action |
|------------------|---------------------|--------|
| Entity Registry | Identity & Access + Party Network | Reposition |
| Procurement | Procurement & Fulfillment + Sourcing | Split sourcing out |
| Marketplace | Sourcing & Commercial Exchange | Unify under Sourcing Engine |
| Tender (fragmented) | Sourcing & Commercial Exchange | Merge |
| Quality | Trust & Evidence | Reposition |
| Financial / Invoicing | Financial & Payment + Trust | Split evidence vs payment |
| Supplier Network | Party Network | Rename/extend |
| Portal | Experience | Unchanged role |
| Product Catalog / Inventory | Sourcing + Procurement (supporting) | TBD Phase 2 |
| AI | Intelligence (cross-cutting) | Reposition |
| Jobs / Training | Workforce & Training | Scope to construction |
| *(others)* | Integration Hub / Compliance | TBD Phase 2 |

---

## Final Domain Relationships

```mermaid
flowchart TB
  subgraph experience [Experience Layer]
    PORTAL[Portal / CMS]
  end

  subgraph intelligence [Intelligence — Cross-Cutting]
    AI[Verify · Analyze · Recommend]
  end

  subgraph control [PROJECT CONTROL]
    PROG[Program / Project]
    REQ[Requirements / BOQ]
    OWN[Owner / PMC Control Views]
  end

  subgraph market [MARKET — Unified Sourcing Engine]
    USE[SourcingEvent Types]
    LIST[Listings / Commerce]
    OFF[Offers / Bids / Awards]
  end

  subgraph trust [TRUST LAYER]
    CON[Contract / Milestone]
    CLM[Progress Claim]
    EVI[Evidence]
    VER[Verification Decision]
    PAY[Payment Instruction]
  end

  subgraph integration [Integration Hub — Not SoR]
    PAYABS[Payment/Escrow Abstraction]
    EXT[BIM · Primavera · ERP · Bank · Regulatory]
  end

  PROG --> REQ --> USE
  USE --> OFF --> CON
  CON --> CLM --> EVI --> VER
  VER -->|Authorized Approval| PAY
  PAY --> PAYABS --> EXT
  PROG -.-> OWN
  AI -.-> PROG & USE & EVI & VER
  AI -.x|No financial authority| PAY
  PORTAL --> PROG & USE & trust
  PROG <-->|read/sync| EXT
  REQ -->|Future Demand| USE
```

### Key relationship rules

1. **Sourcing → Contract:** Award triggers Contract creation (event-driven).  
2. **Contract → Trust:** Milestone claim requires Evidence in Trust context.  
3. **Trust → Financial:** VerificationDecision enables PaymentInstruction (never direct release).  
4. **Financial → Integration:** PaymentInstruction via abstraction — ABC never holds funds.  
5. **Project → Sourcing:** Requirements/BOQ/Schedule feed SourcingEvent + Future Demand.  
6. **Intelligence:** reads via domain queries; writes via domain commands only.

---

## Cross-Domain Capabilities

| Capability | Domains | Principle / Decision |
|------------|---------|----------------------|
| **Owner Digital Eye** | Project Control, Trust, Experience | D7 — Models A/B/C |
| **No Evidence → No Release** | Contract, Trust, Financial | Verified progress only |
| **Protected Payment (optional)** | Financial, Trust, Integration | D5 — Abstraction layer; ABC instructs only |
| **Unified Sourcing Engine** | Sourcing & Commercial Exchange | D2, D3 — one model, many workflows |
| **Universal Commerce** | Sourcing, Party Network | Buyer/Seller/Both; Scrap = event type |
| **Future Procurement** | Requirements, Project, Sourcing, Intelligence | D6 — permission-controlled visibility |
| **AI Assist (not authorize payment)** | Intelligence + all domains | D4 — Recommend only; human/policy gate |
| **Workforce Loop** | Workforce, Party Network, Intelligence | Construction-scoped only |
| **External SoR Integration** | Integration Hub + all domains | Principle 9 — BIM, ERP, Primavera, Banks |
| **Regulatory Read** | Compliance, Project Control, Trust | Read-models; external SoR for master data |

---

## Ownership Boundaries

### Aggregate ownership (hard rules)

| Rule | Detail |
|------|--------|
| **O1** | SourcingEvent lifecycle owned by **Sourcing & Commercial Exchange** only |
| **O2** | ContractParty references Organization ID — party details owned by **Party Network** |
| **O3** | VerificationDecision owned by **Trust & Evidence** — Financial reads, never creates |
| **O4** | PaymentInstruction owned by **Financial & Payment** — requires VerificationDecision ref |
| **O5** | No custodial balance in ABC schema — balances SoR = external PSP/Bank |
| **O6** | Intelligence owns no Milestone, Payment, Award, or Contract state |
| **O7** | Experience renders only — zero business invariants in portal module |
| **O8** | FutureDemandSignal visibility enforced in **Requirements/Sourcing** via policy engine |
| **O9** | PMC: Organization in Party Network; ContractParty in Contract context when contracted |
| **O10** | Detailed schedule/BIM/GL: **read-model or sync ref** in ABC — authoritative SoR external |

### Persona / Org / Contract separation (D1)

```
User ──membership──► Organization ──persona config──► Experience (Portal)
                         │
                         ├── capability grants ──► Actions
                         └── contract party ref ──► Contract & Milestones
```

---

## Updated D1–D8 (Final Status)

| # | Decision | Status | Resolution |
|---|----------|--------|------------|
| **D1** | PMC model | ✅ **Approved** | PMC = Organization; Contract Party when under contract. Strict separation from Persona/Role/Capability/Permission |
| **D2** | Commercial event model | ✅ **Approved** | Unified Sourcing/Commercial Event Model; multiple Event Types; **different workflows per type** |
| **D3** | Tender vs Auction priority | ✅ **Revised & Approved** | Priority = **Unified Sourcing Engine**; Tender/Auction/RFQ = event types inside it |
| **D4** | AI payment authority | ✅ **Approved** | AI: Verify/Analyze/Recommend only. Release requires Contract+Policy+Evidence+Authorized Approval+Financial Layer. Future automation via explicit rules — no independent AI financial authority |
| **D5** | Escrow / PSP | ⏸️ **Deferred** | No provider selection now. Build **Payment/Escrow Abstraction Layer** for future country-specific integrations |
| **D6** | Future demand visibility | ✅ **Approved** | Permission/Policy model: Public, Qualified, Invited, Project Participants, Internal |
| **D7** | Owner control models | ✅ **Approved** | Models A/B/C; ABC = Owner's Digital Control & Transparency Layer; legal liability stays with parties |
| **D8** | Context consolidation | ✅ **Approved in principle** | No merge/delete until canonical map + aggregates + events + APIs + read models + integration boundaries documented per context |

---

## Remaining Architectural Decisions (Phase 2)

| # | Decision | Notes |
|---|----------|-------|
| **R1** | SourcingEvent schema & workflow registry design | Phase 2 deliverable — ADR-023 candidate |
| **R2** | Per-event-type workflow definitions (Tender, Auction, RFQ…) | Unified engine, distinct state machines |
| **R3** | Contract domain v2 — ContractParty linking model | Depends on D1; ADR candidate |
| **R4** | Payment/Escrow Abstraction Layer interface spec | D5 deferred — design only in Phase 2 |
| **R5** | FutureDemandSignal entity & policy engine placement | Requirements vs Sourcing vs shared policy module |
| **R6** | AI automation tiers (which milestones allow rule-based auto-approve) | D4 follow-up — policy catalog |
| **R7** | ADR-002 full deprecation/merge matrix | D8 prerequisite before any code consolidation |
| **R8** | Product Catalog / Inventory placement under new map | Supporting subdomain of Sourcing vs Procurement |
| **R9** | Program/Portfolio hierarchy depth | Multi-project owner scenarios |
| **R10** | Data residency / AI model hosting policy | Cross-cutting; blocks production AI features |
| **R11** | External job board integration vs exclude | Workforce scope boundary |
| **R12** | Regulatory integration depth (read-only vs submit) | Compliance context design |

---

## Phase 2 Scope (now unlocked)

**Phase 2 = Detailed Domain & Sourcing Architecture Design**

**Deliverables (design only):**
- ADR-023: Unified Sourcing Engine (event model, workflows, API draft)
- ADR-024: Contract & Milestones domain v2
- ADR-025: Payment/Escrow Abstraction Layer (interface spec)
- ADR-026: Future Demand & Visibility Policy
- Canonical event catalog extensions
- ADR-002 → ADR-022 consolidation matrix (R7)
- OpenAPI drafts for new domain commands/queries

**Still prohibited in Phase 2:**
- Feature coding
- Database migrations
- UI implementation
- Live external integrations

---

## Consequences

- **Positive:** Clear approved foundation; Unified Sourcing Engine unblocks tender/auction/RFQ convergence; ABC-as-coordination-layer prevents ERP/BIM scope creep.
- **Negative:** Phase 2 design workload significant before any implementation; legacy ADR-002 debt must be mapped before merges.
- **Neutral:** Existing Phase 1 code remains; repositioning is incremental post-Phase 2 design approval.

---

## References

- Phase 1 Architecture Assessment (2026-08-22)
- ADR-001 (System Architecture), ADR-002 (Domain Boundaries — revision pending)
- ADR-016 (Money), ADR-017 (Quality/Financial Trust)
- ADR-019 (Portal — Experience layer; Persona ≠ Capability)
- `docs/architecture/capability-map.md`
- `docs/product-experience/portal-capabilities-matrix.md`
