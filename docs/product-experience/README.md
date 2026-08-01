# Product Experience Foundation — Sprint 0

> أساس تجربة المنتج لمنصة ABC. هذا المجلد هو مرجع Frontend & Product Experience، ويعمل بالتوازي مع `docs/architecture` (Backend) و `docs/market-validation` (Business).

## الوثائق

| # | الوثيقة | الوصف |
|---|---|---|
| 01 | [01-ux-architecture.md](01-ux-architecture.md) | عمارة تجربة المستخدم: المبادئ، الشخصيات، هيكل المعلومات، تدفقات كل الأدوار، الثقة والتحقق، RTL/LTR، الوصولية |
| 02 | [02-screen-map.md](02-screen-map.md) | خريطة الشاشات: كل الوجهات حسب البوابة مع الحالة والأولوية والـ Route |
| 03 | [03-frontend-architecture.md](03-frontend-architecture.md) | اقتراح معمارية الواجهات: الهيكل، المكونات، الحالة، تكامل API، المصادقة، لوحات الأدوار، i18n |
| 04 | [04-design-system-plan.md](04-design-system-plan.md) | خطة نظام التصميم: الـ Tokens، الخطوط، الألوان، المكونات، RTL/LTR، الوصولية، خطة البناء |

## تسلسل القراءة المقترح

1. `01` — افهم التجربة والتدفقات (لماذا).
2. `02` — افهم الشاشات (ماذا).
3. `04` — افهم اللغة البصرية (كيف تبدو).
4. `03` — افهم البنية الفنية (كيف تُبنى).

## الحالة

- ✅ **Sprint 0 — Product Experience Foundation: معتمد v1.0** (31 يوليو 2026) — مرجع رسمي للمرحلة القادمة.
- ✅ **v1.1 — متطلب اللغات الثلاث معتمد** (31 يوليو 2026): **العربية (RTL) · الإنجليزية (LTR) · الأردية (RTL)** — متطلب رسمي، Sprint 1 Implementation يُبنى عليه (تفاصيل في 01 §8 و 04 §5.10).
- ✅ **Sprint 1 — Foundation: قيد التنفيذ (أساس مُنجز)**
  - ✅ Design Tokens (`globals.css` @theme: brand/navy/surface/semantic/radius/motion)
  - ✅ Font Strategy: Cairo (AR) · Inter (EN) · Noto Nastaliq Urdu (UR) عبر `next/font` + `--font-active` ديناميكي
  - ✅ UI Kit Foundation: `src/components/ui/` (Button · Input · Select · Textarea · Badge · Card · Table · Skeleton · EmptyState · StatusBadge · StatCard)
  - ✅ i18n Persistence: cookie `NEXT_LOCALE` + SSR dir/lang في Root Layout (ar→rtl · en→ltr · ur→rtl)
  - ✅ LanguageSwitcher: 3 خيارات في Navbar (يحل محل التبديل الثنائي)
  - ✅ Route Protection: middleware محمي بـ Edge-safe auth (`src/auth.config.ts` — إصلاح عطل Edge: Prisma خارج middleware)
  - ✅ RTL/LTR Foundation: Logical Properties في Navbar + UI Kit
- ⏭️ التالي: **Sprint 1 — بقية UI Kit + Application Shell** (Sidebar بوابات، Modal/Drawer/Toast، تطبيق UI Kit على الصفحات) — حسب الأولوية P1 في `02-screen-map.md`.

## متطلبات معتمدة (Requirement Lock)

| # | المتطلب | المرجع | Sprint |
|---|---|---|---|
| R1 | **اللغات الثلاث:** العربية (RTL، افتراضية) · الإنجليزية (LTR) · الأردية (RTL) — واجهات كاملة وليست خياراً لاحقاً | 01 §8.0 · 04 §5.10 | Sprint 1 |
| R2 | **مبدّل لغة بثلاث خيارات** في Navbar/Settings مع حفظ الاختيار (cookie `NEXT_LOCALE`) | 04 §5.7 LanguageSwitcher | Sprint 1 |
| R3 | **RTL موحّد للعربية والأردية** + LTR للإنجليزية (Logical Properties إلزامية) | 01 §8.1 · 04 §5.9 | Sprint 1 |
| R4 | **اختبار اللغات الثلاث** للـ Navigation · Forms · Tables (دليل اختبار) | 01 §8.0 · 04 §5.10 | Sprint 1 |
| R5 | **مرونة أطوال النصوص** (لا تصميم يعتمد على نصوص عربية فقط؛ تجريب نصوص طويلة/قصيرة باللغات الثلاث) | 01 §8.0 | Sprint 1 |
| R6 | **خط Nastaliq للأردية** (Noto Nastaliq Urdu / Jameel Noori Nastaleeq) عبر `--font-sans` ديناميكي | 01 §8.2 · 04 §3.1 | Sprint 1 |

## التحقق من التغطية (Coverage Verification) — v1.0

### تغطية الأدوار السبعة + الإدارة

| الدور | البوابة | التدفقات في 01 | الشاشات في 02 |
|---|---|---|---|
| Contractor | بوابة المقاول | §5.2 | §7 (7.1–7.17) |
| Supplier | بوابة المورد | §5.3 | §5 (5.1–5.18) |
| Manufacturer | بوابة المصنع | §5.4 | §6 (6.1–6.7) |
| Engineer / Consultant | بوابة الاستشاري | §5.5 | §10 (10.1–10.7) |
| Workforce | بوابة القوى العاملة | §5.6 | §9 (9.1–9.14) |
| Training Provider | بوابة مزوّد التدريب | §5.7 | §11 (11.1–11.7) |
| Admin | بوابة الإدارة | §5.8 | §13 (13.1–13.13) |

### تغطية المجالات (Domains)

| المجال | يخدمه | المرجع |
|---|---|---|
| Supplier Network | ملف المورد، التحقق KYC، القدرات، العلاقات، الشهادات | 01 §5.3 / §6 · 02 §5 |
| Product Catalog | منتجات المصنع (Product Masters)، المواصفات، أوراق البيانات | 01 §5.4 · 02 §6 |
| Inventory | المستودعات، الأصناف، الاستيراد، سجل الحركات | 01 §5.3 · 02 §5.9–5.12 |
| Marketplace | بحث، تفاصيل، مقارنة، RFQ، تقييمات، مفضلات | 01 §5.3 · 02 §4 |
| Procurement | PR، RFQ، عروض، تقييم، PO، فواتير، GR | 01 §5.2/§5.3 · 02 §8 |
| Jobs | وظائف، طلبات، تقديم | 01 §5.6 · 02 §9.5–9.8 |
| Training | دورات، تسجيلات، شهادات | 01 §5.6/§5.7 · 02 §9.9–9.13 / §11 |
| Skills | ملف المهارات، معرض الأعمال، الشهادات | 01 §5.6 · 02 §9.2–9.4 |

**النتيجة:** تغطية 100% للأدوار السبعة + الإدارة، و100% للمجالات الثمانية المطلوبة.

## القرارات المعلّقة قبل Sprint 1 (قيد الاعتماد)

| # | القرار | الخيار المقترح | الحاجة |
|---|---|---|---|
| D1 | خط الواجهة العربي | IBM Plex Sans Arabic أو Cairo | قرار نوع الخط (Design) |
| D2 | نظام الترجمة | ترقية تدريجية إلى next-intl (من context الحالي) — **بمعزل عن اللغات الثلاث المعتمدة (R1)** | موافقة Architecture Team |
| D3 | تكتيك الكتابة | Server Actions للبسيط + REST `/api/v1` للمعقد | لا شيء (مقترح معتمد مبدئياً) |
| D4 | مكتبة النماذج | react-hook-form + Zod (مشاركة validators من modules) | لا شيء |
| D5 | مكتبة الرسوم البيانية | Recharts | قرار نهائي (P1) |
| D6 | حماية الصفحات | middleware + Server Component guards (دور لكل route group) | موافقة أمنية |
| D7 | أرقام العرض | إضافة وحدة أرقام (هندية/غربية) حسب اللغة (`Intl.NumberFormat`: ar-SA / ur-PK / en) | قرار محتوى |
| D8 | Dark Mode | Light أولاً + جاهزية تبديل (P1) | لا شيء |
| D9 | **خط الأردية (Nastaliq)** | Noto Nastaliq Urdu (عناوين/محتوى) أو Jameel Noori Nastaleeq (عرض) — عبر `--font-sans` ديناميكي | قرار نوع الخط (Design) |
| D10 | **قواعد ملكية الترجمة** | dictionary منظمة حسب feature + مسؤول ترجمة واحد لكل لغة + Glossary موحّد للمصطلحات + قفل مفاتيح (لا حذف) + تغطية 100% قبل الإطلاق | قرار عملية (Localization) |
| D11 | **مصفوفة اختبار RTL** | مصفوفة قبول RTL: المكوّنات (Navigation/Forms/Tables/Floating) × الأبعاد (مرآة/Logical/اتجاه النص/التفاف/الأرقام) × اللغات الثلاث — تُنفَّذ E2E عبر Playwright + axe | قرار اختبار (QA) |

## القواعد

- كل تدفق/شاشة مرتبط بـ Domain في capability-map.md (Traceability).
- أي تغيير في هذه الوثائق بعد الاعتماد يُسجَّل عبر نسخة جديدة (v1.x) وتُوثَّق عبر ADR خفيف.
- التنسيق مع Architecture Team إلزامي قبل أي إضافة مكتبات جديدة للواجهات.

---

© 2026 ABC Platform — All About Constructions
