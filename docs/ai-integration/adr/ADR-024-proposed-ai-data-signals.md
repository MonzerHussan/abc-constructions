# ADR-024 (مقترح): AI Data & Signal Collection

> ⚠️ **مسودة مقترحة** — ليست قراراً معتمداً.
> **الحالة:** 📝 مقترح — بانتظار المراجعة والاعتماد
> **التاريخ:** 2026-07-31

## السياق

- محرك التوصيات والمطابقة والتحليل يحتاج: متجهات (Embeddings)، إشارات سلوكية، نتائج وملاحظات، ومؤشرات أسعار.
- جميع هذه البيانات **مشتقة** من نطاقات التجارة ولا يجوز امتلاكها داخل AI (ADR-002/007).
- الحاجة لتخزين المتجهات مع الحد الأدنى من البنية الجديدة — PostgreSQL + pgvector يتوافق مع استراتيجية "قاعدة واحدة".

## القرار

1. **نماذج AI جديدة** مملوكة لنطاق AI:
   - `AiModel` (سجل النماذج/التكلفة)
   - `AiJob` (مهام غير متزامنة: EXTRACTION | EMBEDDING | ANALYSIS | MATCHING | RECOMMENDATION)
   - `AiEmbedding` (متجهات entity → pgvector)
   - `FeatureSignal` (إشارات: VIEW | SEARCH | SAVE | FAVORITE | RFQ | QUOTATION | AWARD | CLICK)
   - `RecommendationRecord` (ما عُرض ومتى)
   - `AiFeedback` (تقييمات المستخدم: ACCEPTED | DISMISSED | IGNORED | REJECTED + rating)
   - `PriceIndex` (مؤشر سعر مجمّع ومجهّل الهوية)
2. **pgvector** عبر تمديد PostgreSQL (بيئة تجريبية أولاً — لا تغيير على جداول النطاقات).
3. **AI أول مستهلك فعلي للأحداث** — اشتراك في أحداث `SupplierNetwork.*`, `ProductCatalog.*`, `Inventory.*`, `Marketplace.*`, `Procurement.*` لتوليد المتجهات والإشارات (يعالج فجوة "0 مشتركين").
4. **أحداث AI** بصيغة ADR-013/014: `AI.Job.*`, `AI.Analysis.Completed`, `AI.Match.Generated`, `AI.Recommendation.Served`, `AI.Feedback.Recorded`, `AI.Embedding.Updated`.
5. **إثراء اختياري** لحقول سياق في `metadata` (regionId?, sessionId?, language?) — إضافات غير مكسرة.

## النتائج

- **إيجابي:** بيانات AI منفصلة ومملوكة ومقيسة؛ أساس حقيقي لمحرك توصيات هجين وتحليلات الأداء.
- **سلبي:** نماذج جديدة تُضاف إلى schema (تُدار ضمن Sprint AI فقط)؛ يتطلب مراجعة للـ Indexing.
- **محايد:** `AiInsight` الحالية مملوكة لـ Research — تبقى كما هي في البداية، وقرار نقلها/مشاركتها مؤجل لفريق العمارة.

## بدائل مستقبلية

- عند كبر البيانات: نظام متجهات مخصص (Qdrant/Milvus) — لكن البدء بـ pgvector يقلّل التعقيد.
- عند الحاجة: نقل `FeatureSignal` إلى نطاق Analytics لاحقاً دون كسر.
