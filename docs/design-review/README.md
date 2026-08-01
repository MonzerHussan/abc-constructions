# ABC Design Review Pack — Sprint 0 (v1.0)

> معادل عملي لـ Figma Prototype: **معاينة HTML تفاعلية** تُفتح في أي متصفح. هذه ملفات مراجعة مستقلة — **ليست كود المنتج**، ولا تُعدّل أي ملف في `src/`.

## كيف تستخدمه

1. افتح [gallery.html](gallery.html) — معرض كل الشاشات.
2. افتح أي صفحة، ثم استخدم الشريط العلوي (أسود) لكل معاينة:
   - **العربية / English** — تبديل اللغة فورياً بين RTL و LTR.
   - **عرض الجوال** — تبديل إطار الهاتف (390px) مع إخفاء الـ Sidebar.
3. داخل البوابات: تنقل عبر الـ Sidebar والتبويبات للتنقل بين الشاشات الفرعية.

## الملفات

| الملف | المحتوى |
|---|---|
| [00-design-system.html](00-design-system.html) | الهوية البصرية كاملة (Colors · Typography · Buttons · Cards · Forms · Tables · Badges · Status · Navigation · Feedback) |
| [01-home.html](01-home.html) | Landing: هيرو + بحث ذكي + فئات + قيمة المنصة + الأدوار |
| [02-contractor.html](02-contractor.html) | بوابة المقاول: Dashboard · Projects · BOQ Upload · RFQ · Offers Comparison |
| [03-supplier.html](03-supplier.html) | بوابة المورد: Profile · Products · Inventory · RFQs · Analytics |
| [04-marketplace.html](04-marketplace.html) | السوق: Search · Product Details · Supplier Comparison · RFQ Flow |
| [05-workforce-training.html](05-workforce-training.html) | القوى العاملة: Skills Profile · Jobs · Training · Certificates |
| [06-admin.html](06-admin.html) | بوابة الإدارة: Overview + KPIs + Verifications |
| [07-manufacturer.html](07-manufacturer.html) | بوابة المصنع: Factory Profile · Brands · Product Masters · TDS/SDS · Distributors · Market Insights |
| [08-ai-experience.html](08-ai-experience.html) | مواضع واجهات الذكاء الاصطناعي (Search · BOQ · Supplier Matching · Recommendations) — placeholders فقط |
| [flows.html](flows.html) | المسارات الأساسية (Contractor / Supplier / Workforce) |
| [gallery.html](gallery.html) | معرض الشاشات (نقطة الدخول) |
| `assets/` | `preview.css` (Design Tokens + مكونات) و `preview.js` (تبديل اللغة/الجوال/التبويبات) |
| `assets/logo/` | موضع الشعار الرسمي (placeholders حالياً): `abc-logo.svg` (فاتح) · `abc-logo-white.svg` (داكن) · `abc-logo-mark.svg` (Mark فقط) |

## الشعار الرسمي — الإصدار v2 (مفهوم ABC داخل عناصر معمارية)

> شعار ABC v2 مبنِي على **الأحرف A وB وC داخل ثلاثة مبانٍ متصاعدة** — هوية منصة تقنية إنشائية، لا مجرد علامة مقاولات. يُحتفظ بإطار الهوية (اللون العنبري + Navy) ويطوِّر العلامة باحترافية وقابلية توسّع.

| الملف | الاستخدام |
|---|---|
| **`abc-logo-mark.svg`** | الـ Mark (الإطار العنبري + ثلاثة مبانٍ A/B/C) — App Icon · Favicon · Navbar · الإصدارات الصغيرة |
| **`abc-logo.svg`** | الـ Lockup الكامل (Mark + ABC) للخلفيات الفاتحة (Topbar، Landing، البوابات) — ارتفاع موحد 26px |
| **`abc-logo-white.svg`** | الـ Lockup للخلفيات الداكنة (Hero الداكن، الـ Footer) |
| **`abc-logo-mono.svg`** | نسخة أحادية اللون (Navy) بدون إطار — للاستخدام أحادي اللون/الطباعة |

- **App Icon:** تُولَّد من `abc-logo-mark.svg` إلى `src/app/icon.svg` + `icon.png` (192px) + `apple-icon.png` (180px) — متناسقة مع الشعار تلقائياً.
- **Clear Space:** حد أدنى من الفراغ حول الشعار لا يقل عن ارتفاع حرف الـ Mark من كل الجهات.
- **حجم الحرف داخل المبنى:** 20 (بمقياس viewBox 96) — عند أحجام ≥24px تظهر الأحرف، وأقل من ذلك يبقى المخطط المتصاعد (Skyline) هو القراءة البصرية.

> ملاحظة: إذا ورد **SVG رسمي جديد من العميل** لاحقاً، يُستبدل في `assets/logo/` و`public/logo/` فوراً دون تغيير البنية.

## مصفوفة بوابة المصنع (Manufacturer) — سلسلة القيمة

| الخطوة | الجهة | النتيجة |
|---|---|---|
| 1. منتج رئيسي (Product Master) | **المصنع** | المواصفات الفنية مصدرها وحيد |
| 2. تفويض موزع | المصنع ← مورد | توكيل بيع للمنتج |
| 3. عرض سعر + مخزون | **المورد** | يشغّل منتج المصنع |
| 4. ظهور في السوق | المنصة | يُعرض للمقاولين |
| 5. شراء/تأهيل | **المقاول** | إنفاق فعلي |

> خريطة الشاشات المعتمدة تمتد الآن إلى 8 بوابات (7 أدوار + إدارة) عبر 8 مجالات: Supply Chain · Contracting · Procurement · Materials · Workforce · Certification · Admin · AI Experience.

## مراسلات المستندات

- 01 → `docs/product-experience/01-ux-architecture.md` (التدفقات)
- 02 → `02-screen-map.md` (أكواد الشاشات 7.x، 5.x، 4.x...)
- 00 → `04-design-system-plan.md` (الـ Tokens والمكونات)

## ملاحظات مراجعة (تعتمد من فريق المنتج)

- **اللغات الثلاث — متطلب معتمد (v1.1):** العربية (RTL) · الإنجليزية (LTR) · الأردية (RTL). المعاينات هنا تُظهر التبديل عربي/English؛ الأردية تعيد استخدام نفس بنية RTL تماماً (Logical Properties + المرآة + `line-height` أعلى)، وتُختبر بنفس النطاق في Sprint 1. الخطوط: Noto Nastaliq Urdu / Jameel Noori Nastaleeq (D9).
- القرارات المعلّقة D1–D11 في README المنتج (`docs/product-experience/README.md`) تنعكس هنا بصرياً (الخط العربي حالياً Cairo، وتظهر كبديل IBM Plex Sans Arabic). D10 قواعد ملكية الترجمة وD11 مصفوفة اختبار RTL تُنفَّذان ضمن Sprint 1.
- هذا الـ pack مرجع للموافقة البصرية فقط. بعد الاعتماد يبدأ **Sprint 1 — Implementation** (Design Tokens → UI Kit → App Shell → Route Protection → i18n Persistence → RTL/LTR Foundation)، وهو يُبنى على أساس اللغات الثلاث.

---

© 2026 ABC Platform — All About Constructions
