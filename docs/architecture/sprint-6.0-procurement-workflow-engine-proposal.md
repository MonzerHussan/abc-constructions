# مقترح Sprint 6.0 — Procurement Workflow Engine

> **المرحلة:** Phase 3 — Transaction & Execution Layer  
> **التاريخ:** 2026-08-01  
> **الحالة:** 📝 **مقترح قيد المراجعة (التنقيح 2: توجيه إلى `shared/workflow`) — لا تنفيذ حتى الاعتماد**  
> **المرجع:** ADR-012 (Workflow Engine)، ADR-004 (Event Bus)، Phase 1 Procurement Core، ADR-021 (Marketplace RFQ Gateway)  
> **تنقيح 2:** اعتماد `shared/workflow/` بدل `core/workflow/` بعد مراجعة الواقع الفعلي للكود — انظر §3.1c

---

## 1. أهداف الـ Sprint

نقل دورة المشتريات من **خدمات منفصلة + حالة مضمّنة (Inline checks)** إلى **محرك سير عمل مركزي (Workflow Engine)** ينسّق العملية كاملة عبر كيان واحد قائم على الحالات والانتقالات والقواعد (Guards) والتاريخ المستمر.

### الأهداف المحددة:

| # | الهدف | المبرر |
|---|-------|--------|
| O-1 | **ترقية Workflow Engine من محرك تسجيل آلات فقط إلى محرك تعريفات (Definitions) + قواعد (Guards) + تاريخ (History)** | ADR-012 ينص صراحةً: *"No built-in persistence of transition history (future enhancement)"* |
| O-2 | **إكمال الآلات الناقصة**: PurchaseRequest، Evaluation، Award | حالياً PR و Evaluation و Award لا تملك State Machines — تستخدم فحوصات مضمّنة داخل الخدمات |
| O-3 | **حل TD-01**: تأكيد نقل الإطار إلى الموقع المشترك الصحيح وقطع أي اعتماد على `procurement/workflow` | الانتهاك المعماري: النطاقات تستورد `workflow` — والواقع: الإطار موجود في `shared/workflow` ويجب توثيقه كمشترك (راجع §3.1c) |
| O-4 | **أتمتة الانتقالات بين الكيانات** (Orchestration): PR → RFQ → Quotation → Evaluation → Approval → Award → PO → Delivery | حالياً كل خدمة تدير انتقالاتها بمعزل عن الأخرى |
| O-5 | **إنفاذ المواعيد (Deadline Enforcement)**: إغلاق تلقائي لـ RFQ عند انتهاء الموعد | رموز الأخطاء موجودة (`PROCUREMENT_RFQ_DEADLINE_PASSED`) لكن لا يوجد إنفاذ فعلي |
| O-6 | **Workflow History مستمر** — سجل تدقيق لكل انتقال | ADR-012 enhancement مذكور + مطلوب للتدقيق والامتثال |
| O-7 | **0 TypeScript errors + 0 كسر** في الاختبارات القائمة | المعيار الثابت في كل Sprint closure |

---

## 2. نطاق العمل (Scope)

### ✅ ضمن النطاق (In Scope)

1. **تثبيت إطار العمل في `shared/workflow/`** (حل TD-01: يبقى موطن المحرك الفعلي حيث هو الآن) مع شيم إعادة تصدير من `procurement/workflow/` كـ shim لتجنّب كسر الاستيرادات الحالية، ثم تحديث الاستيرادات تدريجياً.
2. **تطوير `WorkflowEngine`** ليدعم:
   - **Definitions** (تعريفات انتقالات قابلة للتصريح بدل الحالة المضمّنة)
   - **Guards** (شروط قبل الانتقال: صلاحيات، مواعيد، اكتمال بيانات)
   - **History** (تسجيل كل انتقال ناجح/مرفوض)
3. **آلات حالة جديدة** (registered في WorkflowEngine):
   - `PurchaseRequestStateMachine` (PRStatus: DRAFT → PENDING_APPROVAL → APPROVED/REJECTED → ORDERED)
   - `EvaluationStateMachine` (EvalStatus: PENDING → IN_PROGRESS → COMPLETED)
   - `AwardStateMachine` (AwardStatus: PENDING_ACCEPTANCE → ACCEPTED/DECLINED → CANCELLED)
4. **نموذج `WorkflowHistory`** في Prisma لتسجيل كل انتقال (entityType, entityId, from, to, action, actorId, metadata, timestamp).
5. **نموذج `WorkflowDefinition`** اختياري للتخزين (Configurable workflow)، أو تعريفات ثابتة في الكود مع توثيق.
6. **`ProcurementWorkflowOrchestrator`** (خدمة تنسيق) تربط الكيانات:
   - PR Approved → جاهز لإنشاء RFQ
   - RFQ Awarded + Award ACCEPTED → إنشاء PO تلقائي (DRAFT)
   - Evaluation Completed → تمكين Approval
   - RFQ Closed / Cancelled → إخطار (event)
7. **إنفاذ الموعد**: فحص `deadlineDate` قبل قبول العروض وعند الإغلاق.
8. **API routes جديدة**: history، transitions، definitions.
9. **اختبارات**: لكل آلة جديدة + للمحرك (guards/history) + للمنسق + معمارية.

### ⛔ خارج النطاق (Out of Scope)

| البند | السبب |
|-------|-------|
| تعديل بنية Phase 1 الموجودة بشكل مكسور | التوافق العكسي إلزامي |
| إعادة تصميم التقييم ليشمل AI | سيأتي في Sprint AI (Matching Engine) |
| تغيير نماذج RFQ/Quotation/PO نفسها | لا يلزم — الآلات تُبنى فوق الحقول الموجودة |
| الـ UI/Frontend | Sprint خلفي (Backend) |
| الدفع (Payment) والفواتير | مملوكة لنطاقات Financial/Invoicing |
| RabbitMQ/Kafka (D-01) | مؤجل لقرار منفصل |

---

## 3. Domain Model المقترح

### 3.1 لا تغيير في ملكية النطاقات

- النطاقات كما هي: Procurement يملك دورة الشراء، و`shared/workflow/` **قدرة منصة مشتركة (Shared Platform Capability)** يستوردها الجميع.
- `shared/` يسمح للجميع بالاستيراد (وفق ADR-002/007) وهو الموطن الفعلي للمحرك منذ المراحل السابقة.

### 3.1a Workflow Governance (حوكمة سير العمل)

> **قاعدة حوكمة (Governance Rule):** محرك العمل **عام (Generic) وقابل لإعادة الاستخدام** — ليس مملوكاً لـ Procurement ولا لأي نطاق تجاري.

| # | القاعدة | الوصف |
|---|---------|--------|
| W-1 | **المحرك في `shared/workflow/` فقط** | `BaseStateMachine`, `WorkflowEngine`, `WorkflowGuards`, `WorkflowHistoryRecorder` كلها تعيش في `shared/workflow/` — لا نسخة داخل أي Domain |
| W-2 | **أي State Machine جديدة تُسجَّل عبر `shared/workflow`** | التسجيل يتم عبر `WorkflowEngine.register(...)` في `shared/workflow` — لا يُكتب تعريف انتقالات داخل مجلدات النطاقات التجارية (مسار `procurement/workflow/state-machines/` القديم يُوقف) |
| W-3 | **Definitions تكون تصريحية** | انتقالات كل كيان تُعرَّف كـ `TransitionMap`/`WorkflowDefinition` قابلة للتسجيل في المحرك العام — لا منطق انتقالات مضمّن في الخدمات |
| W-4 | **Guard عامة في المحرك** (authorization, deadline, completeness) | تُنفَّذ كـ hooks عامة على مستوى المحرك |
| W-5 | **Guard خاصة بالعمل داخل النطاق** | القواعد التجارية (مثلاً "award يتطلب عرض SUBMITTED") تُوفَّر بواسطة النطاق عبر callback يُمرَّر للمحرك — يبقى المحرك عاماً |
| W-6 | **التسجيل الإلزامي** | اختبار معماري يمنع إنشاء State Machine غير مسجلة في `WorkflowEngine` |
| W-7 | **لا منطق أعمال داخل المحرك** | `shared/workflow` يمنع استيراد أي رموز نطاقية (services/validators/state-machines خاصة بالنطاق) — يعمل على `entityType` + `entityId` مجرّدين فقط |

### 3.1b Domain Boundaries (حدود المسؤولية)

| المسؤول | يملكه |
|---------|-------|
| **`shared/workflow/` (Shared Platform Capability)** | إدارة الحالة (state)، الانتقالات (transitions)، السجل (history)، الـ guards العامة (authorization/deadline/اكتمال عام) — **Lifecycle Mechanics فقط** |
| **Procurement (Domain)** | قواعد العمل التجارية: معايير التقييم، شروط القبول/الرفض للعروض، سياسة الترسية، إنفاذ المواعيد الخاصة بالمشتريات، قواعد إنشاء PO من Award — **Business Rules فقط** |

**مبدأ الفصل (Separation of Concerns):**
- المحرك يعرف **"كيف"** ينتقل من حالة لأخرى (validity + persistence + audit).
- النطاق يعرف **"متى ولماذا"** يُسمح بالانتقال (business rules عبر Guards callbacks).
- المحرك لا يعرف شيئاً عن RFQ/Quotation/PO — يتعامل مع `entityType` + `entityId` بشكل مجرّد.
- النطاق لا يكتب منطق حالة/انتقالات بنفسه — يستدعي المحرك دائماً.
- **الآلات الخاصة بالنطاق** (RFQ/Quotation/PO/Delivery + الجديدة PR/Evaluation/Award) تُعرَّف في `procurement/workflow/state-machines/` وتُسجَّل في محرك `shared/workflow` — التعريف يخصّ النطاق، والتشغيل يخصّ المحرك.

### 3.1c لماذا `shared/workflow/` بدل `core/workflow/` (قرار التوجيه)

| الاعتبار | التحليل |
|----------|---------|
| **الواقع الفعلي للكود** | المحرك موجود فعلاً في `src/modules/shared/workflow/` منذ المراحل السابقة، و`procurement/workflow/` أصبح shim إعادة تصدير فقط. `core/workflow/` غير موجود أصلاً. |
| **التوافق مع ADR-002/007** | `shared/` هو طبقة البنية التحتية المشتركة المسموح للجميع باستيرادها — المكان الطبيعي لـ Platform Capability. `core/` في هذا الكود يمثل نطاقاً تجارياً (المؤسسة/RBAC) وليس بنية تحتية. |
| **اختبار العمارة الحالي** | `shared` مستثنى من قاعدة "لا استيراد بين النطاقات"، بينما `core` **نطاق مدرج** في `moduleNames` — وضعهما في `core/workflow` كان سيفرض رقابة استيراد إضافية ويكسر "Shared must not import from any domain module" لو أبقينا re-export في `shared`. |
| **تكلفة الانتقال** | النقل إلى `core/workflow` يمسّ ~27 استيراداً عبر 7 نطاقات بدون مكسب معماري — `shared/workflow` يحقق نفس الهدف (محور واحد، لا تبعية على procurement) بتكلفة صفر. |
| **النتيجة** | اعتماد `shared/workflow/` كموطن المحرك النهائي. يُحدَّث توثيق TD-01/ADR-012 ليعكس الموقع الفعلي الصحيح، ويُضاف §3.1b مبدأ الفصل أعلاه. |

### 3.2 كيانات جديدة

| الكيان | النوع | الغرض |
|--------|-------|-------|
| `WorkflowHistory` | Prisma Model (جديد) | سجل انتقالات موحّد لكل الكيانات (PR/RFQ/Quotation/Evaluation/Award/PO/Delivery) |
| `WorkflowDefinition` | Prisma Model (جديد، اختياري) | تعريفات قابلة للتكوين (اسم، إصدار، انتقالات JSON، Guards JSON) |
| `ProcurementWorkflowOrchestrator` | Service (جديد) | ينسّق الانتقالات بين الكيانات ويستدعي state machines عبر المحرك |
| `shared/workflow/` | Module (مشترك — منصة قدرة) | BaseStateMachine + WorkflowEngine + WorkflowContext + WorkflowTransition + Guards + HistoryRecorder |

### 3.3 آلات الحالة (بعد Sprint 6.0)

| الكيان | الحالات | التسجيل |
|--------|---------|---------|
| PurchaseRequest | DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, ORDERED | 🔜 جديد |
| RFQ | DRAFT, SENT, OPEN, AWARDED, CLOSED, CANCELLED | ✅ موجود |
| Quotation | DRAFT, SUBMITTED, WITHDRAWN, ACCEPTED, REJECTED | ✅ موجود |
| QuotationEvaluation | PENDING, IN_PROGRESS, COMPLETED | 🔜 جديد |
| Award | PENDING_ACCEPTANCE, ACCEPTED, DECLINED, CANCELLED | 🔜 جديد |
| PurchaseOrder | DRAFT, ISSUED, ACKNOWLEDGED, PARTIALLY_RECEIVED, COMPLETED, CANCELLED | ✅ موجود |
| Delivery | SCHEDULED, DISPATCHED, IN_TRANSIT, ARRIVED, PARTIALLY_RECEIVED, COMPLETED, CANCELLED | ✅ موجود |

### 3.4 `WorkflowHistory` (المخطط المقترح — Audit كامل)

> **متطلب:** يحتوي معلومات تدقيق كاملة (Actor, Timestamp, Previous State, New State, Reason) كما هو مطلوب في مراجعة المستخدم.

```prisma
model WorkflowHistory {
  id            String    @id @default(cuid())
  entityType    String    // PR | RFQ | QUOTATION | EVALUATION | AWARD | PO | DELIVERY
  entityId      String
  action        String    // submit | send | award | accept | decline | cancel | ...
  fromStatus    String?   // Previous State
  toStatus      String    // New State
  actorId       String?   // User (or system) who performed the transition
  actorRole     String?   // REQUESTER | SUPPLIER | EVALUATOR | APPROVER | ADMIN | SYSTEM
  reason        String?   // سبب الانتقال/الرفض (إلزامي عند الرفض أو cancel)
  result        String    // SUCCESS | BLOCKED_BY_GUARD | INVALID_TRANSITION
  guardName     String?   // اسم الـ Guard الذي رفض (عند BLOCKED_BY_GUARD)
  metadata      Json?     // تفاصيل إضافية (correlationId, قبل/بعد لحقول حرجة)
  createdAt     DateTime  @default(now()) // Timestamp (UTC)

  @@index([entityType, entityId])
  @@index([entityId, createdAt])
  @@index([actorId])
  @@index([result, guardName])
}
```

**تغطية حقول التدقيق المطلوبة:**

| حقل | يغطي متطلب |
|-----|-----------|
| `actorId` | Actor |
| `createdAt` | Timestamp (UTC) |
| `fromStatus` | Previous State |
| `toStatus` | New State |
| `reason` | Reason (السبب/التعليل) |
| `actorRole` | دور المنفّذ (صلاحيات RBAC — انظر §6.2) |
| `result`/`guardName` | توثيق المحاولات المرفوضة للتدقيق

> **ملاحظة:** إضافة `WorkflowHistory` و`WorkflowDefinition` تتطلب تعديل `prisma/schema.prisma` — وهذا **خارج نطاق الاقتراح الحالي** ولن يُنفَّذ إلا بعد اعتماد المقترح (بما يطابق اشتراط المستخدم: لا تعديل على Prisma Schema قبل الاعتماد).

---

## 4. Workflow كامل لعملية الشراء

### 4.1 نظرة عامة (End-to-End)

```
PR ──→ RFQ ──→ Quotation ──→ Evaluation ──→ Approval ──→ Award ──→ PO ──→ Delivery
(DRAFT)      (DRAFT)       (SUBMITTED)    (PENDING)    (PENDING)  (PENDING  (DRAFT)
                                               │                  ACCEPTANCE)
                                               └─── Guards ────┘
```

### 4.2 RFQ Lifecycle

```
DRAFT ──submit──→ SENT ──send──→ OPEN ──award──→ AWARDED ──close──→ CLOSED
  │                 │            │  │
  └──cancel──→ CANCELLED         │  └──cancel──→ CANCELLED
                                 └──────close──→ CLOSED
```

**Guards الجديدة:**
- `submit`: يتطلب ≥ 1 item (موجود: `PROCUREMENT_RFQ_NO_ITEMS`)
- `send`: يتطلب ≥ 1 مورد مدعو + الموعد مستقبلي (جديد: فحص `deadlineDate > now`)
- `award`: يتطلب عرض (Quotation) SUBMITTED + تقييم مكتمل (جديد)
- `close`/`cancel`: تسجيل السبب في metadata (جديد)

**إنفاذ الموعد (جديد):**
- عند `send` رفض إذا كان `deadlineDate` قد مضى.
- `close` تلقائي عند تجاوز الموعد (عبر مهمة/فحص في الخدمة).

### 4.3 Quotation Management

```
DRAFT ──submit──→ SUBMITTED ──accept──→ ACCEPTED
  │                  │  │
  │                  │  └──reject──→ REJECTED
  │                  └────withdraw──→ WITHDRAWN
  └──(delete/cancel inline)
```

**Guards:**
- `submit`: لا يقبل بعد موعد RFQ (جديد).
- `accept`: فقط عندما يكون الـ RFQ في حالة تسمح (OPEN أو في طور الترسية).

### 4.4 Evaluation Engine

```
PENDING ──start──→ IN_PROGRESS ──complete──→ COMPLETED
                              │
                              └──(نقص معايير/درجات)──→ مرفوض بالـ Guard
```

**الوضع الحالي:** `EvaluationService` (existing) يدير QuotationEvaluation + ApprovalRequest.

**الإضافات في Sprint 6.0:**
- `EvaluationStateMachine` تسجيل المراحل رسمياً.
- Guard عند `complete`: يتطلب كل المعايير مسجلة الدرجات (مثلاً `scores.length >= criteria.length`).
- عند `complete` → إتاحة `requestApproval` (موجود) مع حدث.

### 4.5 Award Workflow

```
PENDING_ACCEPTANCE ──accept──→ ACCEPTED ──→ (تلقائياً: إنشاء PO DRAFT)
        │
        ├──decline──→ DECLINED ──→ (إتاحة ترسية بديلة)
        └──cancel──→ CANCELLED
```

**الإضافات:**
- `AwardStateMachine` جديد.
- Guard عند `accept`: لا يُقبل العرض إلا إذا كان RFQ في AWARDED و Quotation في SUBMITTED/ACCEPTED.
- **Orchestration:** عند ACCEPTED → `ProcurementWorkflowOrchestrator` ينشئ `PurchaseOrder` DRAFT تلقائياً من بنود الـ Quotation (بمعاملة `$transaction`، معالجة TD-03).

---

## 5. Event Flow المقترح

### 5.1 أحداث جديدة

> **قاعدة:** قبل اعتماد أي حدث جديد، تُراجع أسماؤه ضد `docs/architecture/events-catalog.md` لضمان عدم التكرار. الأحداث أدناه **مقترحة** وقد تتغير أسماؤها لتطابق اصطلاحات الكتالوج.

| الحدث المقترح | الناشر | النطاق | المحفز | مراجعة التكرار |
|---------------|--------|--------|--------|----------------|
| `Procurement.Workflow.Transitioned` | `WorkflowEngine`/`HistoryRecorder` | core/procurement | كل انتقال ناجح | ✅ جديد (لا يوجد في catalog) |
| `Procurement.Workflow.TransitionFailed` | `WorkflowEngine` | core/procurement | رفض انتقال بواسطة Guard | ✅ جديد |
| `Procurement.PR.Ordered` | `ProcurementWorkflowOrchestrator` | procurement | PR → RFQ جاهز | ✅ جديد (لا يوجد `PR.Ordered` حالياً) |
| `Procurement.RFQ.DeadlineReached` | `RFQService` | procurement | تجاوز الموعد | ✅ جديد |
| `Procurement.Award.Accepted` | `RFQService`/Orchestrator | procurement | قبول الترسية | ✅ جديد |
| `Procurement.Award.Declined` | `RFQService`/Orchestrator | procurement | رفض الترسية | ✅ جديد |
| `Procurement.PO.GeneratedFromAward` | `ProcurementWorkflowOrchestrator` | procurement | إنشاء PO تلقائي | ✅ جديد |

### 5.1a مراجعة أحداث موجودة (لا تكرار)

قائمة التحقق ضد `events-catalog.md` (سطور Procurement: PR/RFQ/Quotation/Evaluation/Approval/PO/Delivery):

| المجموعة | الأحداث الموجودة (لن تُعاد) |
|----------|------------------------------|
| PR | `Created`, `Submitted`, `Updated`, `Approved`, `Rejected` |
| RFQ | `Created`, `Updated`, `Submitted`, `Sent`, `SupplierInvited`, `Awarded`, `Closed`, `Cancelled` |
| Quotation | `Created`, `Updated`, `Submitted`, `Withdrawn`, `Accepted`, `Rejected` |
| Evaluation | `Started`, `Scored`, `Completed` |
| Approval | `Requested`, `Approved`, `Rejected` |
| PO | `Created`, `Issued`, `Acknowledged`, `Completed`, `Cancelled` |
| Delivery | `Created`, `Dispatched`, `InTransit`, `Arrived`, `Completed`, `Cancelled` |

> **قرار:** الأحداث الجديدة المقترحة لا تصطدم بأي حدث موجود — الفحص تم على القائمة الكاملة. يبقى الاسم النهائي خاضعاً لمراجعة الكتالوج أثناء التنفيذ (DoD-8).

### 5.2 تسلسل الأحداث (Sequence)

```
PR.Submitted → PR.Approved
  → RFQ.Created → RFQ.Submitted → RFQ.Sent → RFQ.SupplierInvited
    → Quotation.Created → Quotation.Submitted
      → Evaluation.Started → Evaluation.Scored → Evaluation.Completed
        → Approval.Requested → Approval.Approved
          → RFQ.Awarded → Award.Accepted
            → PO.GeneratedFromAward (PO.Created) → PO.Issued
              → Delivery.Created → Delivery.Dispatched → Delivery.Arrived → Delivery.Completed
```

> يتم المحافظة على جميع الأحداث الموجودة (`Procurement.RFQ.*`, `Procurement.Quotation.*`, `Procurement.Evaluation.*`, `Procurement.Approval.*`, `Procurement.PO.*`, `Procurement.Delivery.*`) — أحداث جديدة فقط.

---

## 6. API Contracts

### 6.1 مسارات جديدة (مقترحة)

| Method | Path | الوصف |
|--------|------|-------|
| `GET` | `/api/v1/procurement/workflow/history` | سجل انتقالات (فلترة entityType/entityId/actorId) |
| `GET` | `/api/v1/procurement/workflow/history/:entityType/:entityId` | تاريخ كيان محدد |
| `GET` | `/api/v1/procurement/workflow/definitions` | قائمة تعريفات سير العمل (للتوثيق/الإدارة) |
| `GET` | `/api/v1/procurement/workflow/definitions/:name` | تعريف محدد مع الحالات المسموحة |
| `POST` | `/api/v1/procurement/workflow/:entityType/:entityId/transition` | تنفيذ انتقال عام مع Guard (اختياري، للتوحيد) |

> **ملاحظة:** مسارات RFQ/Quotation/PO/Delivery الحالية تبقى كما هي دون كسر. إضافة مسار transition عام **اختيارية** لتوحيد التنفيذ.

### 6.2 مصفوفة الصلاحيات (RBAC) لكل انتقال

> **قاعدة:** كل انتقال يتطلب تحديد **من يستطيع تنفيذه** (Requester / Supplier / Evaluator / Admin / System) — تُفرض عبر Guard عامة في المحرك (authorization guard) وتُسجَّل في `WorkflowHistory.actorRole`.

| الكيان | الانتقال | المنفّذ المسموح | ملاحظات |
|--------|----------|------------------|---------|
| **PR** | `submit` | Requester (المنشئ) | صاحب الطلب فقط |
| **PR** | `approve` / `reject` | Approver / Admin | حسب سلسلة الموافقة |
| **RFQ** | `submit` | Requester (منشئ الـ RFQ) | صاحب الطلب فقط |
| **RFQ** | `send` | Requester / Admin | إرسال للموردين |
| **RFQ** | `inviteSupplier` | Requester / Admin | |
| **RFQ** | `award` | Approver / Admin | بعد اكتمال التقييم |
| **RFQ** | `close` / `cancel` | Requester / Admin | |
| **Quotation** | `submit` / `withdraw` | **Supplier** (صاحب العرض) | فقط المورد نفسه |
| **Quotation** | `accept` / `reject` | Approver / Admin | قبول عرض |
| **Evaluation** | `start` / `score` / `complete` | **Evaluator** (المقيّم المعيّن) | فقط المقيّم نفسه |
| **Award** | `accept` | **Supplier** (المورد المرسى عليه) | قبول الترسية |
| **Award** | `decline` | **Supplier** | رفض الترسية |
| **Award** | `cancel` | Requester / Admin | |
| **PO** | `issue` / `acknowledge` / `complete` / `cancel` | Requester / Admin (+Supplier للـ acknowledge) | كما هو الحالي |
| **Workflow history/definitions** | `GET` (قراءة) | أي مستخدم مصرّح داخل المنظمة | سجل تدقيق |

**مبدأ:**
- **System (تلقائي):** إنشاء PO من Award، إغلاق RFQ عند الموعد — `actorId = system`, `actorRole = SYSTEM`.
- أي محاولة انتقال من دور غير مسموح → `BLOCKED_BY_GUARD` في الـ History + رفض 403.

### 6.3 عينة استجابة سجل التاريخ

```json
{
  "items": [
    {
      "id": "wh_123",
      "entityType": "RFQ",
      "entityId": "rfq_456",
      "action": "submit",
      "fromStatus": "DRAFT",
      "toStatus": "SENT",
      "actorId": "user_1",
      "actorRole": "REQUESTER",
      "reason": null,
      "result": "SUCCESS",
      "guardName": null,
      "createdAt": "2026-08-01T10:00:00Z"
    },
    {
      "id": "wh_124",
      "entityType": "RFQ",
      "entityId": "rfq_456",
      "action": "send",
      "fromStatus": "SENT",
      "toStatus": "SENT",
      "actorId": "user_2",
      "actorRole": "ADMIN",
      "reason": "deadline passed",
      "result": "BLOCKED_BY_GUARD",
      "guardName": "deadlineGuard",
      "createdAt": "2026-08-01T10:05:00Z"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 20
}
```

---

## 7. Database Impact

### 7.1 جديد (بعد اعتماد المقترح)

| الجدول | الغرض | الفهارس |
|--------|-------|---------|
| `WorkflowHistory` | سجل انتقالات موحّد | `[entityType, entityId]`, `[entityId, createdAt]`, `[actorId]` |
| `WorkflowDefinition` (اختياري) | تعريفات قابلة للتكوين | `[name]` unique |

### 7.2 بلا تغيير على الجداول الموجودة

- لا تعديل على `RFQ`, `Quotation`, `PurchaseOrder`, `Award`, `PurchaseRequest`, `Delivery`.
- لا حذف/إعادة تسمية/إسقاط لأي عمود — **إضافة فقط (Additive)**.
- متوافق مع سياسة المزامنة الآمنة (تحليل 0 DROP قبل أي تطبيق).

### 7.3 Migration Plan (خطة الهجرة — إلزامية قبل التنفيذ)

> **قاعدة:** أي إضافة على Prisma Schema تتم **فقط بعد اعتماد Sprint**، وقبل التنفيذ يُعدّ **Migration Plan** ويعرض للمراجعة.

| # | الخطوة | التفاصيل |
|---|--------|----------|
| M-1 | **مراجعة السكيما** | عرض النماذج الجديدة (`WorkflowHistory`, `WorkflowDefinition`) على المستخدم قبل أي تغيير |
| M-2 | **نسخة احتياطية** | `pg_dump` قبل التغيير (نمط `backup-sprint60-<date>.dump`) |
| M-3 | **تحليل أمان** | `prisma migrate diff` + مراجعة SQL المولد (تأكيد 0 DROP/0 DELETE) |
| M-4 | **التطبيق** | `prisma db push --accept-data-loss` (للتطوير) أو Migration Baseline (قبل Beta) |
| M-5 | **التحقق** | `prisma validate` + `prisma generate` + `migrate diff` فارغ + فحص فهارس |
| M-6 | **توثيق** | تسجيل التغيير في الـ Migration Plan وتحديث `technical-debt-register.md` (TD-DB-01 baseline عند الاقتضاء) |

> **ملاحظة:** TD-DB-01 (Prisma Migration Baseline) يبقى مفتوحاً حتى ما قبل Beta/Production — يُراجع بالتوازي مع خطة Sprint 6.0.

---

## 8. Architecture Impact

| العنصر | التأثير |
|--------|---------|
| **حل TD-01** | تثبيت `BaseStateMachine` + `WorkflowEngine` في `shared/workflow/` (موطنه الفعلي) مع shim إعادة تصدير من `procurement/workflow/` (لا كسر للاستيرادات: quality, financial, invoicing, supplier-network, product-catalog, inventory) |
| **`shared/workflow/` قدرة منصة مشتركة** | يستورده الجميع — وفق ADR-002/007؛ محرك عام غير مرتبط بأي Domain |
| **Workflow Governance** | كل State Machine تُسجَّل عبر `shared/workflow` — لا مسارات state machines جديدة داخل النطاقات (W-1..W-7) |
| **Domain Boundaries** | المحرك يدير state/transition/history/guards العامة؛ النطاق يوفّر Guards تجارية عبر callbacks (لا يستورد المحرك قواعد عمل) |
| **RBAC عبر المحرك** | Authorization Guard عامة في `shared/workflow` + مصفوفة أدوار لكل انتقال (انظر §6.2) |
| **ProcurementWorkflowOrchestrator** | ينسّق عبر `prisma` مباشرة داخل procurement (لا استيراد خدمات نطاقات أخرى) |
| **حدود النطاقات** | بلا تغيير: procurement لا يستورد services من نطاقات أخرى |
| **الاختبارات المعمارية** | تحديث: منع استيراد `procurement/workflow` من أي نطاق آخر + إضافة `shared/workflow` كمسار مسموح للجميع + إلزامية التسجيل (A-1..A-6) |
| **Events** | إضافة أحداث جديدة فقط (مراجعة ضد الكتالوج) — لا إعادة تسمية |

### مخطط الطبقات بعد التعديل

```
         ┌──────────────────────────────────────┐
         │  SHARED / WORKFLOW (Platform Capability) │
         │  BaseStateMachine · WorkflowEngine    │
         │  Guards · WorkflowHistoryRecorder     │
         └───────────────────┬──────────────────┘
   (يستورده الجميع عبر shared/workflow)
                             │
  ┌──────────┬──────────┬───────────┬──────────┐
  │Quality   │Financial │Invoicing  │Procurement│
  └──────────┴──────────┴───────────┴──────────┘
```

---

## 9. المخاطر وخطة التراجع (Rollback Plan)

### 9.1 سجل المخاطر

| # | الخطر | الاحتمال | الأثر | التخفيف |
|---|-------|----------|-------|---------|
| R-1 | **كسر استيرادات `procurement/workflow`** عند توجيه الاستيرادات إلى `shared/workflow` مباشرة | متوسط | مرتفع | shim إعادة تصدير متوافق + تحديث تدريجي للاستيرادات + اختبارات معمارية |
| R-2 | **تعارض Guards الجديدة مع تدفقات حالية** (مثلاً فحص الموعد يرفض إرسال RFQ قديم) | متوسط | مرتفع | Guards خلف Feature Flag `NEW_WORKFLOW` (موجود مسبقاً: `feature-flags.ts`) |
| R-3 | **حجم `WorkflowHistory`** ينمو بلا حدود | منخفض | متوسط | فهارس مركبة + سياسة تنظيف (TTL/أرشفة) في Sprint لاحق |
| R-4 | **أتمتة إنشاء PO من Award** تنشئ PO خاطئ | منخفض | مرتفع | إنشاء DRAFT فقط (لا ISSUE تلقائي) + معاينة قبل الإصدار |
| R-5 | **عدم اتساق السجل مع الحالة الفعلية** في الكيانات القديمة | متوسط | متوسط | `HistoryRecorder` يكتب داخل نفس `$transaction` للانتقال |
| R-6 | **محاولة إعادة إنشاء State Machines داخل النطاقات** بعد التوجيه (انحراف عن الحوكمة W-1..W-7) | منخفض | مرتفع | Architecture Tests (A-2) تمنع مسارات state machines جديدة داخل النطاقات |
| R-7 | **تعارض مصفوفة RBAC الجديدة مع الأدوار الحالية** في Phase 1 routes | منخفض | متوسط | RBAC guard خلف Feature Flag؛ اختبار Contract للسلوك 401/403 |

### 9.2 خطة التراجع (Rollback)

| الخطوة | الإجراء |
|--------|---------|
| 1 | تعطيل Feature Flag `NEW_WORKFLOW` → عودة السلوك القديم (إنفاذ المواعيد/الأتمتة تتوقف) |
| 2 | لو فشل التوجيه إلى `shared/workflow/`: إبقاء shim وإرجاع الاستيرادات المتأثرة إلى `procurement/workflow` (الآلات الأصلية لا تتغير) |
| 3 | حذف `WorkflowHistory`/`WorkflowDefinition` يتم بأمان (جداول جديدة فقط — إسقاطها لا يمس البيانات الأساسية) |
| 4 | `prisma db push` عكسي غير مطلوب لأن التغيير Additive فقط |
| 5 | استعادة نسخة احتياطية: `prisma/backup-sprint54-20260731.dump` كملاذ أخير |

---

## 10. خطة الاختبارات

| الفئة | الملف المقترح | عدد الاختبارات المستهدف |
|-------|---------------|------------------------|
| PurchaseRequestStateMachine | `__tests__/PurchaseRequestStateMachine.test.ts` | 20+ |
| EvaluationStateMachine | `__tests__/EvaluationStateMachine.test.ts` | 20+ |
| AwardStateMachine | `__tests__/AwardStateMachine.test.ts` | 20+ |
| WorkflowEngine (definitions/guards/history) | `__tests__/WorkflowEngine.test.ts` | 30+ |
| WorkflowHistoryRecorder | `__tests__/WorkflowHistoryRecorder.test.ts` | 15+ |
| ProcurementWorkflowOrchestrator | `__tests__/ProcurementWorkflowOrchestrator.test.ts` | 25+ |
| **Contract Tests (API)** | `tests/contracts/procurement-workflow.contract.test.ts` | 15+ |
| **Architecture Tests (حدود الاستيراد + منع العودة)** | تحديث `tests/architecture/module-imports.test.ts` | 10+ جديدة |

### Contract Tests (API) — جديد

تُختبر عقود المسارات الجديدة (history/definitions/transition) كاملة:

| # | العقد |
|---|-------|
| C-1 | `GET /workflow/history` يعيد مغلّف `success()` مع `items/total/page/limit` |
| C-2 | `GET /workflow/history/:entityType/:entityId` يعيد سجل الكيان مرتباً زمنياً |
| C-3 | `GET /workflow/definitions` يعيد قائمة التعريفات مع الحالات المسموحة |
| C-4 | `POST /transition` — رفض بدون جلسة (401) |
| C-5 | `POST /transition` — رفض دور غير مصرّح (403) + تسجيل `BLOCKED_BY_GUARD` في الـ History |
| C-6 | `POST /transition` — انتقال صالح يعيد الحالة الجديدة + يُسجَّل في الـ History |
| C-7 | `POST /transition` — انتقال غير صالح (state) → 400 مع رمز خطأ موحّد |
| C-8 | رؤوس/بنية الاستجابة مطابقة لـ `response-envelope` (requestId, timestamp) |
| C-9 | صلاحية الإدخال عبر Zod (`workflow-schemas`) → 400 عند payload خاطئ |
| C-10 | الحفاظ على عقود RFQ/Quotation/PO/Delivery القديمة (لا تغيير في الاستجابة) |

### Architecture Tests (منع عودة الاعتماد) — جديد

| # | القاعدة |
|---|---------|
| A-1 | **لا** يجوز لأي نطاق (quality/financial/invoicing/...) استيراد `procurement/workflow/*` — يجب استخدام `shared/workflow/*` |
| A-2 | `procurement/workflow/` لا يحتوي State Machine جديدة (فقط shim مؤقت، ثم يُحذف) |
| A-3 | كل State Machine مسجلة في `WorkflowEngine` (فحص `register`) |
| A-4 | `shared/workflow/` لا يستورد من أي نطاق تجاري (يستورد `prisma` و`shared/` فقط) |
| A-5 | procurement لا يستورد خدمات من نطاقات أخرى (إبقاء القاعدة الحالية) |
| A-6 | الاختبارات المعمارية القائمة (552) تستمر في النجاح — TD-01 يصبح مغلقاً |
| A-7 | `shared/workflow` لا يستورد أي رموز من `procurement/*` (لا يمس Domain Business Logic — §3.1b) |

### معايير صحة الاختبارات

- كل الاختبارات القديمة (1073 + 552) تستمر في النجاح دون تعديل منطقها.
- لا `any` في كود الإنتاج الجديد.
- Guards تُختبر في الحالتين (نجاح/فشل) لكل انتقال.
- History يُتحقق من كتابته داخل نفس المعاملة.
- Contract tests تعمل ضد واجهة الخدمة الحقيقية (Prisma mock) — لا مسارات وهمية.

---

## 11. Acceptance Criteria (معايير القبول)

| # | المعيار |
|---|---------|
| AC-1 | `shared/workflow/` هو موطن المحرك وكل النطاقات (procurement, quality, financial, invoicing, supplier-network, product-catalog, inventory) تستورده — TD-01 مغلق |
| AC-2 | 3 آلات جديدة (PR, Evaluation, Award) مسجلة في `WorkflowEngine` (في `shared/workflow`) مع اختبارات ≥ 20 لكل منها |
| AC-3 | `WorkflowHistory` يسجل كل انتقال ناجح ومرفوض في نفس المعاملة — مع Audit كامل (actorId, actorRole, fromStatus, toStatus, reason, result, createdAt) |
| AC-4 | إنفاذ موعد RFQ يعمل: رفض `send` بعد الموعد + إغلاق تلقائي عند تجاوزه |
| AC-5 | Award ACCEPTED → إنشاء PO DRAFT تلقائي عبر Orchestrator (اختبار يثبت ذلك) |
| AC-6 | جميع الاختبارات القديمة تمر (1073 unit + 552 architecture) + 0 TypeScript errors |
| AC-7 | أحداث جديدة منشورة عبر Event Bus بنفس النمط (envelope + version) — بعد مراجعة أسمائها ضد `events-catalog.md` |
| AC-8 | الوثائق محدّثة: ADR-012، phase-3 plan، events-catalog، capability-map، technical-debt-register (TD-01 → مغلق) |
| AC-9 | قاعدة البيانات متزامنة (إضافة فقط) عبر **Migration Plan معتمد مسبقاً** (backup + تحليل 0 DROP + validate/generate) |
| AC-10 | لا تغيير في عقود API الموجودة — مسارات RFQ/Quotation/PO/Delivery تبقى كما هي |
| AC-11 | **Workflow Governance:** أي State Machine جديدة تُسجَّل عبر `shared/workflow` فقط — لا نسخ داخل Domain |
| AC-12 | **Domain Boundaries:** المحرك عام (لا يعرف RFQ/Quotation/PO) والنطاق يحتفظ بقواعد العمل — مثبت عبر Architecture Tests (A-7) |
| AC-13 | **RBAC:** كل انتقال يحدد المنفّذ المسموح (Requester/Supplier/Evaluator/Admin/System) — محاولة غير مصرّحة → 403 + `BLOCKED_BY_GUARD` في History |
| AC-14 | **Contract Tests:** عقود مسارات workflow (history/definitions/transition) موثّقة ومختبَرة (C-1..C-10) |
| AC-15 | **Architecture Tests:** منع العودة — لا نطاق يستورد `procurement/workflow/*` (A-1..A-6) |

---

## 12. قائمة الملفات المتوقع إنشاؤها أو تعديلها

### 🔜 ملفات جديدة (إنشاء)

| الملف | الغرض |
|-------|-------|
| `src/modules/shared/workflow/WorkflowGuards.ts` | نظام شروط مسبقة عامة |
| `src/modules/shared/workflow/WorkflowHistoryRecorder.ts` | تسجيل الانتقالات في Prisma (Audit كامل) |
| `src/modules/shared/workflow/WorkflowGuard.ts` | الـ guards العامة (authorization/deadline/completeness) |
| `src/modules/procurement/workflow/state-machines/PurchaseRequestStateMachine.ts` | آلة PR — تعريف خاص بالنطاق، يُسجَّل في محرك `shared/workflow` (حوكمة W-2) |
| `src/modules/procurement/workflow/state-machines/EvaluationStateMachine.ts` | آلة التقييم — تعريف خاص بالنطاق |
| `src/modules/procurement/workflow/state-machines/AwardStateMachine.ts` | آلة الترسية — تعريف خاص بالنطاق |
| `src/modules/procurement/services/ProcurementWorkflowOrchestrator.ts` | المنسّق بين الكيانات (يستدعي المحرك) |
| `src/modules/procurement/services/WorkflowHistoryService.ts` | واجهة قراءة/استعلام السجل |
| `src/modules/procurement/validators/workflow-schemas.ts` | Zod schemas لـ history/transition |
| `src/app/api/v1/procurement/workflow/history/route.ts` | API سجل الانتقالات |
| `src/app/api/v1/procurement/workflow/definitions/route.ts` | API التعريفات |
| `src/modules/procurement/__tests__/ProcurementWorkflowOrchestrator.test.ts` | اختبارات |
| `src/modules/shared/workflow/__tests__/WorkflowEngine.test.ts` | اختبارات المحرك |
| `src/modules/shared/workflow/__tests__/WorkflowHistoryRecorder.test.ts` | اختبارات السجل |
| `src/modules/procurement/workflow/__tests__/PurchaseRequestStateMachine.test.ts` | اختبارات آلة PR (≥20) |
| `src/modules/procurement/workflow/__tests__/EvaluationStateMachine.test.ts` | اختبارات آلة التقييم (≥20) |
| `src/modules/procurement/workflow/__tests__/AwardStateMachine.test.ts` | اختبارات آلة الترسية (≥20) |
| `tests/contracts/procurement-workflow.contract.test.ts` | Contract Tests (API) C-1..C-10 |
| `tests/architecture/workflow-boundaries.test.ts` | Architecture Tests (A-1..A-7) — منع العودة |

### 🔄 ملفات قابلة للتعديل

| الملف | التعديل |
|-------|---------|
| `src/modules/shared/workflow/BaseStateMachine.ts` | تحسين (Guards hooks) + توثيق Generic |
| `src/modules/shared/workflow/WorkflowEngine.ts` | ترقية: definitions + guards + history + RBAC guard |
| `src/modules/shared/workflow/WorkflowContext.ts` | توسيع (metadata) |
| `src/modules/shared/workflow/WorkflowTransition.ts` | توسيع (metadata, actorRole) |
| `src/modules/shared/workflow/index.ts` | Barrel + تسجيل الآلات |
| `src/modules/procurement/workflow/index.ts` | شيم إعادة تصدير من `shared/workflow` (يُحذف لاحقاً — A-2) |
| `src/modules/procurement/workflow/BaseStateMachine.ts` (مؤقت) | re-export (يُحذف لاحقاً) |
| `src/modules/procurement/workflow/WorkflowEngine.ts` (مؤقت) | re-export (يُحذف لاحقاً) |
| `src/modules/procurement/services/RFQService.ts` | استخدام Guards الجديدة + تسجيل History |
| `src/modules/procurement/services/EvaluationService.ts` | آلة Evaluation + Guard اكتمال المعايير |
| `src/modules/procurement/services/PurchaseRequestService.ts` | آلة PR (بدل الفحوصات المضمّنة) |
| `src/modules/procurement/services/PurchaseOrderService.ts` | استقبال إنشاء PO من Orchestrator |
| `src/modules/procurement/index.ts` | تصدير الآلات/المحرك الجديدة |
| `prisma/schema.prisma` | إضافة `WorkflowHistory` (+`WorkflowDefinition` اختياري) — **بعد الاعتماد فقط** |
| `src/modules/shared/errors/procurement.errors.ts` | رموز أخطاء جديدة (عملية/توثيق) |
| `src/modules/shared/events/types.ts` | أحداث جديدة |
| `src/modules/shared/utils/feature-flags.ts` | `NEW_WORKFLOW` (موجود) — توثيق الاستخدام |
| `tests/architecture/module-imports.test.ts` | قواعد `shared/workflow` + إزالة انتهاك TD-01 |
| `docs/architecture/adr/ADR-012-workflow-engine.md` | تحديث الحالة (توجيه إلى `shared/workflow`) |
| `docs/architecture/phase-3-transaction-execution-plan.md` | إنشاء/تحديث خطة المرحلة |
| `docs/architecture/events-catalog.md` | الأحداث الجديدة |
| `docs/architecture/capability-map.md` | تحديث قدرات Procurement |
| `docs/architecture/technical-debt-register.md` | إغلاق TD-01 (تصحيح المسار إلى `shared/workflow`) |

---

## ملاحظات ختامية

1. **لا تنفيذ** لأي كود أو تعديل على `prisma/schema.prisma` أو Domain حتى اعتماد هذا المقترح.
2. إضافة `WorkflowHistory`/`WorkflowDefinition` إلى السكيما هي **خطوة تالية بعد الاعتماد** وتُعرض كتحديث منفصل (تغيير Schema) للمراجعة.
3. كل الانتقالات الجديدة Additive — لا كسر للـ Phase 1 ولا لـ Phase 2 (Marketplace RFQ Gateway يبقى يعمل).
4. هذا المقترح يُمهد لـ Sprint AI (Matching Engine) عبر عزل Guards/Orchestration القابلة للتوسع.

---

*أُعدّ هذا المقترح بواسطة AI Agent في 2026-08-01 — بانتظار اعتماد المستخدم قبل بدء Sprint 6.0.*
