# Sprint AI-0 · Deliverable 2 — Event Consumption Pattern

> **المسار:** AI & Integration Layer — Sprint AI-0
> **الحالة:** 📝 مواصفة — جاهزة للاعتماد
> **يخدم القرارات:** G2 (AI يستهلك Events عبر Event Bus — Outbox مسؤولية Domains/Gateway)

---

## 1. الغرض

توحيد طريقة استهلاك نطاق AI لأحداث النطاقات التجارية عبر `eventBus` (ADR-004)، مع ضمان: الـ Idempotency، المعالجة غير المتزامنة للعمل الثقيل، الفشل الصامت للأخطاء، وتتبع ما تمت معالجته.

## 2. مبدأ G2

- **AI يستهلك الأحداث فقط** — لا يقرأ Outbox، ولا يكتب فيه.
- **Outbox** ملك Domains/Gateway (التكاملات الخارجية) — خارج نطاق AI.
- AI يعالج الحدث ويُحدِّث **بياناته المشتقة** فقط (متجهات/إشارات/فهارس).

## 3. موقع الـ Handlers

```
modules/ai/
├── events/
│   ├── register.ts            # تسجيل المشتركين عند تشغيل التطبيق
│   ├── handlers/
│   │   ├── product.handlers.ts      # أحداث ProductCatalog.*
│   │   ├── supplier.handlers.ts     # أحداث SupplierNetwork.*
│   │   ├── inventory.handlers.ts    # أحداث Inventory.*
│   │   ├── marketplace.handlers.ts  # أحداث Marketplace.*
│   │   └── procurement.handlers.ts  # أحداث Procurement.* (استهلاك فقط)
│   ├── dedupe.ts              # حارس الـ Idempotency
│   └── ai-events.ts           # أحداث AI الصادرة (AI.*)
```

**التسجيل:** دالة `registerAiEventHandlers()` تُستدعى من `instrumentation.ts` (نمط موحّد موجود) — لا تسجيل تلقائي مخفي.

## 4. نمط الـ Handler (عقد)

```typescript
// modules/ai/events/handlers/base.ts (مواصفة)
async function createAiEventHandler(
  eventName: string,
  options: {
    version: number;              // ADR-014: تحقق من الإصدار
    work: 'inline' | 'async';     // خفيف inline / ثقيل عبر AiJob
    onEvent: (event: IEvent) => Promise<void>;
  }
): EventHandler {
  return async (event) => {
    if (event.version !== options.version) {
      logger.warn('AI handler: version mismatch, skipped', { eventName, version: event.version });
      return;
    }
    const dedupeKey = buildDedupeKey(eventName, event);
    if (await dedupe.isProcessed(dedupeKey)) return;   // Idempotency
    try {
      if (options.work === 'async') {
        await AiJobService.enqueue({ eventName, payload: event.payload, metadata: event.metadata });
        await dedupe.mark(dedupeKey, 'enqueued');
        return;
      }
      await options.onEvent(event);
      await dedupe.mark(dedupeKey, 'done');
    } catch (err) {
      // ADR-004: الأخطاء تُسجَّل ولا تُسقط الـ publisher (Fail Silent)
      logger.error(`AI handler failed for ${eventName}`, { error: String(err), correlationId: event.metadata.correlationId });
    }
  };
}
```

### قواعد إلزامية

| القاعدة | المرجع |
|---------|--------|
| التحقق من `event.version` قبل المعالجة | ADR-014 |
| الـ Handler **Idempotent** (حارس dedupe بالمفتاح `eventName + entityId + correlationId`) | ADR-004 |
| العمل الثقيل → `AiJob` (لا يُنفَّذ داخل الـ Handler) | ADR-004 (أداء) |
| فشل الـ Handler لا يُسقط الـ Publisher | ADR-004 |
| لا يكتب الـ Handler في نطاقات أخرى | G1/G2 |

## 5. مصفوفة الأحداث المستهلكة (Subscription Matrix)

| الحدث (المصدر) | الإصدار | العمل | رد الفعل في AI |
|----------------|---------|-------|----------------|
| `ProductCatalog.Product.Published` | 1 | async | إنشاء/تحديث `AiEmbedding` للمنتج |
| `ProductCatalog.Product.Archived` | 1 | async | تعطيل المتجه |
| `ProductCatalog.Offering.Created` | 1 | async | توليد متجه العرض |
| `ProductCatalog.Offering.PriceChanged` | 1 | inline | تحديث `PriceIndex` + إعادة ترتيب |
| `ProductCatalog.Offering.Discontinued` | 1 | inline | تحديث الفهارس |
| `SupplierNetwork.Profile.Completed` | 1 | async | توليد متجه المورد |
| `SupplierNetwork.Verification.Upgraded` | 1 | inline | تحديث مؤشر الثقة + المتجه |
| `SupplierNetwork.Rating.Submitted` | 1 | inline | تحديث إشارات الجودة |
| `Inventory.Stock.LowStockAlert` | 1 | inline | تحديث توفر التوصيات/البحث |
| `Inventory.Stock.Updated` | 1 | inline | تحديث التوفر |
| `Marketplace.RFQ.Initiated` | 1 | inline | تسجيل `FeatureSignal(RFQ)` |
| `Marketplace.Review.Submitted` | 1 | inline | إشارة جودة + إعادة تضمين |
| `Marketplace.Favorite.Added` | 1 | inline | إشارة تفضيل |
| `Procurement.Quotation.Submitted` | 1 | inline | تحديث `PriceIndex` + إشارة |
| `Procurement.Award.Created` | 1 | inline | إشارة تحويل ناجح |
| `Procurement.PO.Issued` | 1 | inline | إشارة طلب فعلي |

> المصدر: `events-catalog.md` — هذه القائمة تُحدَّث عند كل مرحلة (Sprint AI-1/2 تضيف أحداثاً جديدة).

## 6. أحداث AI الصادرة (AI.*)

| الحدث | المحفز | الغرض |
|-------|--------|-------|
| `AI.Job.Created` / `.Completed` / `.Failed` | دورة حياة AiJob | مراقبة المعالجة |
| `AI.Embedding.Updated` | تحديث متجه | إعلام Analytics/Search |
| `AI.Match.Generated` | نتيجة مطابقة | سجل للتقييم |
| `AI.Recommendation.Served` | توصية عُرضت | قياس CTR لاحقاً |
| `AI.Feedback.Recorded` | ملاحظة مستخدم | تحسين النماذج |
| `AI.Analysis.Completed` | اكتمال تحليل | إشعار للمستخدم |

**قاعدة:** أحداث AI تُنشر عبر نفس `eventBus` وبنفس `buildEventName(domain, entity, action)` (ADR-013) و `version` (ADR-014).

## 7. حارس الـ Idempotency (dedupe)

| البند | المواصفة |
|-------|----------|
| المفتاح | `hash(eventName + entityId + correlationId)` |
| المخزن | جدول `AiProcessedEvent` (نطاق AI) — TTL أسبوعي |
| السلوك | مفتاح موجود → تجاهل؛ فشل → لا يُسجَّل (يُعاد عند إعادة الإرسال) |
| الملاحظة | EventEmitter At-Most-Once (ADR-004)؛ الحارس وقاية إضافية عند الانتقال لـ At-Least-Once مستقبلاً |

## 8. اختبارات النمط (عقود للتنفيذ)

| الاختبار | الحالة |
|----------|--------|
| معالجة حدث بنسخة غير متوقعة → تجاهل مع تحذير | مخطط |
| تكرار نفس الحدث → معالجة واحدة فقط | مخطط |
| فشل الـ Handler → لا ينهار الـ publisher | مخطط |
| عمل ثقيل → يُنشأ `AiJob` بدل التنفيذ inline | مخطط |
| اختبار معماري: AI لا يكتب في نطاقات أخرى | مخطط |

## 9. قبول التسليم

| # | المعيار |
|---|---------|
| 1 | نمط الـ Handler موحّد ومعتمد |
| 2 | مصفوفة الاشتراك مرجعية وموقعة مع مالكي النطاقات |
| 3 | حارس Idempotency معتمد |
| 4 | أحداث AI الصادرة محددة ومسجلة في سجل الأحداث (عند التنفيذ) |
| 5 | لا يلمس Outbox — التزام G2 |
