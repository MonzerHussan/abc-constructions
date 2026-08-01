# ABC — Typeform Build Spec (مخطط بناء Typeform)

**المرحلة:** Pilot Preparation Phase  
**الهدف:** مواصفة قابلة للتنفيذ المباشر في Typeform للاستبيانين + Consent  
**المصدر:** `CONTRACTOR-SURVEY-MULTILANG.md` + `SUPPLIER-SURVEY-MULTILANG.md`  
**المنصة المستهدفة:** Typeform (Create → Typeform)  
**نظام البيانات:** أسماء حقول التصدير تُطابق **Unified Stakeholder Model** (`PILOT-DATA-ARCHITECTURE.md`) — تصل مباشرة لسجل الـ Entity  
**التعدد اللغوي:** كل استبيان يُنشر **بثلاث نسخ لغات** (Arabic/English/Urdu) — نفس Question ID وحقول موحدة (انظر `MULTI-LANGUAGE-STANDARD.md`)

---

## 1. الإعدادات العامة (Form Settings)

| البند | القيمة |
|-------|--------|
| اللغة | العربية (RTL) — مع 3 نسخ: AR / EN / UR |
| الاتجاه | RTL (عربية/أوردو) + LTR (إنجليزية) |
| حساب المصدر | مصدران منفصلان: رابط Contractors + رابط Suppliers (كل واحد بثلاث نسخ لغات) |
| جمع البريد | يدوي (عنصر بريد إلكتروني صريح فقط عند Consent) |
| الحماية | Anti-bot ON + حدود زمنية |
| شاشة الترحيب | بلغة النسخة (عربية/إنجليزية/أوردو) |
| شاشة الإنهاء | رسالة شكر بلغة النسخة |
| URL Parameter | `?lang=ar|en|ur` لتحديد اللغة مسبقاً + `?src=` لتتبع Q0 |
| Language Selector | الشاشة الأولى في كل نسخة: اختيار اللغة → يُسجَّل `language_preference` |

## 1.1 النسخ اللغوية الثلاث (per survey)

| النسخة | اللغة | الحقل `language_preference` | الاتجاه | نص المصدر |
|--------|-------|-----------------------------|---------|-----------|
| AR | العربية | `Arabic` | RTL | `CONTRACTOR-SURVEY.md` |
| EN | English | `English` | LTR | `CONTRACTOR-SURVEY-MULTILANG.md` (عمود EN) |
| UR | اردو | `Urdu` | RTL | `CONTRACTOR-SURVEY-MULTILANG.md` (عمود UR) |

> **قاعدة:** Question IDs وحقول التصدير متطابقة في النسخ الثلاث — تُدمج النتائج في Registry واحد. نفس الشيء لاستبيان الموردين (المصدر: `SUPPLIER-SURVEY-MULTILANG.md`).

---

## 2. ترميز الأسئلة وتطبيقها في Typeform

### القواعد العامة
- **نوع الأسئلة:**
  - Single choice → `Multiple Choice`
  - Multiple selection → `Picture Choice` أو `Multiple Selection` (max 3)
  - نص مفتوح → `Long Text`
  - السعر/القيمة → `Short Text` (رقمي) أو `Opinion Scale`
- **الإجبار:** كل الأسئلة المغلقة `Required`
- **الأسئلة المفتوحة (C-V1 / S-V1):** غير إجبارية لتقليل الاحتكاك، لكن مميزة بـ "نصيحتك تساعدنا كثيراً"

### تسلسل الشاشات — استبيان المقاولين (Contractor Survey)

| الشاشة | السؤال | النوع | الخيارات | إجبار | منطق شرطي |
|--------|--------|-------|----------|-------|-----------|
| 1 | ترحيب + Consent | Statement + Legal | (نص الموافقة الكامل — انظر CONSENT) | نعم | رفض → إنهاء |
| 2 | Q0 | Multiple Choice | LinkedIn/واتساب/إحالة/بريد/جمعية/أخرى | نعم | — |
| 3 | C-01 | Multiple Choice | مقاول عام/تخصصي/مطور/أخرى | نعم | — |
| 4 | C-02 | Multiple Choice | <10/10-50/50-100/>100 | نعم | — |
| 5 | C-03 | Multiple Choice | <5م/5-10م/10-50م/>50م | نعم | — |
| 6 | C-10 | Multiple Selection | أسعار غير شفافة/صعوبة إيجاد/جودة/تأخير/توثيق/أخرى | نعم | max 3 |
| 7 | C-11 | Multiple Choice | توصيات/Google/معارض/منصات/مندوبون | نعم | — |
| 8 | C-12 | Multiple Choice | لكل مشروع/غالباً/أحياناً/نادراً | نعم | — |
| 9 | C-13 | Multiple Choice | <يوم/1-3 أيام/أسبوع/أكثر | نعم | C-12 ≠ نادراً |
| 10 | C-14 | Multiple Choice | 1-5/6-20/20+ | نعم | — |
| 11 | **C-V1** | Long Text | — | لا | — |
| 12 | C-21 | Rating (drag to rank) | سوق مواد/RFQ/مقارنة/موردون موثقون/دفع/تقارير | نعم | — |
| 13 | C-22 | Multiple Choice | سأستخدمها/أخطط/ربما/لا أعلم/لا | نعم | — |
| 14 | C-23 | Multiple Choice | اشتراك شهري/سنوي/عمولة/Freemium | نعم | — |
| 15 | C-24 | Multiple Choice | <100/100-400/400-1,000/>1,000 | نعم | — |
| 16 | **C-V2** | Multiple Choice | نعم/لا/أحتاج تفاصيل | نعم | — |
| 17 | FT-C | Multiple Choice | نعم (أدخل القيمة)/لا | نعم | نعم → حقل Short Text للقيمة |
| 18 | Consent + بريد/هاتف | Legal + Email | نعم/لا | نعم | نعم → Email مطلوب |

### تسلسل الشاشات — استبيان الموردين (Supplier Survey)

| الشاشة | السؤال | النوع | الخيارات | إجبار | منطق شرطي |
|--------|--------|-------|----------|-------|-----------|
| 1 | ترحيب + Consent | Statement + Legal | (نص الموافقة الكامل) | نعم | رفض → إنهاء |
| 2 | Q0 | Multiple Choice | LinkedIn/واتساب/إحالة/بريد/جمعية/أخرى | نعم | — |
| 3 | S-01 | Multiple Choice | موزع/وكيل/مصنع/مستورد | نعم | — |
| 4 | S-02 | Multiple Selection | مواد أساسية/تشطيب/كهرباء/سباكة/أخرى | نعم | — |
| 5 | S-03 | Multiple Choice | <10/10-20/20-50/>50 | نعم | — |
| 6 | S-06 | Multiple Choice | مقاولون/شركات/أفراد/حكومة | نعم | — |
| 7 | S-07 | Multiple Choice | <10/10-50/50-100/>100 | نعم | — |
| 8 | S-08 | Multiple Choice | مندوبون/توصيات/إعلانات/منصات/معارض | نعم | — |
| 9 | S-09 | Multiple Choice | وصول للمقاولين/منافسة/تكلفة تسويق/أخرى | نعم | — |
| 10 | **S-V1** | Long Text | — | لا | — |
| 11 | S-10 | Multiple Choice | واتساب/بريد/هاتف/منصة | نعم | — |
| 12 | S-11 | Multiple Choice | <5/5-20/20-50/>50 | نعم | — |
| 13 | S-12 | Multiple Choice (نعم/لا) | نعم/لا | نعم | — |
| 14 | S-13 | Multiple Choice | ERP/Excel/يدوي | نعم | — |
| 15 | S-16 | Multiple Choice | جاهز/يحتاج دعماً/لا | نعم | — |
| 16 | S-17 | Multiple Choice | نشط/غير نشط/لا يوجد | نعم | — |
| 17 | S-21 | Multiple Choice | وصول لمقاولين/زيادة مبيعات/كتالوج/تقارير/لا شيء | نعم | — |
| 18 | S-22 | Multiple Choice | عمولة عالية/منافسة/تعقيد/أمان | نعم | — |
| 19 | S-23 | Multiple Choice | Freemium+عمولة/شهري/سنوي/عمولة فقط | نعم | — |
| 20 | S-24 | Multiple Choice | <1%/1-3%/3-5%/5-10% | نعم | — |
| 21 | **S-V2** | Multiple Choice | نعم/لا/أحتاج تفاصيل | نعم | — |
| 22 | FT-S | Multiple Choice | نعم (أدخل النطاق)/لا | نعم | نعم → حقل Short Text |
| 23 | Consent + بريد/هاتف | Legal + Email | نعم/لا | نعم | نعم → Email مطلوب |

---

## 3. منطق الرفض والإنهاء

| الحالة | السلوك |
|--------|--------|
| رفض Consent في الشاشة 1 | تُعرض شاشة "نشكر وقتك" و**يُنهى** الاستبيان (لا تُخزَّن أي بيانات) |
| إجابة FT-C/FT-S = لا | يُتخطى حقل القيمة |
| C-V2/S-V2 = "نعم" | تُعرض لاحقاً رسالة: "سنوافيك بتفاصيل المرحلة التجريبية" |
| Consent = لا | يُتخطى حقل البريد |

---

## 4. حقول الاستخراج (Exports — بأسماء المخطط الموحد)

| الحقل (Schema) | مصدر Typeform | الاستخدام |
|----------------|---------------|-----------|
| `entity_id` | يُولَّد تلقائياً عند الإرسال | معرف موحد دائم في سجل الكيانات |
| `entity_category` | ثابت لكل نموذج (CUST / SUPP) | تصنيف الكيان |
| `entity_subtype` | C-01 / S-01 | نوع الكيان |
| `company_size` | C-02 / S-03 | الملف التجاري |
| **`language_preference`** | **Language Selector (الشاشة الأولى)** | **توجيه التواصل مستقبلاً (CRM/Marketing)** |
| `pain_points` | C-10/C-13/S-09/S-22 + C-V1/S-V1 | بيانات التحقق |
| `needs` | C-11/C-12/C-21/S-08/S-10/S-21 | بيانات التحقق |
| `willingness_to_pay` | C-23/C-24/C-V2/S-23/S-V2 | بيانات التحقق |
| `commission_acceptance` | S-24 | بيانات التحقق |
| `adoption_interest` | C-22 | بيانات التحقق |
| `first_transaction_ready` + `ft_order_value` | FT-C / FT-S | First Transaction |
| `source` + `source_detail` | `src` (من URL) | بيانات العلاقة |
| `relationship_status` + contact | Consent | بيانات العلاقة |

**قاعدة:** أسماء الأعمدة في Typeform/Google Sheets تُسمى بنفس أسماء المخطط أعلاه — فيُستورد السجل مباشرة إلى أي CRM لاحقاً دون remapping.

**قاعدة اللغات:** النسخ الثلاث تملأ نفس الأعمدة — الاختلاف الوحيد هو قيمة `language_preference` ونص الردود المفتوحة (تُرمَّز لاحقاً).

**تنسيق التصدير:** CSV أو Google Sheets (مباشر) — يُدمج مع `VALIDATION-DASHBOARD.md` ويملأ `Unified Entity Registry` (§7 من البنية).

## 5. دمج النسخ اللغوية (Multi-Language Merge)

| الخطوة | الإجراء |
|--------|---------|
| 1 | تصدير CSV من النسخ الثلاث معاً |
| 2 | توحيد الأعمدة (نفس Field Names) |
| 3 | كل رد يحمل `entity_id` + `language_preference` |
| 4 | ترميز النص المفتوح عبر اللغات في عمود `feedback` موحد |
| 5 | التحليل على المجموعة الكاملة ككيان واحد |

## 6. فحص الجاهزية قبل النشر (Pre-Launch Checklist — شامل اللغات)

- [ ] نص Consent ظاهر في الشاشة 1 (بنسخة اللغة المختارة) قبل أي سؤال
- [ ] جميع الأسئلة المغلقة Required في كل النسخ الثلاث
- [ ] أسئلة النص المفتوح غير إجبارية
- [ ] RTL صحيح (عربية/أوردو) + LTR (إنجليزية)
- [ ] Question IDs متطابقة في النسخ الثلاث
- [ ] رابط اختبار (Preview) يمر بالمنطق الشرطي كاملاً لكل لغة
- [ ] `src` و`lang` يعملان عبر URL Parameters
- [ ] Export إلى Google Sheets مفعّل (أعمدة موحدة)
- [ ] حد Anti-bot مفعّل
- [ ] رسالة الشكر تشرح استخدام البيانات (بلغة النسخة)

---

**✅ مخطط TYPEFORM-SPEC.md — جاهز (ثلاثي اللغات).**  
**الملف:** `docs/pilot-validation/TYPEFORM-SPEC.md`
