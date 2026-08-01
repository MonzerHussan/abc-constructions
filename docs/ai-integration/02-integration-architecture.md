# 02 — Integration Architecture Document (أساس التكاملات الخارجية)

> **المسار:** AI & Integration Layer
> **الدور:** Programmer 4
> **الحالة:** 📝 مقترح قيد الدراسة
> **التاريخ:** 2026-07-31
> **يعتمد على:** ADR-001/004 (Event Bus), ADR-008 (Cross-Cutting), ADR-016 (Money), ADR-017 (Financial Trust), ADR-018/019/020/021 (النطاقات التجارية)، والجدول 6.3/6.4 في `ABC_PLATFORM_ARCHITECTURE_v1.md`

---

## 1. المبدأ الأساسي

كل تكامل خارجي يمر عبر **Integration Gateway** موحّد داخل Modular Monolith — لا يوجد استدعاء خارجي من داخل Service لأي نطاق مباشرة.

```
                    ┌──────────────────────────────────────┐
                    │        INTEGRATION GATEWAY           │
                    │  modules/integration/                │
                    │  ┌────────────┐ ┌─────────────────┐  │
                    │  │ Connectors │ │ Webhook Receiver│  │
                    │  │ Registry   │ │ (Inbound)       │  │
                    │  └─────┬──────┘ └───────┬─────────┘  │
                    │        │                │            │
                    │  ┌─────┴───────────────────┐         │
                    │  │ Credential Vault · Retry │         │
                    │  │ Idempotency · Monitoring │         │
                    │  └──────────────────────────┘         │
                    └───────┬───────────────────┬───────────┘
                            │                   │
                 EventBus (Outbound)    Domain Services (Inbound)
```

> **ملاحظة:** نطاق `modules/integration/` **مقترح** — غير موجود اليوم. يحتاج ADR-023 قبل أي تنفيذ.

---

## 2. أنواع التكاملات الستة

### 2.1 ERP Systems للموردين

| الجانب | الاقتراح |
|--------|----------|
| الأنظمة | SAP (REST/OData), Oracle ERP Cloud (REST), Odoo (XML-RPC/REST), ERPNext (REST), Microsoft Dynamics (REST) |
| النمط | Connector لكل نظام + مصفّف `ErpMapper` يحوّل مخططاتهم إلى أحداثنا |
| المزامنة | `supplier-product-offering` (أسعار/توفر) و`inventory` (مخزون) — Push أو Pull |
| مثال | مورد يدفع قائمة عروضه → `ErpConnector` → خريطة → حدث `ProductCatalog.Offering.Created` |
| الأولوية | Odoo وERPNext (سوق المملكة والشركات الصغيرة) قبل SAP/Oracle |

### 2.2 Inventory Synchronization APIs

| الجانب | الاقتراح |
|--------|----------|
| الأنماط | **Webhook** (لحظي) + **Polling مجدول** (كل X دقيقة كـ Fallback) |
| الأمان | توقيع طلبات الويب هوك (HMAC/Signature)، Idempotency-Key |
| التوافق | يتماشى مع `Inventory.Import.Created/Completed/Failed` وخطط ADR-020 (§Future: Webhook → RabbitMQ) |
| التحقق | `availableQty` لا يُعدَّل إلا عبر InventoryService (ملكية النطاق) |

### 2.3 Payment Gateways

| البوابة | المنطقة | حالة التخطيط |
|---------|---------|--------------|
| Escrow.com | عالمي | مخطط (حساب ضمان) |
| Stripe | عالمي | مخطط |
| PayTabs | الشرق الأوسط | مخطط |
| HyperPay | الشرق الأوسط | مخطط (متوافق مع الشريعة) |
| Urway | السعودية | مخطط |
| Tabby / Tamara | السعودية | مخطط (اشترِ الآن وادفع لاحقاً) |

**الملاءمة مع العمارة المعتمدة:**
- المرحلة الأولى بُنيت **Financial Trust** (حجز/إمساك/إفراج/استرداد) دون Ledger/محفظة (ADR-017: "No ledger, wallet, or bank integration (deferred per PM decision)").
- لذلك: **بوابة الدفع تتكامل خلف Financial Trust** ولا تمسّ منطق الحجز/الإفراج.

```
Payments Gateway → PaymentConnector (Stripe/PayTabs/...) → FinancialTrust Service
```

**واجهة موحدة مقترحة:**
```typescript
interface IPaymentConnector {
  authorize(amount: Money, paymentMethod, ref): Promise<AuthorizeResult>;
  capture(ref, amount): Promise<CaptureResult>;
  refund(ref, amount): Promise<RefundResult>;
  status(ref): Promise<PaymentStatus>;
  webhookHandler(signature, payload): Promise<void>;
}
```

### 2.4 Shipping & Logistics APIs

| الجانب | الاقتراح |
|--------|----------|
| النطاق المستهدف | Delivery (سوق/مشروع) + Procurement Delivery (استلام بضائع) |
| الوظائف | أسعار الشحن الفورية (Rate Quotes)، تتبع (Tracking)، طباعة بوالص |
| الموفرون | مزودو لوجستيات محليون/إقليميون + مزودون عالميون (اختياري) |
| النمط | `LogisticsConnector` — Rate/Tracking/Booking |
| الحد | لا يمسّ نموذج `DeliveryOrder`/`Delivery` الحالي؛ يضيف مرجع تتبع خارجي فقط |

### 2.5 Government Verification APIs

| الجهة | حالة التخطيط |
|-------|--------------|
| السجل التجاري (Ministry of Commerce) | مخطط |
| ضريبة القيمة المضافة / ZATCA (فاتورة إلكترونية) | مخطط |
| الغرف التجارية / التصنيف (هندسي/مقاولات) | مخطط |
| تحقق وثائق (سارية/منتهية) | مخطط |

**الملاءمة:** يدعم `SupplierVerificationStateMachine` (UNVERIFIED→BASIC→VERIFIED→TRUSTED→FLAGSHIP) في ADR-018:

```
GovernmentVerificationConnector.verify(commercialRegister)  →  نتيجة معتمدة
  → SupplierNetworkService → ترقية مستوى التحقق (حدث Verification.Upgraded)
```

**ملاحظة حدودية:** التكامل يُحدِّث حالة الوثائق/المستوى **داخل Supplier Network فقط** عبر خدمته — لا عبر كتابة مباشرة.

### 2.6 Manufacturer Data Sources

| الجانب | الاقتراح |
|--------|----------|
| المعايير | GS1 / GDSN (كتالوج عالمي)، EDI (تبادل إلكتروني)، ملفات Excel/CSV |
| الغرض | استيراد منتجات المصنّعين (ProductMaster + مواصفات + DataSheets) |
| النمط | `ManufacturerDataConnector` → `ProductCatalogService.createFromImport` |
| الأولوية | مرحلة متقدمة — بعد استقرار Product Catalog |

---

## 3. المكوّنات الأساسية للبوابة

| المكوّن | الوظيفة | الملاحظات |
|---------|---------|-----------|
| **Connector Registry** | تسجيل/إدارة كل Connector مع حالته وقدراته | قابلة للتفعيل بـ Feature Flag |
| **Credential Vault** | تخزين مشفّر لمفاتيح كل موفّر خارجي | لا في `schema.prisma` كقيم نصية عادية |
| **Retry + Backoff** | إعادة المحاولة مع تأجيل تصاعدي | راجع ADR-009 (logging) لأغراض التتبع |
| **Circuit Breaker** | إيقاف استدعاءات المزوّد المتعثر مؤقتاً | يحمي تطبيقنا من بطء الجهات الخارجية |
| **Idempotency** | `Idempotency-Key` لكل طلب خارجي + التحقق من Webhook المكرر | حرج لـ Webhooks وPayments |
| **Outbox Pattern (مقترح)** | جدول Outbox داخل نفس DB لضمان At-Least-Once عند مغادرة EventEmitter | مؤسسة الانتقال اللاحق لـ RabbitMQ/Kafka (D-01) |
| **Monitoring** | حالة كل Connector: Success/Fail/Latency/Cost | يغذي Analytics لاحقاً |

### لماذا Outbox مقترح هنا؟

- EventEmitter الحالي **At-Most-Once** (ADR-004) — مناسب للأحداث الداخلية غير الحرجة.
- Webhooks لموفّري ERP/الشحن/الدفع تتطلب **At-Least-Once** — لا يمكن الاعتماد على EventEmitter.
- الحل: الكتابة في جدول `IntegrationOutbox` داخل `$transaction` مع المهمة، ثم Consumer يصدرها للخارج.

---

## 4. الأمان

| الجانب | الاقتراح |
|--------|----------|
| مفتاح الوصول للبوابة | Auth عبر NextAuth/RBAC (صلاحيات `integrations:manage`) |
| Webhooks الواردة | تحقق من التوقيع/السر المشترك، رفض الطلبات غير الموقعة (401) |
| Replay Protection | `timestamp + nonce` ضمن النطاق الزمني المسموح |
| IP Allowlist | اختياري للبوابات الحكومية/البنكية |
| المفاتيح | تُدار عبر env / Vault، ولا تُرسل للعميل أبداً |
| السجلات | تسجيل من دون بيانات حساسة (بطاقات، أرقام سجلات تجارية كاملة) |

---

## 5. الأولويات المقترحة (Phasing)

| المرحلة | التكاملات | المبرر |
|---------|-----------|--------|
| **P1 — أساسيات الدفع (مرحلة لاحقة)** | Stripe + PayTabs/HyperPay خلف Financial Trust | تمكين المعاملات الآمنة |
| **P1 — تحقق حكومي أساسي** | السجل التجاري + VAT/ZATCA | رفع الثقة في Supplier Network |
| **P2 — مزامنة المخزون** | Webhook + Polling عبر Inventory | بيانات لحظية للسوق |
| **P2 — لوجستيات** | Rate + Tracking | تكامل Marketplace/Delivery |
| **P3 — ERP** | Odoo/ERPNext ثم SAP/Oracle | تكامل الموردين الكبار |
| **P4 — Manufacturer Data** | GS1/GDSN/EDI | كتالوج عالمي |

---

## 6. الواجهات المقترحة (نموذج API تحت `integrations`)

```
/api/v1/integrations/connectors/                 # إدارة الاتصالات (أدمن)
/api/v1/integrations/webhooks/{provider}/       # نقاط استقبال الويب هوك
/api/v1/integrations/sync/inventory             # تشغيل مزامنة يدوية
/api/v1/integrations/payments/authorize         # تفويض دفع
/api/v1/integrations/logistics/rates            # أسعار شحن
/api/v1/integrations/verification/register      # استعلام حكومي
/api/v1/integrations/outbox/                    # (داخلي) فحص حالة Outbox
```

> جميعها **مقترحة** — تُنفَّذ فقط بعد اعتماد ADR-023 وتحديد Sprint.

---

## 7. قرارات تتطلب اعتماداً (الخلاصة)

| القرار | مقترح | الوثيقة |
|--------|-------|---------|
| إنشاء `modules/integration/` (Gateway) | ✅ | ADR-023 |
| Outbox Pattern للتكاملات | ✅ | ADR-023 |
| Payment Connectors خلف Financial Trust | ✅ | ADR-023 + لا تغيير على ADR-017 |
| التكاملات لا تمسّ ملكية نطاقات التجارة | ✅ | ADR-023 |
