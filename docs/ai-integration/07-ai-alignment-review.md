# 07 — AI Alignment Review (مراجعة توافق اقتراح AI & Integration)

> **المسار:** AI & Integration Layer
> **الدور:** Programmer 4
> **نوع الوثيقة:** مراجعة توافق (Alignment Review) قبل الاعتماد الرسمي
> **الحالة:** 📝 مراجعة — لا يُنفَّذ أي كود قبل اعتماد Architecture Review
> **التاريخ:** 2026-07-31

---

## 0. الغرض والنطاق

مراجعة اقتراح `docs/ai-integration/` (ملفات 00–06 + مسودات ADR-022/023/024) على ثلاثة محاور:

1. **Architecture Alignment** — التوافق مع الـ ADRs المعتمدة، استقلالية نطاق AI، وعلاقته بـ Domain Events و Outbox.
2. **Product Experience Alignment** — التنسيق مع Design Review Pack وأماكن ظهور AI في رحلات المستخدم.
3. **Business Alignment** — ربط قدرات AI بنموذج الأعمال (Premium / اشتراكات / إيراد).

المراجع:
- ADRs 001–021 في `docs/architecture/adr/`
- `docs/product-experience/01-ux-architecture.md` + `02-screen-map.md`
- `docs/design-review/README.md` (Design Review Pack Sprint 0)
- `docs/market-validation/14-business-plan-framework.md` + `19-pricing-strategy.md`

---

## 1. Architecture Alignment

### 1.1 مصفوفة توافق الاقتراح مع الـ ADRs المعتمدة

| المرجع | عنصر الاقتراح | الحكم |
|--------|----------------|-------|
| ADR-001 (Modular Monolith) | AI نطاق داخل نفس المونوليث + قابلية استخراجه لاحقاً | ✅ متوافق |
| ADR-002 (16 Bounded Contexts) | النطاق #13 محجوز لـ AI؛ AI لا يملك بيانات النطاقات | ✅ متوافق |
| ADR-004 (Event Bus) | AI أول مستهلك فعلي للأحداث | ✅ متوافق (يستفيد من الواجهة المجردة) |
| ADR-005 (Module Structure) | `modules/ai/` موجود في الهيكل المعتمد أصلاً | ✅ متوافق |
| ADR-006 (API Standards) | واجهات `/api/v1/ai/*` تتبع Response Envelope/Error Codes | ✅ متوافق |
| ADR-007 (Dependency Rules) | AI لا يستورد خدمات النطاقات ولا Prisma من نطاق آخر | ✅ متوافق |
| ADR-008 (Cross-Cutting) | AI لا يكرر Search/Analytics — يستخدمها | ⚠️ يحتاج قرار (راجع 1.3) |
| ADR-009 (Observability) | تسجيل كل استدعاء نموذج (latency/cost) | ✅ متوافق |
| ADR-011/013/014 (Events) | أحداث `AI.*` بصيغة `Domain.Entity.Action` + إصدار | ✅ متوافق |
| ADR-016 (Money) | `PriceIndex` يعتمد العملة/الوحدة النقدية (SAR) | ✅ متوافق |
| ADR-017 (Financial Trust) | بوابات الدفع **خلف** Financial Trust — لا لمس له | ✅ متوافق |
| ADR-018 (Supplier Network) | الـ Capability Profile مصمم أصلاً "للمطابقة الذكية" | ✅ متوافق تماماً |
| ADR-019 (Product Catalog) | AI يقرأ ProductMaster/Offering دون امتلاك | ✅ متوافق |
| ADR-020 (Inventory) | Webhook/Polling للمزامنة يتماشى مع خطط ADR-020 | ✅ متوافق |
| ADR-021 (Marketplace) | Search Assistant/Recommendations تُبنى فوق Marketplace | ✅ متوافق |

**النتيجة:** لا يوجد انحراف عن أي ADR معتمد في الاقتراح.

### 1.2 استقلالية نطاق AI (AI كطبقة مستقلة لا تملك Domain Data)

| الفحص | النتيجة | الملاحظة |
|-------|---------|----------|
| هل يكتب AI في جداول النطاقات؟ | ❌ لا | قراءة عبر `index.ts` + أحداث فقط |
| هل يستورد AI خدمات نطاقات؟ | ❌ لا | خاصة Procurement (محظور أصلاً) |
| هل يملك AI بياناته المشتقة؟ | ✅ نعم | متجهات، إشارات، نتائج، ملاحظات، مؤشرات أسعار |
| هل يبقى مستقلاً عند الانتقال لـ Microservice؟ | ✅ نعم | Service Layer جاهز (ADR-001) |

**الخلاصة:** المبدأ **معتمد** من حيث الموقع المعماري. لكن هناك **ثغرة تنفيذية** تحتاج قراراً: نطاقات التجارة لا تعرّف بعد واجهات "قراءة فقط" رسمية في `index.ts` — يجب تحديدها قبل التنفيذ.

### 1.3 Domain Events و Outbox Pattern

| المحور | التقييم | الحكم |
|--------|---------|-------|
| **الحالة الراهنة للأحداث** | 55+ حدثاً منشوراً و0 مشتركين (Architecture Review §4.2) | فرصة حقيقية — AI كأول مستهلك يغلق الفجوة |
| **موثوقية EventEmitter** | At-Most-Once (ADR-004) — كافٍ للأحداث الداخلية غير الحرجة | ✅ مقبول |
| **Outbox لضمان At-Least-Once** | مطلوب للتكاملات الخارجية الحرجة فقط (ويب هوك دفع/مخزون) | ✅ مقترح سليم |
| **خطر الإفراط في الهندسة** | تطبيق Outbox على الأحداث الداخلية ليس ضرورياً الآن | ⚠️ **قرار: قصر Outbox على Gateway فقط** |
| **الترتيب والتكرار** | مستهلكو AI يجب أن يكونوا Idempotent (قاعدة ADR-004 موجودة) | ✅ شرط إلزامي |

**قرار مقترح:** يُعتمد Outbox **حصرياً داخل `modules/integration/`** للمخارج الخارجية، ولا يُوسَّع للأحداث الداخلية في Sprint أول؛ الانتقال الكامل لـ RabbitMQ/Kafka يبقى مؤجلاً (D-01).

---

## 2. Product Experience Alignment

> المرجع: Design Review Pack (Sprint 0) + UX Architecture §5 + Screen Map.
> الحالة: Design Pack **لا يحتوي بعد شاشات AI** — ما يلي يحدد نقاط اللقاء المطلوب اعتمادها.

### 2.1 Contractor Journey (02-contractor.html / UX §5.2 / Screen Map §7)

| نقطة اللقاء | الشاشة | قدرة AI | الحكم |
|-------------|--------|---------|-------|
| رفع BOQ → تطبيع الأصناف تلقائياً | 7.5/7.6 | BOQ Intelligence + Extraction | ✅ متوافق (يخدم UX Principle 3: "البيانات المعقدة تُبسّط") |
| إنشاء RFQ → اقتراح موردين مع أسباب | 7.8/7.9 | Supplier Matching | ✅ متوافق (يخدم UX Principle 1: الثقة) |
| مقارنة العروض → تلميحات ذكية بجانب الجدول | 7.9 + 8.12 | Pricing + Matching scoring | ⚠️ يحتاج موافقة على نمط العرض |
| الترسية | 7.10 | **لا اقتراح آلي للفائز** (Human-in-the-Loop) | ✅ متوافق مع القاعدة |

### 2.2 Supplier Journey (03-supplier.html / UX §5.3 / Screen Map §5)

| نقطة اللقاء | الشاشة | قدرة AI | الحكم |
|-------------|--------|---------|-------|
| ملف القدرات → "كم أنت جاهز للمطابقة؟" | 5.2/5.4 | Matching readiness score | ⚠️ يحتاج قرار (ميزة إظهار الجاهزية) |
| RFQ واردة → ترتيبها حسب فرصة الفوز | 5.13 | Tender Analysis + Matching | ✅ متوافق |
| التحليلات → رؤى ذكية (insights) | 5.17 | Pricing/Analytics | ✅ متوافق (مرحلة لاحقة) |
| اقتراح أسعار عند تقديم عرض | 5.14 | Pricing Intelligence (نطاق سعر) | ⚠️ يحتاج قرار (حساسية تسعيرية) |

### 2.3 Marketplace (04-marketplace.html / Screen Map §4)

| نقطة اللقاء | الشاشة | قدرة AI | الحكم |
|-------------|--------|---------|-------|
| بحث ذكي بلغة طبيعية | 4.1/4.6 + Landing | Search Assistant (RAG) | ✅ متوافق (يخدم البحث الذكي في 01-home) |
| تفاصيل منتج → "منتجات مشابهة/مكمّلة" | 4.2 | Recommendations | ✅ متوافق |
| مقارنة موردين → مؤشر سعر السوق | 4.3/4.4 | Pricing Intelligence | ✅ متوافق |
| بطاقة مورد/منتج → شارة تحقق + أسباب مطابقة | 4.5/4.2 | Matching reasons | ✅ متوافق (يخدم UX Principle 1) |

### 2.4 Jobs & Training (05-workforce-training.html / UX §5.6/5.7 / Screen Map §9/§11)

| نقطة اللقاء | الشاشة | قدرة AI | الحكم |
|-------------|--------|---------|-------|
| مهارات ← اقتراح وظائف/دورات | 9.2/9.5/9.9 | Job/Course matching | ⏸️ **مؤجل** (خارج النطاق التجاري للاقتراح الحالي) |
| شهادات ← إثراء ملف المهارات | 9.13 | Skills extraction | ⏸️ مؤجل |
| توصية دورات للمؤسسات | 11.7 | Recommendations | ⏸️ مؤجل |

**ملاحظة:** الاقتراح الحالي (01-ai-architecture) يركز على النطاقات التجارية الأربعة. **قرار مقترح:** إضافة "Skills/Jobs/Training matching" لاحقاً في خارطة الطريق (Phase 3) عبر نفس نطاق AI — لا حاجة لبنية منفصلة.

### 2.5 فجوات Design Review Pack (تتطلب قراراً)

| الفجوة | الأثر | الإجراء المقترح |
|--------|-------|-----------------|
| لا يوجد مكوّن "أسباب التوصية/المطابقة" في Design System | سيعرض الاقتراح الأسباب | إضافة مكوّن `MatchReasons` إلى Design System |
| لا يوجد "واجهة مساعد AI" (Chat widget / Command bar) | مطلوب لـ Search Assistant | إضافة شاشة/مكوّن لاحقاً — يحتاج Sprint Product |
| لا توجد حالات تحميل/فشل للعمليات غير المتزامنة (AiJob) | UX لرفع الملفات | الاستفادة من نمط Stepper/EmptyState/Skeleton الموجود |
| الشارات (Verification Badge) جاهزة | الأساس موجود ✅ | لا إجراء |

---

## 3. Business Alignment

> المرجع: `19-pricing-strategy.md` (باقات Contractors/Suppliers) + `14-business-plan-framework.md` §5 (Revenue Model).

### 3.1 ما هو Premium Feature (يرفع قيمة الباقات العليا)

| القدرة | المبرر التجاري | الباقة المستهدفة |
|--------|----------------|------------------|
| AI Supplier Matching (غير محدود + أسباب) | يقلل زمن الشراء → قيمة عالية للمقاول | Contractor Professional/Enterprise |
| AI Pricing Intelligence (مؤشر سعر + تنبيهات) | شفافية تكلفة → تقليل المخاطرة | Contractor Professional + Supplier Premium |
| AI Tender Analysis (ملخص + مخاطر) | يحسّن جودة التقديم للمناقصات | Contractor Professional/Enterprise |
| رؤى AI في التحليلات (5.17/11.7) | تمييز تحليلي | Supplier Premium + Training Premium |

### 3.2 ما يدخل ضمن الاشتراكات الأساسية

| القدرة | المبرر | الباقة |
|--------|--------|--------|
| Search Assistant (بحث طبيعي) | محفز تحويل من Free → مدفوع | Contractor Starter + Supplier Basic |
| توصيات منتجات أساسية | يثبت القيمة اليومية | كل الباقات (ضمن Free) |
| BOQ Intelligence (تطبيع أصناف) | يقلل الاحتكاك في إنشاء RFQ | Contractor Starter فما فوق |
| حصة محدودة من مطابقة الموردين | حدود Free تدفع للترقية (Freemium Principle) | Free: عدد محدود شهرياً |

### 3.3 ما يحقق إيراداً مباشراً

| المصدر | النموذج | يطابق | المرجع |
|--------|---------|-------|--------|
| **Pay-per-use Credits** للنماذج/العمليات الثقيلة (استخراج مستندات، تحليل مناقصات، تكاملات) | دفع لكل عملية | "خدمات إضافية Pay-per-use" | Business Plan §5 |
| **أولوية ظهور في نتائج المطابقة** للموردين المدفوعين | رفع ضمن الـ Ranking (شفاف ومعلن) | إعلانات مدعومة (S-19/S-20) | Pricing §3.2 Supplier Premium |
| **عمولة معززة**: مطابقة أدق → صفقات أكثر → عمولة أعلى | تأثير غير مباشر على Commission | عمولة الموردين (S-24) | Pricing §3.2 |
| **Enterprise API**: وصول API + بيانات سوق (Price Index مخصص) | اشتراك سنوي | Contractor Enterprise | Pricing §3.1 |

### 3.4 قرار مقترح — نموذج العمل للذكاء الاصطناعي

1. **Free:** Search Assistant + توصيات + حصة صغيرة من المطابقة (لإظهار القيمة).
2. **Subscription:** مطابقة غير محدودة + BOQ Intelligence + رؤى تحليلات (في الباقات العليا).
3. **Credits (Pay-per-use):** استخراج مستندات/تحليل مناقصات + تكاملات API — مصدر إيراد مباشر.
4. **Supplier Premium:** أولوية ظهور شفافة في نتائج المطابقة + ربط ERP.
5. **لا بيع بيانات:** مؤشرات الأسعار مجمّعة فقط (لا تشارك أسعار مورد بعينه) — يتوافق مع الخصوصية والثقة.

> ⚠️ كل الأسعار والنماذج **تُثبت بعد Pilot Data** (مبدأ "مدفوع بالبيانات" في pricing-strategy §1) — هذا الاقتراح يحدد **ماذا** يكون مدفوعاً، وليس **بكم**.

---

## 4. خلاصة المراجعة

### 4.1 ✅ ما تم اعتماده (متوافق ومؤكد — جاهز للبناء عليه)

| البند | الحكم |
|-------|-------|
| نطاق AI معزول لا يملك Domain Data | ✅ متوافق مع ADR-002/005/007 |
| AI أول مستهلك للأحداث (يغلق فجوة 0 مشتركين) | ✅ متوافق مع ADR-004 |
| قراءة عبر `index.ts` + أحداث فقط | ✅ متوافق مع ADR-007 |
| القدرات السبع تخدم مسارات UX المحددة دون كسر Design Pack | ✅ متوافق |
| بوابات الدفع خلف Financial Trust | ✅ متوافق مع ADR-017 |
| مبدأ Human-in-the-Loop + شفافية الأسباب | ✅ متوافق مع UX Principle 1 |
| ربط القدرات بنموذج الأعمال (Premium/Subscription/Credits) | ✅ متوافق مع framework التسعير |

### 4.2 ⚠️ ما يحتاج قراراً (قبل الاعتماد النهائي)

| # | القرار | المسؤول المقترح | يمنع التنفيذ؟ |
|---|--------|-----------------|---------------|
| G1 | تعريف **واجهات القراءة العامة** في `index.ts` لنطاقات التجارة (عقود للقراءة فقط) | Architecture Team | نعم |
| G2 | **قصر Outbox على Integration Gateway** فقط في Sprint الأول | Architecture Team | نعم |
| G3 | علاقة AI بـ Search/Analytics (الاستخدام لا الاستبدال) — ADR-008 | Architecture Team + Product | نعم (يؤثر على النطاق) |
| G4 | إضافة **مكوّنات AI** إلى Design System (MatchReasons، بحث طبيعي، حالات AiJob) وتحديث Screen Map | Product Experience | نعم (للـ UX) |
| G5 | إظهار "جاهزية المطابقة" في ملف المورد (5.4) | Product | لا (قابل للإرجاء) |
| G6 | اقتراح نطاق سعر في تقديم العرض (5.14) | Product + Business | لا (قابل للإرجاء) |
| G7 | نموذج العمل النهائي: حدود Free + Credits | Business (بعد Pilot) | لا — لكنه يؤثر على التكوين |
| G8 | نقل/مشاركة `AiInsight` مع نطاق Research | Architecture Team | لا (توافق عكسي) |

### 4.3 ⏸️ ما يُؤجل إلى مراحل لاحقة

| البند | المرحلة المقترحة |
|-------|------------------|
| AI لـ Jobs/Training/Skills (مطابقة وظائف/دورات) | Phase 3 — نفس نطاق AI |
| Manufacturer Data Sources (GS1/GDSN/EDI) | Phase 4 |
| ERP Connectors كاملة (SAP/Oracle) | Phase 4 |
| نماذج محلية/إقليمية للامتثال | Phase 5 |
| الانتقال لـ RabbitMQ/Kafka | Phase 5 (D-01) |
| Collaborative كاملة + تحسين RAG بالقياس | Phase 3 |
| AI Procurement Agent / مساعد صوتي | Phase 5 |

---

## 5. التوصية النهائية (Verdict)

**الحكم: ✅ مؤهّل للاعتماد (Conditionally Approved)** — بعد حسم القرارات G1 و G2 و G3 و G4.

- الاقتراح **سليم معمارياً** ومتوافق مع جميع الـ ADRs الحالية (لا انحرافات).
- متوافق مع تجربة المنتج المعتمدة عند نقاط اللقاء المحددة.
- متوافق مع نموذج الأعمال كطبقة قيمة أعلى (Premium/Credits) دون تعارض مع فرضيات التسعير.

**القاعدة:** لا يُبدأ أي تنفيذ برمجي قبل:
1. اعتماد Architecture Review (هذه الوثيقة).
2. حسم G1–G4.
3. إقرار Sprint التنفيذي من خارطة الطريق (`06-ai-roadmap.md`).

---

*إعداد: Programmer 4 — AI & Integration Alignment Review. بانتظار Architecture Review Board.*
