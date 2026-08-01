# 02 — مصفوفة المقارنة صفحة-بصفحة (Page-by-Page Comparison Matrix)

> مقارنة كل منطقة/شاشة بين الواجهة الحالية (`src/`) والمقترح (`docs/design-review/`). الفجوة = ما يحتاج البناء أو الترحيل. الجهد تقديري للأسبوع-الشخص.

**مفتاح الحالة:** ✅ جاهز · ⚠️ ترحيل مطلوب · 🆕 بناء جديد · 🔲 غير مغطى

## 1. الصفحة الرئيسية وLanding

| الصفحة الحالية | الـ Pack | الوضع | ملاحظات |
|---|---|---|---|
| `/` (Hero + Stats + Modules + Roles) | [01-home.html](../01-home.html) | ⚠️ | Hero متدرّج Navy حاضر؛ الأيقونات اتجاهية غير مرآة (`ArrowLeft` في RTL خطأ)، القيم تعتمد ternaries جزئياً، الشعار placeholder بدل `Building2` |

## 2. بوابة المقاول (Contracting)

| الصفحة الحالية | الـ Pack | الوضع | ملاحظات |
|---|---|---|---|
| `/projects` | [02-contractor.html](../02-contractor.html) (Dashboard) | ⚠️ | بطاقات KPI موجودة لكن ألوانها مبعثرة (blue/green/amber/purple) |
| `/tenders/projects`, `/tenders/materials` | 02 (BOQ Upload, RFQ, Offers Comparison) | ⚠️ | زر CTA أخضر `bg-green-500` (طلب شراء) — ينتهك قاعدة "Amber+Green في سياق CTA واحد"؛ الجداول تحتاج توحيداً مع table kit |
| `/tenders/materials/new` | 02 (BOQ forms) | ⚠️ | نماذج قديمة بالأنماط اليدوية — تُرحَّل لمكوّنات form kit |

## 3. بوابة المورد والسوق (Supplier & Marketplace)

| الصفحة الحالية | الـ Pack | الوضع | ملاحظات |
|---|---|---|---|
| `/marketplace` | [03-supplier.html](../03-supplier.html) + [04-marketplace.html](../04-marketplace.html) | ⚠️ | Grid/List toggle جيد؛ KPI cards بألوان متعددة (`Package amber`, `Store green`, `Star yellow`, `Cart blue`) في سياق واحد |
| `/marketplace/new` (إضافة منتج) | 03 (Products) | ⚠️ | نموذج قديم — ترحيل لـ form kit |
| صفحات تفاصيل المنتج/مورد (غير منفّذة بعد) | 04 (Product Details, Supplier Comparison, RFQ Flow) | 🆕 | الـ Pack يقدّم شاشات مقترحة غير موجودة كصفحات كاملة في `src/` |

## 4. القوى العاملة (Workforce & Training)

| الصفحة الحالية | الـ Pack | الوضع | ملاحظات |
|---|---|---|---|
| `/jobs`, `/jobs/[id]`, `/jobs/[id]/apply`, `/jobs/new` | [05-workforce-training.html](../05-workforce-training.html) (Jobs) | ⚠️ | ترحيل تنسيقي؛ تأكيد توحيد شارات الحالة |
| `/training`, `/training/[id]`, `/training/my-courses`, `/training/[id]/lessons/[lessonId]` | 05 (Training, Certificates) | ⚠️ | تنسيقات قديمة — تُوحَّد عبر ui kit |
| Skills Profile | 05 | 🆕 | شاشة المهارات/الشهادات مقترحة في الـ Pack |

## 5. بوابة الإدارة (Admin)

| الصفحة الحالية | الـ Pack | الوضع | ملاحظات |
|---|---|---|---|
| `/admin`, `/admin/verifications`, `/admin/users`, `/admin/tenders`, `/admin/procurement`, `/admin/finance`, `/admin/support`, `/admin/audit-log`, `/admin/content`, `/admin/organizations`, `/admin/crm/*` | [06-admin.html](../06-admin.html) (Overview + KPIs + Verifications) | ⚠️ | الـ Pack يغطي نمطاً واحداً فقط (Overview/Verifications)؛ بقية صفحات الـ admin (CRM، finance، audit) **غير مغطاة في الـ Pack** 🔲 — الترحيل يعتمد مكوّنات kit نفسها لا شاشات الـ Pack |
| `/admin/research/*` (campaigns, participants, feedback, ai-insights, analytics...) | — | 🔲 | خارج الـ Pack؛ تعالج بإعادة التنسيق عبر theme/tokens فقط |

## 6. بوابة المصنع (Manufacturer) — بوابة جديدة

| الصفحة الحالية | الـ Pack | الوضع | ملاحظات |
|---|---|---|---|
| لا توجد صفحات manufacturer في `src/` | [07-manufacturer.html](../07-manufacturer.html) | 🆕 | بوابة كاملة جديدة (Factory Profile, Brands, Product Masters, TDS/SDS, Distributors, Market Insights) — تُبنى في Sprint لاحق بعد موافقة G3، وفق مصفوفة سلسلة القيمة في README |

## 7. تجربة الذكاء الاصطناعي (AI Experience)

| الصفحة الحالية | الـ Pack | الوضع | ملاحظات |
|---|---|---|---|
| مواضع AI مبعثرة (بحث/توصيات في research/admin جزئياً) | [08-ai-experience.html](../08-ai-experience.html) | 🆕 | **Placeholders فقط** في الـ Pack — غير قابلة للتنفيذ حتى اعتماد مواضع AI الرسمية (مرجع: docs/ai-integration) |

## 8. مناطق غير مغطاة في الـ Pack (تُرحَّل بالـ Theme فقط)

| الصفحة الحالية | الـ Pack | الوضع | ملاحظات |
|---|---|---|---|
| `/auth/login`, `/auth/register` | — | 🔲 | تُوحَّد مع form kit وbutton kit (primary amber) |
| `/procurement/*` (RFQs, PO, Invoices, Quotations, PRs + نماذج) | 02/03 جزئياً | ⚠️ | جداول وفواتير كثيفة — أولوية الترحيل لمكوّنات table/status/badge |
| `/organization/*`, `/verification`, `/settings/mfa`, `/delivery/*`, `/survey/[slug]` | — | 🔲 | إعادة تنسيق عبر tokens فقط، دون إعادة بناء |

## 9. الشاشات الجديدة كاملة في الـ Pack (قائمة البناء)

| شاشة الـ Pack | الحالة في `src/` |
|---|---|
| BOQ Upload + Offers Comparison | 🆕 (مسارات مقترحة فقط) |
| Product Details + Supplier Comparison | 🆕 |
| RFQ Flow (من المورد) | 🆕 جزئياً (يوجد rfqs) |
| Skills Profile + Certificates | 🆕 |
| Manufacturer Portal (7 شاشات فرعية) | 🆕 |
| AI Experience placeholders | 🆕 (معلّقة على اعتماد مواضع AI) |

## 10. الخلاصة العددية

- ✅ جاهز/أساسي: ~3 مناطق
- ⚠️ ترحيل تنسيقي: ~8 مناطق (غالبية الصفحات الحالية)
- 🆕 بناء جديد: 6 شاشات + بوابة المصنع
- 🔲 غير مغطى في الـ Pack: Auth، Procurement التفصيلي، Organization/Verification/Settings/Delivery/Survey، Research/Admin المتقدم

> استنتاج: الـ Pack **يغطي نمطياً** كل أدوار المنصة لكنه **لا يغطي كل الشاشات الوظيفية**. لذلك الترحيل عبر الـ Theme/MVCs kit هو المسار الأقل مخاطرة — لا إعادة بناء الشاشات غير المغطاة.
