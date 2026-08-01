# Sprint 6.0 — Domain State Machines (PR / Evaluation / Award)

> **المرحلة:** Phase 3 — Orchestrator + Guards Enforcement + Workflow History Layer + API Routes  
> **التاريخ:** 2026-08-01  
> **المبدأ:** `shared/workflow` = Runtime + Lifecycle Mechanics (عام) — Procurement = Business Rules + Domain Guards (تعريفات خاصة بالنطاق مُسجَّلة في المحرك)  
> **الموقع:** `src/modules/procurement/workflow/state-machines/`

---

## 1. PurchaseRequestStateMachine

**الملف:** `PurchaseRequestStateMachine.ts` — **التسجيل في المحرك:** `workflowEngine.register('PurchaseRequest', ...)`

### الحالات (States)

| الحالة | المعنى | نهائية؟ |
|--------|--------|---------|
| `DRAFT` | مسودة طلب شراء (يمكن تعديلها) | لا |
| `PENDING_APPROVAL` | بانتظار اعتماد/رفض | لا |
| `APPROVED` | معتمد — جاهز للتحويل لـ RFQ | لا |
| `REJECTED` | مرفوض | نعم |
| `ORDERED` | تم إنشاء طلب شراء منه | نعم |

### الانتقالات (Transitions)

```
DRAFT ──submit──▶ PENDING_APPROVAL ──approve──▶ APPROVED ──order──▶ ORDERED
                         └──reject──▶ REJECTED
```

| من | الانتقال | إلى |
|----|----------|-----|
| `DRAFT` | `submit` | `PENDING_APPROVAL` |
| `PENDING_APPROVAL` | `approve` | `APPROVED` |
| `PENDING_APPROVAL` | `reject` | `REJECTED` |
| `APPROVED` | `order` | `ORDERED` |

### Guards

| الانتقال | Guard | النوع |
|----------|-------|-------|
| `submit` | المالك (Requester) فقط يمكنه التقديم — `requestedById === actorId` | Domain Guard (في الخدمة) |
| `approve` / `reject` | الصلاحية: BUYER / ADMIN — `requestedById ≠ actorId` (لا يوافق الطالب على طلبه) | Domain Guard (RBAC) |
| `order` | يتطلب أن يكون PR معتمداً `APPROVED` | Domain Guard (State precondition) |

### الأحداث الناتجة (Events)

| الحدث | عند |
|-------|-----|
| `Procurement.PR.Submitted` | `submit` |
| `Procurement.PR.Approved` | `approve` |
| `Procurement.PR.Rejected` | `reject` |

### RBAC لكل انتقال

| الانتقال | المنفّذ المسموح |
|----------|----------------|
| `submit` | الطالب (Requester) — `requestedById` |
| `approve` | BUYER، ADMIN |
| `reject` | BUYER، ADMIN |
| `order` | BUYER، ADMIN، System (Orchestrator) |

---

## 2. EvaluationStateMachine

**الملف:** `EvaluationStateMachine.ts` — **التسجيل:** `workflowEngine.register('Evaluation', ...)`

### الحالات (States)

| الحالة | المعنى | نهائية؟ |
|--------|--------|---------|
| `PENDING` | لم تبدأ | لا |
| `IN_PROGRESS` | جارٍ تقييم العروض (تسجيل درجات) | لا |
| `COMPLETED` | اكتمل التقييم — جاهز لطلب الاعتماد | نعم |

### الانتقالات (Transitions)

```
PENDING ──start──▶ IN_PROGRESS ──score──▶ IN_PROGRESS (تحديث درجات)
                        └──complete──▶ COMPLETED
```

| من | الانتقال | إلى |
|----|----------|-----|
| `PENDING` | `start` | `IN_PROGRESS` |
| `IN_PROGRESS` | `score` | `IN_PROGRESS` (self) |
| `IN_PROGRESS` | `complete` | `COMPLETED` |

### Guards

| الانتقال | Guard | النوع |
|----------|-------|-------|
| `start` | العائد/العرض يجب أن يكون `SUBMITTED` | Domain Guard |
| `score` | المقيّم المعيّن فقط (`evaluatorId === actorId`) + كل درجة ≤ `maxScore` | Domain Guard + Completeness |
| `complete` | المقيّم المعيّن فقط + وجود درجات | Domain Guard + Completeness |

### الأحداث الناتجة (Events)

| الحدث | عند |
|-------|-----|
| `Procurement.Evaluation.Started` | `start` |
| `Procurement.Evaluation.Scored` | `score` |
| `Procurement.Evaluation.Completed` | `complete` |

### RBAC لكل انتقال

| الانتقال | المنفّذ المسموح |
|----------|----------------|
| `start` | المقيّم المعيّن (Evaluator) |
| `score` | المقيّم المعيّن (Evaluator) |
| `complete` | المقيّم المعيّن (Evaluator) |

---

## 3. AwardStateMachine

**الملف:** `AwardStateMachine.ts` — **التسجيل:** `workflowEngine.register('Award', ...)`

### الحالات (States)

| الحالة | المعنى | نهائية؟ |
|--------|--------|---------|
| `PENDING_ACCEPTANCE` | الترسية صدرت وتبقّى قبول المورّد | لا |
| `ACCEPTED` | قبل المورّد — جاهز لإنشاء PO | نعم |
| `DECLINED` | رفض المورّد الترسية | نعم |
| `CANCELLED` | أُلغيت الترسية | نعم |

### الانتقالات (Transitions)

```
PENDING_ACCEPTANCE ──accept──▶ ACCEPTED
        ├──decline──▶ DECLINED
        └──cancel──▶ CANCELLED
```

| من | الانتقال | إلى |
|----|----------|-----|
| `PENDING_ACCEPTANCE` | `accept` | `ACCEPTED` |
| `PENDING_ACCEPTANCE` | `decline` | `DECLINED` |
| `PENDING_ACCEPTANCE` | `cancel` | `CANCELLED` |

### Guards

| الانتقال | Guard | النوع |
|----------|-------|-------|
| `accept` | المورّد المعيّن فقط (`supplierId === actorId`) | Domain Guard (RBAC) |
| `decline` | المورّد المعيّن فقط (`supplierId === actorId`) | Domain Guard (RBAC) |
| `cancel` | المُرسى (awarder) أو BUYER/ADMIN | Domain Guard (RBAC) |

### الأحداث الناتجة (Events)

| الحدث | عند | الحالة |
|-------|-----|--------|
| `Procurement.Award.Created` | إنشاء الترسية (RFQ award) | موجود |
| `Procurement.Award.Accepted` | `accept` | ✅ عبر Orchestrator (Phase 3) |
| `Procurement.Award.Declined` | `decline` | ✅ عبر Orchestrator (Phase 3) |
| `Procurement.Award.Cancelled` | `cancel` | ✅ عبر Orchestrator (Phase 3) |

### RBAC لكل انتقال

| الانتقال | المنفّذ المسموح |
|----------|----------------|
| `accept` | المورّد المعيّن (Supplier) |
| `decline` | المورّد المعيّن (Supplier) |
| `cancel` | المُرسي (Awarder) / BUYER / ADMIN |

---

## 4. ملاحظات عامة (الالتزام بالفصل)

- **الآلات الثلاث** تُعرَّف في `procurement/workflow/state-machines/` (خاصة بالنطاق) وتُسجَّل في محرك `shared/workflow` (عام).
- **المحرك** يدير lifecycle mechanics فقط — لا يعرف RFQ/PR/PO (يتعامل مع `entityType` + `entityId`).
- **النطاق** يوفّر Guards التجارية عبر callbacks في الخدمات/Orchestrator — لا تُكتب داخل المحرك.
- **WorkflowHistoryRecorder**: حالياً `InMemoryWorkflowHistoryRecorder` للاختبارات — يُستبدل بتنفيذ Prisma بعد اعتماد Migration Plan (لا تغيير في واجهة المحرك).
- **Feature Flag `NEW_WORKFLOW`** (موجود في `feature-flags.ts`) يحيط بتفعيل الإنفاذ/الأتمتة عند الربط في الخدمات.

---

## 5. Phase 3 — Orchestrator + Guards + History + API

### 5.1 ProcurementWorkflowOrchestrator

**الملف:** `src/modules/procurement/services/ProcurementWorkflowOrchestrator.ts`

مسؤول عن تنسيق دورة Workflow الكاملة بدون تجاوز المحرك:

1. **تحميل الحالة الحالية** من Prisma عبر `EntityStatusPort` (تعريف + تنفيذ `PrismaEntityStatusPort`).
2. **تشغيل آلة الحالة + تطبيق Guards** عبر `workflowEngine.execute(name, status, action, context)` مع `WorkflowContext` يحمل: `entityType`, `entityId`, `userId` (actorId), `actorRole`, `reason`, `metadata`.
3. **حفظ الحالة الجديدة** بعد نجاح الانتقال (`persistStatus`).
4. **إصدار الأحداث** المناسبة بعد النجاح فقط (عبر `IEventBus`).
5. **إنشاء PO من Award مقبول** عبر `createPOFromAward(awardId, actorId)` — `Procurement.Award.Accepted` → PO `DRAFT`.

**النتائج الممكنة من `execute`:**

| النتيجة | المعنى | HTTP في الـ Route |
|---------|--------|-------------------|
| `SUCCESS` | تم الانتقال + الحفظ + الحدث | `200` |
| `BLOCKED_BY_GUARD` | Guard رفض الانتقال (لا يُحفظ ولا يُصدر حدث) | `403` |
| `INVALID_TRANSITION` | انتقال غير مسموح من الحالة الحالية | `409` |

### 5.2 تسجيل Guards لكل انتقال

**الملف:** `src/modules/procurement/workflow/guards/procurement-guards.ts` (`registerProcurementGuards`)  
**التسجيل في المحرك:** `src/modules/procurement/workflow/definitions.ts` (`registerProcurementDefinitions`) — يربط كل انتقال بـ Guard عبر `guards` map في `WorkflowDefinition`.

| Guard | الانتقالات المطبّقة | القاعدة |
|-------|---------------------|---------|
| `pr.submit.owner` | `PurchaseRequest.submit` | `metadata.requesterId === actorId` |
| `pr.approve.rbac` | `PurchaseRequest.approve` | BUYER/ADMIN/SUPER_ADMIN |
| `pr.reject.rbac` | `PurchaseRequest.reject` | BUYER/ADMIN/SUPER_ADMIN |
| `pr.order.rbac` | `PurchaseRequest.order` | BUYER/ADMIN/SUPER_ADMIN |
| `eval.complete.completeness` | `Evaluation.complete` | `metadata.scoreCount >= 1` |
| `award.accept.rbac` | `Award.accept` | `metadata.supplierId === actorId` |
| `award.decline.rbac` | `Award.decline` | `metadata.supplierId === actorId` |
| `award.cancel.rbac` | `Award.cancel` | BUYER/ADMIN/SUPER_ADMIN |
| `rfq.deadline` | RFQ (احتياطي) | رفض بعد `metadata.deadlineDate` |

> **ملاحظة الفصل:** أسماء الـ Guards عادية (`pr.approve.rbac`) والقواعد (callbacks) منفصلة — `shared/workflow` لا يعرف أي شيء عن أدوار/كيانات Procurement.

### 5.3 WorkflowHistoryService

**الملف:** `src/modules/procurement/services/WorkflowHistoryService.ts`

- يعتمد على واجهة `WorkflowHistoryRecorder` فقط (لا Prisma).
- `record(...)` يكتب عبر الـ Interface؛ `list({ entityType, entityId, page, limit })` يرجع ترقيم صفحات.
- `getRecorder()` يوفّر الـ Recorder لمحرك `WorkflowEngine` (عبر `setHistoryRecorder`) بحيث تُسجَّل كل انتقالات المحرك في نفس المخزن.
- الاستبدال اللاحق بـ Prisma Recorder لا يغيّر الخدمة.

### 5.4 API Routes

| Route | الأسلوب | الوصف | RBAC |
|-------|---------|-------|------|
| `/api/v1/procurement/workflow/transition` | `POST` | تنفيذ انتقال عبر Orchestrator (لا يتجاوز المحرك) | Guard في المحرك + مصادقة |
| `/api/v1/procurement/workflow/history` | `GET` | سجل الانتقالات (ترقيم صفحات + فلترة entityType/entityId) | مصادقة |
| `/api/v1/procurement/workflow/definitions` | `GET` | تعريفات الآلات المسجّلة (states/transitions/guards) | مصادقة |

**زمنيا (Transition Request Body):** `{ entityType, entityId, action, reason?, metadata? }` — يُمرَّر `actorId`/`actorRole` من الجلسة.

### 5.5 اختبارات Phase 3

| الملف | المحتوى |
|-------|---------|
| `ProcurementWorkflowOrchestrator.test.ts` | 14 اختباراً: انتقالات PR/Evaluation/Award، Guards، History، أحداث |
| `WorkflowHistoryService.test.ts` | 7 اختبارات: record/list/pagination/filter |
| `tests/contracts/procurement-workflow.contract.test.ts` | 7 اختبارات: مصادقة، Validation 422، 403، 409، 200 |
| `tests/architecture/workflow-boundaries.test.ts` | W-7: `shared/workflow` بلا أي استيراد Domain + بلا Prisma |
