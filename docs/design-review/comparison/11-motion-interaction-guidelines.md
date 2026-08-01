# 11 — إرشادات الحركة والتفاعل (Motion & Interaction Guidelines)

> أنظمة الحركة المقترحة للـ UI Kit. مبدأ عام: **حركة قصيرة وواضحة، محترمة لـ `prefers-reduced-motion`، سليمة مع RTL/LTR.**

## 1. Tokens الحركة (موجودة في `globals.css`)

| Token | القيمة | الاستخدام |
|---|---|---|
| `--duration-fast` | 150ms | hover/active/focus، تلميحات |
| `--duration-base` | 250ms | انتقالات الشاشة، القوائم، الـ drawer |
| `--ease-standard` | `cubic-bezier(0.4,0,0.2,1)` | الافتراضي (Material) |
| إضافة مقترحة | `--duration-slow: 400ms` | دخول الصفحات، hero |

## 2. قواعد السلوك

| النوع | القاعدة |
|---|---|
| **Hover** | تغيير لون/خلفية فقط (150ms)؛ **لا** تحويلات هندسية لمساحات كبيرة إلا للبطاقات التفاعلية (card-hover الحالية 200ms + translateY −2px مقبولة) |
| **Focus** | `:focus-visible` ring 2px brand — بلا حركة |
| **Active/Pressed** | `translateY(1px)` مثل `btn:active` في الـ Pack (إحساس ملموس) |
| **القوائم/الـ dropdown** | fade+slide 8px في 150–200ms مع `transition` خفيفة؛ لا حركة بلا داعي عند الفتح |
| **Sidebar/Drawer** (إن اعتمد Q1) | slide من `inline-end` خلال 250ms مع `transform` (أداء أفضل من width) |
| **تنقّل الصفحات** | fade-in خفيف (200ms) — بلا انزلاقات معقدة |
| **Skeleton** | نبض/توهج (`pulse`) — يُوقف مع reduced-motion |
| **Toast/Status** | دخول سريع 150ms، بقاء ~4s، خروج 150ms — مع `role="status"` (09) |

## 3. RTL والمرآة

- أي حركة اتجاهية تستخدم **logical** (استهداف `inline-start/end`) وليس `left/right` الثابتة.
- البطاقات `card-hover` (translateY لأعلى) محايدة الاتجاه — سليمة في RTL.
- الأسهم/التراجع في الهياكل تُقلَّب مع `Icon` (rtl:rotate-180).

## 4. إمكانية الوصول في الحركة

- `@media (prefers-reduced-motion: reduce)` في `globals.css`:
  - إيقاف كل الحركات غير الأساسية (transition: none للواجهة، ترقّب النبض).
  - السماح فقط بـ opacity منخفضة جداً (اختياري).
- تقديم حالة إعداد في التطبيق لاحقاً إن لزم (ليس إلزامياً AA).

## 5. الأداء

- الحركة على **`transform`/`opacity`** فقط (لا `top/left/width/height` للبطاقات الكثيرة).
- الجداول الكبيرة: لا حركات صفوف عند إعادة التحميل — فقط Skeleton ثم إحلال.
- تفادي `filter`/`box-shadow` المتحركة على عناصر كثيرة (جوال ضعيف).

## 6. قبول الخروج

- [ ] كل الحركات تستخدم Tokens (duration/ease) — لا قيم مبعثرة.
- [ ] `prefers-reduced-motion: reduce` يبطل الحركات (فحص في Storybook/وضع DevTools).
- [ ] لا حركة اتجاهية مدمجة `left/right` في المكوّنات الجديدة.
- [ ] انتقالات الـ Drawer/Sidebar (إن اعتمد) سليمة في RTL.
- [ ] حرارة التحريك خفيفة: أهداف اختبارية < 1000 عنصر متحرك متزامن في صفحة البيانات.
