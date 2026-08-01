# ADR-023 (مقترح): External Integration Gateway

> ⚠️ **مسودة مقترحة** — ليست قراراً معتمداً.
> **الحالة:** 📝 مقترح — بانتظار المراجعة والاعتماد
> **التاريخ:** 2026-07-31

## السياق

- المنصة ستحتاج تكاملات خارجية: ERP للموردين، مزامنة مخزون، بوابات دفع، شحن ولوجستيات، تحقق حكومي، ومصادر بيانات مصنّعين.
- التكاملات المخطط لها مسجلة في `ABC_PLATFORM_ARCHITECTURE_v1.md` (§6.3, §6.4) بلا تنفيذ.
- EventBus الحالي **At-Most-Once** (ADR-004) — غير كافٍ للـ Webhooks الحرجة (دفع/مخزون) التي تتطلب At-Least-Once.
- Financial Trust (ADR-017) لا يملك Ledger/بنك — بوابات الدفع يجب أن تتكامل **خلفه** دون تغييره.

## الخيارات

1. **تكاملات مباشرة داخل كل نطاق** — كل نطاق يستدعي المزوّد الخارجي مباشرة. (مرفوض: أمان متكرر، لا مراقبة مركزية، يصعب إيقافه/توسيعه)
2. **بوابة تكامل موحّدة (Integration Gateway)** — Connector لكل نوع، Vault، Retry، Idempotency، Outbox، Monitoring (المقترح).

## القرار

اعتماد **نطاق `modules/integration/`** بواجهة عامة فقط:

1. **Connector Registry** — تسجيل/تفعيل/تعطيل كل اتصال (Feature Flag لكل نوع).
2. **Credential Vault** — تخزين مشفّر لمفاتيح المزوّدين (لا في schema عادي).
3. **Retry + Backoff + Circuit Breaker** — حماية من تعثّر المزوّدين.
4. **Idempotency** — `Idempotency-Key` للطلبات الخارجية + التحقق من تكرار Webhook.
5. **Outbox Pattern** — جدول `IntegrationOutbox` داخل `$transaction` لضمان At-Least-Once عند الإرسال للخارج (وتأسيس D-01 لاحقاً).
6. **Webhook Receiver** موحّد — توقيع/سر مشترك، Replay Protection، IP Allowlist اختياري.
7. **نقطة دخول واحدة للنطاقات** — التكامل يستدعي Service النطاق (مثل `InventoryService`) ولا يكتب مباشرة في بيانات النطاق.

## النتائج

- **إيجابي:** أمان مركزي، مراقبة صحة كل اتصال، قابلية إضافة/إيقاف موفّر دون لمس النطاقات، أساس لـ RabbitMQ/Kafka مستقبلاً.
- **سلبي:** طبقة إضافية (تكلفة بناء)، وعدد Connectors قد يتطلب صيانة دورية.
- **محايد:** لا يغيّر ملكية البيانات في النطاقات التجارية.

## بدائل مستقبلية

- عند الحاجة: بوابة تكامل منفصلة كخدمة مستقلة (معظم الفرق تستخدم نمط BFF للـ third-party).
- استبدال EventEmitter بـ RabbitMQ/Kafka عبر Outbox (مؤجل — D-01).

---

## ملحق: الأنواع المدعومة

| النوع | Connector | الأولوية |
|-------|-----------|----------|
| ERP | `ErpConnector` (SAP, Oracle, Odoo, ERPNext, Dynamics) | P3 |
| Inventory Sync | `InventorySyncConnector` (Webhook + Polling) | P2 |
| Payment | `PaymentConnector` (Stripe, PayTabs, HyperPay, Urway, Tabby/Tamara, Escrow) | P1 |
| Logistics | `LogisticsConnector` (Rates, Tracking, Booking) | P2 |
| Government | `GovernmentVerificationConnector` (سجل تجاري، VAT/ZATCA، غرف/تصنيف) | P1 |
| Manufacturer | `ManufacturerDataConnector` (GS1/GDSN, EDI, Excel/CSV) | P4 |
