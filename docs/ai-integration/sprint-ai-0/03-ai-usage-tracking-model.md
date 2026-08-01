# Sprint AI-0 · Deliverable 3 — AI Usage Tracking Model

> **المسار:** AI & Integration Layer — Sprint AI-0
> **الحالة:** 📝 مواصفة — جاهزة للاعتماد
> **يخدم:** Business Alignment (Pay-per-use Credits) + ADR-009 (Observability) + Analytics المستقبلية

---

## 1. الغرض

تتبّع **كل استدعاء نموذج** (مزوّد، نموذج، قدرة، ميزة، رموز، تكلفة، زمن، حالة) عبر نطاق AI، مع **حصص شهرية لكل منظمة** — لتمكين نموذج الأعمال (Free limits / Credits / Premium) ولتحليلات أداء النماذج.

## 2. المبادئ

| المبدأ | الوصف |
|--------|-------|
| تسجيل تلقائي | البوابة (Deliverable 1) تسجّل كل استدعاء دون جهد من الخدمات |
| لا إسقاط للطلب | فشل التسجيل لا يُسقط الطلب الأصلي |
| حصص لكل منظمة | `AiQuota` شهري لكل org (أو feature) |
| مجمّع للمقارنة | بيانات مجهّلة للـ Analytics (لا أسعار مورد بعينه) |
| الاحتفاظ | سجل استخدام محتفظ به وفق سياسة متفق عليها |

## 3. نماذج البيانات (Prisma — مواصفة نطاق AI)

```prisma
model AiModel {
  id            String   @id @default(cuid())
  provider      String   // 'openai' | 'anthropic' | 'local'
  name          String
  capability    String   // 'text' | 'embedding' | 'vision' | 'ranking'
  costPer1kIn   Float?
  costPer1kOut  Float?
  maxTokens     Int?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  @@unique([provider, name])
}

model AiUsage {
  id           String   @id @default(cuid())
  orgId        String?
  userId       String?
  feature      String   // 'supplier-matching' | 'search-assistant' | 'boq' | 'tender-analysis' | 'extraction' | 'pricing'
  capability   String   // 'text' | 'embedding' | 'vision' | 'ranking'
  provider     String
  model        String
  status       AiUsageStatus  // SUCCESS | ERROR | FALLBACK | CACHED | QUOTA_REJECTED
  inputTokens  Int      @default(0)
  outputTokens Int      @default(0)
  cost         Float    @default(0)   // محسوب من AiModel (SAR)
  currency     String   @default("SAR")
  latencyMs    Int?
  cached       Boolean  @default(false)
  errorCode    String?
  requestId    String?
  jobId        String?
  createdAt    DateTime @default(now())

  @@index([orgId, createdAt])
  @@index([feature, createdAt])
  @@index([provider, model, createdAt])
  @@index([createdAt])
}

model AiQuota {
  id          String   @id @default(cuid())
  orgId       String
  period      String   // '2026-08' — شهر
  feature     String?  // null = إجمالي المنظمة
  creditsUsed Float    @default(0)   // نقاط/عملات استهلاك
  creditsLimit Float?  // null = غير محدود
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([orgId, period, feature])
  @@index([orgId, period])
}

enum AiUsageStatus {
  SUCCESS
  ERROR
  FALLBACK
  CACHED
  QUOTA_REJECTED
}
```

> ملاحظة: `AiJob` و `AiEmbedding` و `FeatureSignal` و `PriceIndex` خارج نطاق تسليم الاستخدام — تُعتمد في مرحلة التنفيذ مع بقية نماذج AI (ADR-024).

## 4. حساب التكلفة

```
cost = (inputTokens / 1000 × costPer1kIn) + (outputTokens / 1000 × costPer1kOut)
```

- القيم من جدول `AiModel` (يُملأ عند تعريف كل مزوّد).
- النتيجة بالعملة الموحدة (SAR افتراضياً — يتوافق مع `Currency`/ADR-016).

## 5. سياسة الحصص (اقتراح نموذج أعمال)

| السيناريو | السلوك | رمز الخطأ |
|-----------|--------|-----------|
| الحصة منتهية | رفض قبل التنفيذ | `AI_QUOTA_EXCEEDED` |
| تجاوز حد الـ Free | إرجاع Fallback حتمي أو عرض ترقية (قرار Product) | — |
| وضع Premium | `creditsLimit: null` (غير محدود) | — |
| Credits المشتراة | إضافة رصيد → خصم تلقائي لكل استدعاء | — |

> القيم والأسعار **تُثبت بعد Pilot Data** — Sprint AI-0 يسلّم الآلية لا الأسعار.

## 6. واجهات التقارير المقترحة

| Method | Path | الوصف |
|--------|------|-------|
| GET | `/api/v1/ai/usage?orgId=&from=&to=&feature=` | سجل الاستخدام (paginated — ADR-006) |
| GET | `/api/v1/ai/usage/summary?orgId=&period=` | ملخص: tokens، تكلفة، استدعاءات، توزيع حسب feature |
| GET | `/api/v1/ai/usage/quotas?orgId=&period=` | الحصص والاستهلاك الحالي |
| GET | `/api/v1/admin/ai/usage?feature=&provider=` | (أدمن) إجمالي المنصة — مدخل Analytics |

## 7. مؤشرات التحليلات (من هذا النموذج)

| المؤشر | المصدر |
|--------|--------|
| Cost per inference | `AiUsage.cost` |
| Latency P50/P95 | `AiUsage.latencyMs` |
| Provider Failure Rate | `AiUsage.status = ERROR` |
| Fallback Rate | `AiUsage.status = FALLBACK` |
| Cache Hit Rate | `AiUsage.cached` |
| Usage per org/feature | `AiUsage` مجمّعة |
| Quota Consumption | `AiQuota` |

## 8. اختبارات مقترحة (عقود)

| الاختبار | الحالة |
|----------|--------|
| حساب التكلفة من AiModel | مخطط |
| رفض عند تجاوز الحصة قبل استدعاء المزود | مخطط |
| التسجيل لا يُسقط الطلب عند فشل DB | مخطط |
| وضع `CACHED` لا يحسب تكلفة استدعاء خارجي | مخطط |
| التلخيص حسب الفترة/feature | مخطط |

## 9. قبول التسليم

| # | المعيار |
|---|---------|
| 1 | نموذجا `AiUsage` و `AiQuota` معتمدان |
| 2 | آلية حساب التكلفة معتمدة |
| 3 | واجهات التقارير محددة (تُنفَّذ في Sprint التنفيذ) |
| 4 | سياسة الحصص موقعة مع Business (آلية لا أسعار) |
| 5 | لا تعارض مع ADR-009/016 |
