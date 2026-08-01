# Sprint AI-1 · Deliverable 5 — API Contracts (عقود الـ API)

> **المسار:** AI & Integration Layer — Sprint AI-1
> **الحالة:** 📝 مواصفة — جاهزة للاعتماد
> **المرجع:** `05-api-integration-strategy.md` §2.3/2.4 · `01-document-processing-pipeline.md` · `03-boq-extraction-flow.md` · `04-material-mapping.md`
> **الغرض:** العقود النهائية لاستخراج BOQ — تُنفَّذ في Sprint AI-1b حرفياً.

---

## 1. المبادئ (ADR-006 Response Envelope)

- كل الردود عبر **Response Envelope** القياسي: `{ success, data, error?, meta }`.
- pagination موحّدة (page/pageSize) عند الحاجة.
- رموز الخطأ: `{DOMAIN}_{ENTITY}_{ISSUE}` — نطاق `AI`/كيان `BOQ`.
- الأخطاء موثقة هنا — لا أخطاء "غير متوقعة".

## 2. إنشاء مهمة استخراج BOQ

### `POST /api/v1/ai/boq/extract`

**الطلب:**
```json
{
  "fileId": "file_xxx",          // مرجع في Storage module (G1)
  "fileName": "boq_2026.xlsx",
  "format": "xlsx",              // pdf | xlsx | csv | image
  "orgId": "org_xxx",
  "options": { "ocr": true }     // ocr: اختياري — صيغ لا تملك نصاً
}
```

**الرد (مزامن — إرجاع المهمة):**
```json
{
  "success": true,
  "data": { "jobId": "job_xxx", "status": "PENDING" },
  "meta": { "timestamp": "2026-07-31T00:00:00Z", "requestId": "req_xxx" }
}
```

| الخطأ | HTTP | متى |
|-------|------|-----|
| `AI_BOQ_INVALID_FILE` | 422 | fileId غير صالح/تالف |
| `AI_BOQ_UNSUPPORTED_FORMAT` | 422 | صيغة غير مدعومة |
| `AI_BOQ_TOO_LARGE` | 413 | > 20MB |
| `AI_QUOTA_EXCEEDED` | 429 | حصة المنظمة منتهية (09) |

## 3. حالة المهمة + النتيجة

### `GET /api/v1/ai/jobs/:jobId`

```json
{
  "success": true,
  "data": {
    "jobId": "job_xxx",
    "status": "COMPLETED",          // PENDING | PROCESSING | PARTIAL | COMPLETED | FAILED
    "progress": { "stage": "NORMALIZE", "percent": 75 },
    "result": {
      "items": [
        {
          "id": "itm_1",
          "rowIndex": 3,
          "rawText": "حديد تسليح 12م",
          "itemCode": "A-12",
          "quantity": 12.5,
          "unit": "طن",
          "unitId": "uom_ton",
          "categoryId": "cat_steel",
          "confidence": 0.92,
          "status": "CLEAN"
        }
      ],
      "warnings": ["البند 8: وحدة غير معروفة — طلب مراجعة"],
      "rawMeta": { "fileName": "boq_2026.xlsx", "format": "xlsx" },
      "confidence": 0.9
    },
    "errorCode": null
  },
  "meta": { "timestamp": "…", "requestId": "req_xxx" }
}
```

| الخطأ | HTTP | متى |
|-------|------|-----|
| `AI_JOB_NOT_FOUND` | 404 | jobId غير موجود |
| `AI_OCR_FAILED` | 422 | فشل OCR (تسليم 2) — `status: FAILED` |

## 4. إعادة تشغيل مهمة

### `POST /api/v1/ai/jobs/:jobId/retry`

- الرد: `{ "jobId", "status": "PENDING" }` — يبدأ من `PENDING`.
- متاح فقط لـ `FAILED` و`PARTIAL`.

## 5. تقدير التكلفة (للـ BOQ المطبّع — Pricing خارج النطاق)

### `POST /api/v1/ai/boq/estimate`

> **تُنفَّذ لاحقاً** (Pricing Intelligence). يُحجز العقد هنا:
```json
{
  "orgId": "org_xxx",
  "items": [{ "categoryId": "cat_steel", "quantity": 12.5, "unitId": "uom_ton" }]
}
```
- الرد (لاحقاً): تقدير تكلفة + مدى (P25/P75) + `sampleSize` — يغذي `AiAnalysisPanel`.

## 6. ملاحظات المستخدم (Human-in-the-Loop)

### `POST /api/v1/ai/boq/items/:itemId/feedback`

| الحقل | القيمة |
|-------|--------|
| `action` | `ACCEPTED` \| `CORRECTED` \| `REJECTED` |
| `correctedCategoryId?` | الفئة الصحيحة (تصحيح بشري) |
| `correctedUnitId?` | الوحدة الصحيحة |
| `note?` | تعليق |

> يُسجَّل في `AiFeedback` ويغذي قاموس المرادفات (تسليم 4 §7) وقياس الجودة.

## 7. ملخص نقاط النهاية (BOQ)

| Method | Path | الغرض |
|--------|------|-------|
| POST | `/api/v1/ai/boq/extract` | إنشاء مهمة استخراج |
| GET | `/api/v1/ai/jobs/:jobId` | الحالة + النتيجة |
| POST | `/api/v1/ai/jobs/:jobId/retry` | إعادة تشغيل |
| POST | `/api/v1/ai/boq/estimate` | (لاحقاً) تقدير تكلفة |
| POST | `/api/v1/ai/boq/items/:itemId/feedback` | تصحيح بشري |

## 8. المصادقة والتفويض

- عبر `Bearer` + RBAC الحالي (نفس قاعدة بقية `/api/v1`).
- `orgId` إلزامي لكل طلب إنشاء (عزلة بين المنظمات).
- وصول الملف: عبر Storage Public Read Interface بترخيص org (G1).

## 9. قبول التسليم

| # | المعيار |
|---|---------|
| 1 | كل النقاط النهائية + الطلب/الرد موثّقة |
| 2 | كل رموز الخطأ موثقة (ADR-006) |
| 3 | عقد `estimate` محجوز (حتى لو لم يُنفَّذ) |
| 4 | المصادقة/العزلة معتمدة |
| 5 | متوافق مع 05-api-integration-strategy + ADR-006 |
