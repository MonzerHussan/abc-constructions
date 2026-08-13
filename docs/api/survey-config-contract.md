# Survey Config API Contract (SurveyManager)

هذا المستند هو المصدر الوحيد لعقد الـ API الذي تستهلكه واجهة إدارة اختبار الإعداد
(`SurveyManager`) في `src/components/admin/survey/SurveyManager.tsx` عبر
`src/lib/admin/survey-api.ts`.

> المراجع: المبرمج 1 يبني الـ backend وفق هذا العقد. المبرمج 5 يراجع الـ PR.
> حتى يُبنى الـ API، تعمل الواجهة في **وضع محلي (fallback)** من بيانات
> `survey-categories.ts` ولا تُكسر الواجهة بأي حال.

## النموذج

كيان السؤال (`SurveyQuestion`):

| حقل | النوع | وصف |
|---|---|---|
| `id` | `string` | معرّف ثابت (UUID) |
| `parentId` | `string \| null` | فئة رئيسية للسؤال الفرعي، `null` للفئة |
| `type` | `"category" \| "subcategory"` | نوع العنصر |
| `labelAr` | `string` | العنوان بالعربية |
| `labelEn` | `string` | العنوان بالإنجليزية |
| `sortOrder` | `number` | ترتيب العرض (تصاعدي) |
| `isActive` | `boolean` | مُفعّل أم معطّل |

كيان الإعداد الكامل (`SurveyConfig`):

| الصف | النوع | وصف |
|---|---|---|
| `categories` | `SurveyQuestionItem[]` | الفئات الرئيسية فقط |
| `subcategories` | `SurveyQuestionItem[]` | كل الفئات الفرعية |
| `updatedAt` | `string \| null` | آخر تحديث (ISO) |

## النقاط النهائية

جميع النقاط تحت المسار `/api/v1/survey-config` مع `credentials: "same-origin"`.
كل رد على النجاح يُغلَّف بـ `success()`: `{ success: true, data, meta }`.

### GET `/api/v1/survey-config`
إرجاع الإعداد الكامل الحالي.

- الوضع: `200`
- `data`: `SurveyConfig`

### PUT `/api/v1/survey-config`
استبدال الإعداد كاملًا (يُستخدم عند الحفظ الشامل من الواجهة).

- الـ body: `SurveyConfig`
- الرد: `200` مع `data: { ok: true }`

### POST `/api/v1/survey-config`
إنشاء عنصر جديد (فئة أو فئة فرعية).

- الـ body: `{ labelAr, labelEn, type: "category" | "subcategory", parentId: string | null }`
- الرد: `201` مع `data: SurveyQuestionItem` (يتضمّن `sortOrder` جديدًا و`isActive: true`)

### PATCH `/api/v1/survey-config/{id}`
تعديل جزئي لعنصر (الاسم أو التفعيل أو أي حقل).

- الـ body: أي حقول جزئية من `SurveyQuestionItem`، من ضمنها `{ isActive?: boolean }`
- الرد: `200` مع `data: SurveyQuestionItem` المحدَّث

### PUT `/api/v1/survey-config/reorder`
حفظ الترتيب الجديد عبر إرسال قائمة المعرّفات الحية.

- الـ body: `{ orderedIds: string[] }`
- الرد: `200` مع `data: { ok: true }`

### GET `/api/v1/survey-config/analytics`
تحليلات اختبار الإعداد (لصفحة `/admin/surveys/analytics`).

- الرد: `200` مع `data: SurveyAnalytics`:

| الصف | النوع |
|---|---|
| `totalUsers` | `number` |
| `totalCompleted` | `number` |
| `completionRate` | `number` (نسبة مئوية) |
| `averageCategoriesPerUser` | `number` |
| `totalSubcategoriesSelected` | `number` |
| `categoryDistribution` | `{ id, labelAr, labelEn, count, percentage }[]` |
| `topSubcategories` | `{ id, labelAr, labelEn, count }[]` |
| `updatedAt` | `string \| null` |

مصدر التحليلات المقترح: توزيع الفئات من `Profile.relevantCategories`/`subcategories`،
ومعدل الإكمال من المستخدمين المسجلين مقابل من أكمل الاستبيان.

## الأخطاء

جميع الأخطاء تُغلَّف بـ `error()` بشكل `{ success: false, error: { code, message } }`
مع كود HTTP مناسب (404 للعنصر غير الموجود، 400 لـ validation، 409 للتعارض).

## سلوك الواجهة عند غياب الـ API

واجهة `survey-api.ts` تفحص `res.ok`؛ إن لم يرد الـ API أو فشل، تعيد الفولبك المحلي من
`buildSeedSurveyConfig()` وتُشعِر الواجهة بـ `isRemote: false` لعرض شارة "وضع محلي".
لذا لا يوجد أي اعتماد زمني على اكتمال الـ API لكي تعمل تجربة المسؤول في الواجهة.