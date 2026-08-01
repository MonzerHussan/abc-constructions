# 05 — API Integration Strategy (استراتيجية تكامل الـ APIs)

> **المسار:** AI & Integration Layer
> **الدور:** Programmer 4
> **الحالة:** 📝 مقترح قيد الدراسة
> **التاريخ:** 2026-07-31
> **يعتمد على:** ADR-006 (API Standards), ADR-005 (Module Structure), ADR-008 (Cross-Cutting)

---

## 1. المبادئ

| # | المبدأ |
|---|--------|
| 1 | كل واجهاتنا الداخلية/الجديدة تتبع **Response Envelope + Pagination + Error Codes** (ADR-006) |
| 2 | **إضافة فقط** — لا تعديل على مسارات `/api/v1/*` الموجودة |
| 3 | الواجهات الجديدة تحت بادئة واضحة: `/api/v1/ai/*` و`/api/v1/integrations/*` |
| 4 | المكالمات الخارجية تمر عبر Gateway فقط (لا توجد مكالمة مباشرة من Service خارجي) |
| 5 | نسخ/إصدار: تبدأ بإصدار `v1` وتتوسع `v2` حسب الحاجة دون كسر |
| 6 | استهلاك السعر/التكلفة والامتثال: كل استدعاء نموذج أو بوابة يُسجَّل |

---

## 2. واجهات نطاق AI المقترحة

### 2.1 Supplier Matching

| Method | Path | الوصف |
|--------|------|-------|
| POST | `/api/v1/ai/supplier-matching/match` | مطابقة موردين لـ RFQ/بنود (متزامنة أو غير متزامنة) |
| GET | `/api/v1/ai/supplier-matching/:matchId` | نتيجة مطابقة محفوظة مع الأسباب |
| POST | `/api/v1/ai/supplier-matching/:matchId/feedback` | ملاحظة المستخدم (قبول/رفض) |

**مثال للطلب:**
```json
{
  "rfqId": "rfq_xxx",
  "orgId": "org_xxx",
  "includeReasons": true,
  "limit": 10
}
```

**مثال للاستجابة (وفق ADR-006):**
```json
{
  "success": true,
  "data": [
    {
      "supplierId": "sup_xxx",
      "score": 0.92,
      "reasons": [
        "مطابقة دلالية عالية لقدرة: حديد تسليح",
        "التحقق: VERIFIED",
        "يغطي الرياض ويسلّم خلال 5 أيام",
        "متوسط السعر أقل من السوق بـ 8%"
      ],
      "breakdown": { "semantic": 0.95, "rules": 1.0, "price": 0.85, "delivery": 0.9, "rating": 0.8 }
    }
  ],
  "meta": { "timestamp": "2026-07-31T00:00:00Z", "requestId": "req_xxx" }
}
```

### 2.2 التوصيات

| Method | Path | الوصف |
|--------|------|-------|
| GET | `/api/v1/ai/recommendations/products?orgId=&context=` | توصيات منتجات |
| GET | `/api/v1/ai/recommendations/suppliers?orgId=&categoryId=` | توصيات موردين |
| POST | `/api/v1/ai/recommendations/:id/feedback` | ملاحظة على التوصية |

### 2.3 تحليل المناقصات / BOQ

| Method | Path | الوصف |
|--------|------|-------|
| POST | `/api/v1/ai/tenders/:tenderId/analyze` | تحليل مناقصة (غير متزامن) |
| GET | `/api/v1/ai/tenders/:tenderId/analysis` | نتيجة التحليل |
| POST | `/api/v1/ai/boq/extract` | استخراج BOQ من ملف (راجع 2.4) |
| POST | `/api/v1/ai/boq/estimate` | تقدير تكلفة لبنود موحّدة |

### 2.4 الاستخراج والمهام غير المتزامنة

| Method | Path | الوصف |
|--------|------|-------|
| POST | `/api/v1/ai/extraction` | إنشاء مهمة استخراج (PDF/Excel/Image) |
| GET | `/api/v1/ai/jobs/:jobId` | حالة المهمة + النتيجة |
| POST | `/api/v1/ai/jobs/:jobId/retry` | إعادة تشغيل مهمة فاشلة |

### 2.5 مساعد البحث

| Method | Path | الوصف |
|--------|------|-------|
| POST | `/api/v1/ai/search` | استعلام طبيعي → نتائج منظمة |
| GET | `/api/v1/ai/search/suggestions?q=` | اقتراحات أثناء الكتابة |

### 2.6 ذكاء الأسعار

| Method | Path | الوصف |
|--------|------|-------|
| GET | `/api/v1/ai/pricing/index?productId=|categoryId=&period=` | مؤشر السعر المجمّع |
| GET | `/api/v1/ai/pricing/alerts?orgId=` | تنبيهات انحراف السعر |
| POST | `/api/v1/ai/pricing/estimate` | تقدير سعر عادل لمورد (اختياري) |

---

## 3. واجهات بوابة التكاملات المقترحة

### 3.1 إدارة الاتصالات (أدمن)

| Method | Path | الوصف |
|--------|------|-------|
| GET/POST | `/api/v1/integrations/connectors` | قائمة/إنشاء اتصال |
| GET/PUT | `/api/v1/integrations/connectors/:id` | تفاصيل/تحديث |
| POST | `/api/v1/integrations/connectors/:id/activate` | تفعيل/تعطيل |
| GET | `/api/v1/integrations/connectors/:id/health` | صحة الاتصال |

### 3.2 نقاط استقبال Webhooks

| Method | Path | الوصف |
|--------|------|-------|
| POST | `/api/v1/integrations/webhooks/:provider` | استقبال أحداث خارجية (توقيع/Idempotency) |

> `:provider` = `erp` | `inventory-sync` | `payment` | `logistics` | `government` | `manufacturer`

### 3.3 عمليات تشغيل يدوية

| Method | Path | الوصف |
|--------|------|-------|
| POST | `/api/v1/integrations/sync/inventory?supplierId=` | مزامنة مخزون يدوية |
| POST | `/api/v1/integrations/sync/products?supplierId=` | مزامنة عروض/منتجات |
| POST | `/api/v1/integrations/logistics/rates` | استعلام أسعار شحن |
| POST | `/api/v1/integrations/verification/register` | استعلام تحقق حكومي |
| GET | `/api/v1/integrations/outbox` | (داخلي) فحص سجل المزامنة |

---

## 4. معايير الأمان للـ APIs

| البند | القيمة المقترحة |
|-------|-----------------|
| المصادقة | NextAuth v5 + RBAC؛ صلاحيات `ai:use`, `integrations:manage` (إضافة مقترحة في Permission) |
| مفاتيح الويب هوك الخارجية | سر مشترك/توقيع لكل موفر |
| Idempotency | `Idempotency-Key` مطلوب لطلبات الدفع/المزامنة |
| Rate Limiting | لكل مفتاح/منظمة (اختياري، مرحلي) |
| الحجم | حد أقصى لأحجام الملفات في الاستخراج |
| البيانات الحساسة | لا تُمرَّر بطاقات/سجلات كاملة في السجلات |

---

## 5. اختبار التكامل (Strategy)

| المستوى | النهج |
|---------|-------|
| **Unit** | اختبار `AiProviderAdapter` (Mock)، `AiJobService`، `ConnectorRegistry` |
| **Contract** | اختبار عقود كل Connector ضد Stubs (سجلات VCR) |
| **Integration** | تشغيل محلي لبوابات Sandbox (Stripe test mode, Odoo demo, ZATCA sandbox) |
| **Architecture** | إضافة اختبارات معمارية: نطاق AI لا يستورد خدمات النطاقات، ولا Prisma من نطاق آخر (نمط ADR-007/550+ اختبارات حالية) |
| **E2E** | سيناريو كامل: منتج → عرض → RFQ → مطابقة → دفع (Sandbox) |

---

## 6. معايير الترقيم والإصدار

| القرار | القيمة |
|--------|--------|
| البادئة | `/api/v1/ai/*` و `/api/v1/integrations/*` |
| التوسع | إذا تغيّر العقد جذرياً → `v2` بجانب `v1` (لا حذف مفاجئ) |
| التوثيق | توثيق OpenAPI لكل واجهة (مقترح إنشاؤه ضمن Sprint) |
| الأحداث | أسماء أحداث AI وفق ADR-013 (`AI.Job.Completed`) وإصدارها وفق ADR-014 |
