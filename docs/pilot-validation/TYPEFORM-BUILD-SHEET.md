# ABC — Typeform Build Sheet (ورقة بناء النماذج — للتنفيذ في Typeform UI)

**المرحلة:** Typeform Build Phase ✅  
**الهدف:** بناء النماذج الفعلية في Typeform حرفياً وفق `TYPEFORM-SPEC.md`  
**المنصة:** Typeform → Create → Typeform  
**اللغات:** 3 نسخ لكل استبيان (Arabic / English / Urdu)  
**المصادر:** `CONTRACTOR-SURVEY-MULTILANG.md` + `SUPPLIER-SURVEY-MULTILANG.md` + `CONSENT-DATA-USAGE.md`

> **كيف تستخدم هذه الورقة:** تتبع الشاشات بالترتيب، وأدخل النص من عمود اللغة المناسب لكل نسخة. Question IDs وأسماء الحقول ثابتة — لا تُعدَّل.

---

## 0. إنشاء النماذج (Create Flow)

| الخطوة | الإجراء |
|--------|---------|
| 1 | Create → New Typeform → Blank |
| 2 | أنشئ نموذجين منفصلين: **ABC Contractor Survey** و **ABC Supplier Survey** |
| 3 | في كل نموذج: Settings → Languages → أضف **Arabic (ar)** و**English (en)** و**Urdu (ur)** |
| 4 | اجعل النسخة الأساسية عربية (RTL)، وحدّث اتجاه EN إلى LTR |
| 5 | Settings → Form: Anti-bot ON + Time limit + Disable responses after هدف العينة |
| 6 | Connect → Google Sheets (إنشاء جدول بأعمدة المخطط الموحد — انظر `CRM-READY-OUTPUT-SPEC.md`) |

---

## 1. الشاشة 0 — اختيار اللغة (Language Selector) — في كل النماذج

| البند | القيمة |
|-------|--------|
| Question ID | **LANG** |
| Field Name | `language_preference` |
| النوع | Multiple Choice (تظهر كشاشة منفصلة في كل نسخة) |
| إجباري | نعم |

| خيار | نص (يظهر بلغة النسخة) |
|------|----------------------|
| `Arabic` | العربية |
| `English` | English |
| `Urdu` | اردو |

> **سلوك:** عند اختيار لغة تختلف عن النسخة الحالية → Typeform Language Routing يوجّه المستخدم للنسخة المختارة. القيمة تُسجَّل في عمود `language_preference`.

---

## 2. الشاشة 1 — الترحيب + Consent (Welcome + Legal)

| البند | القيمة |
|-------|--------|
| Question ID | **CONSENT** |
| Field Name | `consent_status` + `consent_date` |
| النوع | Legal (أو Statement + Multiple Choice) |
| إجباري | نعم |
| المنطق | رفض → إنهاء (End Form) |

### نص الموافقة (اللغات الثلاث) — من `CONSENT-DATA-USAGE.md`

| العربية | English | اردو |
|---------|---------|------|
| (النص الكامل في §1.1) | (النص الكامل في §1.2) | (النص الكامل في §1.3) |

### خيارات Consent

| العربية | English | اردو | السلوك |
|---------|---------|------|--------|
| ✅ موافق | ✅ Agree | ✅ رضامند | متابعة |
| ❌ لا أوافق | ❌ Disagree | ❌ رضامند نہیں | **End Form** (شاشة شكر قصيرة) |

> **تسجيل تلقائي:** `consent_status = granted` + `consent_date` = تاريخ الإرسال.

---

## 3. شاشات استبيان المقاولين (Contractor Survey) — الشاشات 2→18

> كل شاشة تُبنى بثلاث نسخ لغوية (الأسئلة من `CONTRACTOR-SURVEY-MULTILANG.md`).

### الشاشة 2 — Q0
| البند | القيمة |
|-------|--------|
| Question ID | **Q0** |
| Field Name | `source_detail` |
| النوع | Multiple Choice (إجباري) |

| العربية | English | اردو |
|---------|---------|------|
| كيف وصلت لهذا الاستبيان؟ | How did you reach this survey? | آپ اس سروے تک کیسے پہنچے؟ |
| LinkedIn / واتساب / إحالة / بريد / جمعية / أخرى | LinkedIn / WhatsApp / Referral / Email / Association / Other | لنکڈ ان / واٹس ایپ / سفارش / ای میل / انجمن / دیگر |

### الشاشة 3 — C-01 (entity_subtype)
Multiple Choice (إجباري) — مقاول عام / تخصصي / مطور / أخرى

### الشاشة 4 — C-02 (company_size)
Multiple Choice (إجباري) — <10 / 10-50 / 50-100 / >100

### الشاشة 5 — C-03 (annual_volume)
Multiple Choice (إجباري) — <5م / 5-10م / 10-50م / >50م درهم

### الشاشة 6 — C-10 (pain_points)
Multiple Selection **max 3** (إجباري) — أسعار غير شفافة / صعوبة إيجاد موردين / جودة / تأخير تسليم / توثيق / أخرى

### الشاشة 7 — C-11 (needs)
Multiple Choice (إجباري) — توصيات / Google / معارض / منصات / مندوبون

### الشاشة 8 — C-12 (needs)
Multiple Choice (إجباري) — لكل مشروع / غالباً / أحياناً / نادراً

### الشاشة 9 — C-13 (pain_points)
Multiple Choice (إجباري) — <يوم / 1-3 أيام / أسبوع / أكثر
**المنطق الشرطي:** تُعرض فقط إذا كانت إجابة C-12 ≠ "نادراً"

### الشاشة 10 — C-14 (business_activity)
Multiple Choice (إجباري) — 1-5 / 6-20 / 20+

### الشاشة 11 — C-V1 (feedback + pain_points)
Long Text (**غير إجباري** — يظهر بملاحظة "نصيحتك تساعدنا كثيراً")
السؤال: "ما آخر مرة واجهت فيها مشكلة الحصول على مورد أو سعر؟ ماذا فعلت لحلها؟" (بثلاث لغات)

### الشاشة 12 — C-21 (needs)
Rating/Drag-to-rank (إجباري) — سوق مواد / RFQ / مقارنة أسعار / موردون موثقون / دفع / تقارير

### الشاشة 13 — C-22 (adoption_interest)
Multiple Choice (إجباري) — سأستخدمها فعلياً / أخطط لذلك / ربما / لا أعلم / لا

### الشاشة 14 — C-23 (willingness_to_pay)
Multiple Choice (إجباري) — اشتراك شهري / سنوي / عمولة / Freemium ثم اشتراك

### الشاشة 15 — C-24 (willingness_to_pay)
Multiple Choice (إجباري) — <100 / 100-400 / 400-1,000 / >1,000 درهم

### الشاشة 16 — C-V2 (willingness_to_pay + pilot_status)
Multiple Choice (إجباري) — نعم / لا / أحتاج تفاصيل

### الشاشة 17 — FT-C (first_transaction_ready + ft_order_value)
Multiple Choice (إجباري) — "نعم — القيمة التقريبية: ____ درهم" / "لا"
**المنطق الشرطي:** إذا "نعم" → شاشة Short Text لإدخال القيمة (Field: `ft_order_value`)

### الشاشة 18 — Consent (relationship_status + contact)
Legal + Email (إجباري)
- سؤال: "هل نتواصل معك لمتابعة وتجربة المنصة؟"
- إذا "نعم" → **Email مطلوب** (Field: `contact_email`) + هاتف اختياري (Field: `contact_phone`)
- إذا "لا" → يُتخطى حقل البريد

---

## 4. شاشات استبيان الموردين (Supplier Survey) — الشاشات 2→23

> كل شاشة تُبنى بثلاث نسخ لغوية (الأسئلة من `SUPPLIER-SURVEY-MULTILANG.md`).

### الشاشة 2 — Q0 (مطابق للمقاولين)

### الشاشة 3 — S-01 (entity_subtype)
Multiple Choice (إجباري) — موزع / وكيل / مصنع / مستورد

### الشاشة 4 — S-02 (relevant_categories)
Multiple Selection (إجباري) — مواد أساسية / تشطيب / كهرباء / سباكة / أخرى

### الشاشة 5 — S-03 (company_size)
Multiple Choice (إجباري) — <10 / 10-20 / 20-50 / >50 موظف

### الشاشة 6 — S-06 (business_activity)
Multiple Choice (إجباري) — مقاولون / شركات / أفراد / حكومة

### الشاشة 7 — S-07 (business_activity)
Multiple Choice (إجباري) — <10 / 10-50 / 50-100 / >100

### الشاشة 8 — S-08 (needs)
Multiple Choice (إجباري) — مندوبون / توصيات / إعلانات / منصات / معارض

### الشاشة 9 — S-09 (pain_points)
Multiple Choice (إجباري) — وصول للمقاولين / منافسة / تكلفة تسويق / أخرى

### الشاشة 10 — S-V1 (feedback + pain_points)
Long Text (**غير إجباري**) — "ما آخر صفقة أو عميل جديد حصلت عليه؟ كم كلفك الوصول إليه؟"

### الشاشة 11 — S-10 (needs)
Multiple Choice (إجباري) — واتساب / بريد / هاتف / منصة

### الشاشة 12 — S-11 (business_activity)
Multiple Choice (إجباري) — <5 / 5-20 / 20-50 / >50

### الشاشة 13 — S-12 (has_catalog)
Multiple Choice نعم/لا (إجباري)

### الشاشة 14 — S-13 (digital_maturity)
Multiple Choice (إجباري) — ERP / Excel / يدوي

### الشاشة 15 — S-16 (digital_maturity)
Multiple Choice (إجباري) — جاهز / يحتاج دعماً / لا

### الشاشة 16 — S-17 (digital_maturity)
Multiple Choice (إجباري) — نشط / غير نشط / لا يوجد

### الشاشة 17 — S-21 (needs)
Multiple Choice (إجباري) — وصول لمقاولين / زيادة مبيعات / كتالوج / تقارير / لا شيء

### الشاشة 18 — S-22 (pain_points)
Multiple Choice (إجباري) — عمولة عالية / منافسة / تعقيد / أمان

### الشاشة 19 — S-23 (willingness_to_pay)
Multiple Choice (إجباري) — Freemium+عمولة / شهري / سنوي / عمولة فقط

### الشاشة 20 — S-24 (commission_acceptance)
Multiple Choice (إجباري) — <1% / 1-3% / 3-5% / 5-10%

### الشاشة 21 — S-V2 (willingness_to_pay + pilot_status)
Multiple Choice (إجباري) — نعم / لا / أحتاج تفاصيل

### الشاشة 22 — FT-S (first_transaction_ready + ft_order_value)
Multiple Choice (إجباري) — "نعم — نطاق القيمة: ____ درهم" / "لا"
**المنطق:** إذا "نعم" → Short Text للقيمة

### الشاشة 23 — Consent (relationship_status + contact)
مطابق لشاشة 18 للمقاولين

---

## 5. شاشة الإنهاء (End Screen — لكل نسخة لغوية)

| العربية | English | اردو |
|---------|---------|------|
| شكراً لمشاركتك! سيساهم رأيك في بناء منصة ABC. بياناتك تُستخدم فقط لأغراض تطوير المنتج وبسرية تامة. | Thank you! Your input will help build ABC. Your data is used only for product development, fully confidential. | شرکت کرنے کا شکریہ! آپ کی رائے ABC پلیٹ فارم بنانے میں مدد دے گی۔ آپ کا ڈیٹا صرف پروڈکٹ کی ترقی کے لیے استعمال ہوتا ہے، مکمل طور پر خفیہ۔ |

> **رسالة C-V2/S-V2 = نعم:** تُظهر رسالة "سنوافيك بتفاصيل المرحلة التجريبية" في شاشة الإنهاء (منطق شرطي).

---

## 6. قواعد عامة أثناء البناء

| القاعدة | التطبيق |
|---------|---------|
| Question IDs ثابتة | لا تُعدّل — تُستخدم للمطابقة والتحليل |
| Field Names ثابتة | أسماء الحقول في المخطط الموحد — تُستخدم كأسماء أعمدة التصدير |
| النوع الصحيح | Single→Multiple Choice / Multi→Multiple Selection(max3) / نص→Long Text / قيمة→Short Text |
| الإجبار | كل الأسئلة المغلقة Required + النص المفتوح اختياري |
| المنطق الشرطي | C-13 يعتمد C-12 / FT→قيمة / Consent→بريد / LANG→Language Routing |
| الرابط | `https://typeform.com/to/XXXX?lang=ar&src=linkedin` — لغة مسبقة + مصدر |

---

## 7. مسارات الروابط (Link Routing)

| القناة | الرابط |
|--------|--------|
| LinkedIn | `?lang=ar|en|ur&src=linkedin` |
| WhatsApp | `?lang=ar|en|ur&src=whatsapp` |
| Referral | `?lang=ar|en|ur&src=referral` |
| Email | `?lang=ar|en|ur&src=email` |
| Association | `?lang=ar|en|ur&src=association` |
| Other | `?lang=ar|en|ur&src=other` |

> **حقل `source`** يُشتق من `src`، و`source_detail` من Q0.

---

**✅ ورقة TYPEFORM-BUILD-SHEET.md — جاهزة للبناء.**  
**الملف:** `docs/pilot-validation/TYPEFORM-BUILD-SHEET.md`  
**الخطوة التالية:** إنشاء `CRM-READY-OUTPUT-SPEC.md` ثم `QA-CHECKLIST.md` و`INTERNAL-PILOT-TEST.md`
