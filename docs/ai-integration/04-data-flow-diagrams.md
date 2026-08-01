# 04 — Data Flow Diagrams (مخططات تدفق البيانات)

> **المسار:** AI & Integration Layer
> **الدور:** Programmer 4
> **الحالة:** 📝 مقترح قيد الدراسة
> **التاريخ:** 2026-07-31

> جميع المخططات التالية بصيغة Mermaid — وصفية فقط، وتمثل **مقترحات** لا قرارات معتمدة.

---

## 1. مخطط تدفق النظام العام (Context Flow)

```mermaid
flowchart LR
    subgraph Commerce[نطاقات التجارة المعتمدة]
        SN[Supplier Network]
        PC[Product Catalog]
        INV[Inventory]
        MKP[Marketplace]
    end

    subgraph AI[نطاق AI - مقترح]
        EMB[AiEmbedding / Vectors]
        SIG[Feature Signals]
        JOB[AiJob Queue]
        PRICE[Price Index]
    end

    subgraph EXT[التكاملات الخارجية - مقترحة]
        GW[Integration Gateway]
    end

    SN -- أحداث --> AI
    PC -- أحداث --> AI
    INV -- أحداث --> AI
    MKP -- أحداث --> AI

    AI -- قراءة عبر index.ts فقط --> Commerce
    AI --> API[/api/v1/ai/*/]
    API --> UI[App Router]

    GW --> ERP[ERP الموردين]
    GW --> LOG[اللوجستيات]
    GW --> PAY[بوابات الدفع]
    GW --> GOV[جهات حكومية]
    GW --> MFR[مصادر المصنعين]
    GW -- أحداث/استدعاءات --> Commerce
```

---

## 2. مسار مطابقة الموردين الذكية (AI Supplier Matching)

```mermaid
sequenceDiagram
    participant U as المستخدم (مشتري)
    participant M as Marketplace
    participant AI as AI Domain
    participant SN as Supplier Network
    participant PC as Product Catalog
    participant INV as Inventory

    U->>M: ينشئ RFQ (بنود + موقع + موعد)
    M->>AI: POST /ai/supplier-matching/match
    AI->>SN: قراءة ملفات الموردين (index.ts)
    AI->>PC: قراءة المنتجات والعروض
    AI->>INV: قراءة التوفر (availableQty)
    AI->>AI: Rule Filtering + Semantic + Scoring
    AI->>AI: Re-ranking + توليد الأسباب
    AI-->>U: قائمة مرتّبة مع reasons[]
    U->>AI: AiFeedback (قبول/رفض)
    AI->>AI: تسجيل FeatureSignal + Feedback
```

---

## 3. مسار استخراج المواد من الملفات (Material Extraction)

```mermaid
sequenceDiagram
    participant U as المستخدم
    participant S as Storage Module
    participant AI as AI Domain
    participant J as AiJob
    participant P as AiProvider (OCR/LLM)

    U->>S: يرفع ملف (PDF/Excel/Image)
    U->>AI: POST /ai/extraction {fileId, type}
    AI->>J: إنشاء AiJob (PENDING)
    AI-->>U: { jobId }
    AI->>AI: معالج الخلفية يقرأ الملف
    AI->>J: PROCESSING
    AI->>P: extract(file)
    P-->>AI: lineItems[] + confidence
    AI->>AI: تطبيع إلى فئات/وحدات موحدة
    AI->>J: COMPLETED (النتيجة)
    AI-->>U: GET /ai/jobs/:jobId → النتيجة
```

---

## 4. مسار المزامنة عبر بوابة التكاملات (ERP → Inventory)

```mermaid
sequenceDiagram
    participant ERP as ERP المورد (خارجي)
    participant GW as Integration Gateway
    participant OB as Outbox (مقترح)
    participant INV as Inventory Domain
    participant EV as EventBus

    ERP->>GW: Webhook (توقيع HMAC) — تحديث مخزون
    GW->>GW: تحقق توقيع + Idempotency
    GW->>INV: InventoryService (نقطة دخول واحدة)
    INV->>EV: Inventory.Stock.Updated
    EV->>AI: مستهلك AI → تحديث التوصيات
    INV->>OB: سجل المزامنة للخارجية
    OB->>ERP: تأكيد (At-Least-Once)
```

---

## 5. مسار بوابات الدفع (خلف Financial Trust)

```mermaid
sequenceDiagram
    participant U as المستخدم
    participant PO as Procurement (PO/Invoice)
    participant FT as Financial Trust
    participant GW as Integration Gateway
    participant PG as Payment Gateway (Stripe/PayTabs/...)

    PO->>FT: طلب إفراج/دفع
    FT->>GW: authorize(amount, method)
    GW->>PG: استدعاء خارجي
    PG-->>GW: نتيجة التفويض
    GW->>FT: تأكيد/رفض (عبر FinancialTrustService)
    PG->>GW: Webhook (حالة/استرداد)
    GW->>GW: تحقق توقيع + Idempotency
    GW->>FT: تحديث الحالة
    FT->>PO: Financial.Reservation.Released
```

> ملاحظة: لا تغيير على ADR-017 — Gateway تتكامل *خلف* Financial Trust.

---

## 6. مخطط انسياب البيانات → المتجهات → البحث (RAG)

```mermaid
flowchart LR
    A[حدث إصدار/تحديث منتج] --> B{هل لديه متجه؟}
    B -- لا --> C[AiJob: توليد Embedding]
    B -- نعم --> D[تحديث عند الحاجة]
    C --> E[(pgvector AiEmbedding)]
    D --> E

    Q[استعلام مستخدم] --> V[تضمين الاستعلام]
    V --> F[بحث متجهات pgvector]
    F --> G[Filter قواعد: توفر/تحقق/سعر]
    G --> H[LLM Rerank]
    H --> I[إجابة مثبتة + مصادر]
```

---

## 7. ملخص تدفقات البيانات الهامة للاعتماد

| المخطط | القرار المقترح | مرجع |
|--------|----------------|------|
| §2 | AI يقرأ عبر `index.ts` ويستهلك الأحداث | ADR-022 |
| §3 | المعالجة غير متزامنة عبر `AiJob` | ADR-024 |
| §4 | Gateway + Outbox لضمان At-Least-Once | ADR-023 |
| §5 | الدفع خلف Financial Trust (لا كسر ADR-017) | ADR-023 |
| §6 | pgvector للبحث المتجهي | ADR-024 |
