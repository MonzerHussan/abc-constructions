# ABC — Supplier Survey (ثلاثي اللغات / Trilingual) — الموردون

**المرحلة:** Pilot Validation Phase  
**الأداة:** استبيان كمّي — نسخة كاملة باللغات الثلاث (العربية / English / اردو)  
**الجمهور:** 20 مورّداً (موزعون + وكلاء + مصنعون + مستوردون)  
**مدة الإكمال:** 8-12 دقيقة  
**المصدر المرجعي:** `SUPPLIER-SURVEY.md` (النسخة العربية هي المرجع)  
**عقدة التوافق:** `MULTI-LANGUAGE-STANDARD.md`

> **قاعدة التصميم:** كل سؤال له **نفس Question ID ونفس Field Name ونفس الافتراض ونفس معيار النجاح ونفس الحقل في المخطط الموحد** — عبر اللغات الثلاث. النص الحر (S-V1) يُسمح به بأي لغة.

---

## الشاشة الأولى: اختيار اللغة / Language / زبان

```
🌐 اختر لغتك / Choose your language / اپنی زبان منتخب کریں
- العربية (Arabic)
- English
- اردو (Urdu)
```

> **الحقل:** `language_preference` → يُخزَّن في Entity Identity.

---

## 1. المصدر + الشريحة (Source + Data)

| Question ID | Field Name | العربية | English | اردو |
|-------------|-----------|---------|---------|------|
| Q0 | source_detail | كيف وصلت لهذا الاستبيان؟ | How did you reach this survey? | آپ اس سروے تک کیسے پہنچے؟ |
| | Options | LinkedIn / واتساب / إحالة / بريد / جمعية / أخرى | LinkedIn / WhatsApp / Referral / Email / Association / Other | لنکڈ ان / واٹس ایپ / سفارش / ای میل / انجمن / دیگر |
| S-01 | entity_subtype | نوع نشاطك؟ | What is your business type? | آپ کا کاروبار کس قسم کا ہے؟ |
| | Options | موزع / وكيل / مصنع / مستورد | Distributor / Agent / Manufacturer / Importer | ڈسٹریبیوٹر / ایجنٹ / مینوفیکچرر / امپورٹر |
| S-02 | relevant_categories | فئات منتجاتك الرئيسية؟ | What are your main product categories? | آپ کی اہم مصنوعات کی اقسام کیا ہیں؟ |
| | Options | مواد أساسية / تشطيب / كهرباء / سباكة / أخرى | Basic materials / Finishing / Electrical / Plumbing / Other | بنیادی مواد / فنشنگ / الیکٹریکل / پلمبنگ / دیگر |
| S-03 | company_size | حجم منشأتك؟ | What is the size of your organization? | آپ کی تنظیم کا حجم کیا ہے؟ |
| | Options | <10 / 10-20 / 20-50 / >50 موظف | <10 / 10-20 / 20-50 / >50 employees | 10 سے کم / 10-20 / 20-50 / 50 سے زیادہ ملازمین |

---

## 2. المبيعات والقنوات (Sales & Channels)

| Question ID | Field Name | العربية | English | اردو |
|-------------|-----------|---------|---------|------|
| S-06 | business_activity | في الشهر الماضي، من كان عملاؤك الفعليون؟ | Last month, who were your actual customers? | پچھلے مہینے آپ کے اصل گاہک کون تھے؟ |
| | Options | مقاولون / شركات / أفراد / حكومة | Contractors / Companies / Individuals / Government | کنٹریکٹرز / کمپنیاں / افراد / حکومت |
| S-07 | business_activity | كم عميلاً نشطاً تعاملت معهم في الشهر الماضي؟ | How many active clients did you deal with last month? | پچھلے مہینے آپ نے کتنے فعال گاہکوں سے معاملہ کیا؟ |
| | Options | <10 / 10-50 / 50-100 / >100 | <10 / 10-50 / 50-100 / >100 | 10 سے کم / 10-50 / 50-100 / 100 سے زیادہ |
| S-08 | needs | من آخر عميل جديد اكتسبته، كيف وصل إليك؟ | Your last new client — how did they reach you? | آپ کا آخری نیا گاہک — وہ آپ تک کیسے پہنچا؟ |
| | Options | مندوبون / توصيات / إعلانات / منصات / معارض | Sales reps / Recommendations / Ads / Platforms / Exhibitions | سیلز ریپس / سفارشات / اشتہارات / پلیٹ فارمز / نمائشیں |
| S-09 | pain_points | في آخر 6 أشهر، ما أكبر تحدٍ واجهته في اكتساب عملاء جدد؟ | In the last 6 months, what was the biggest challenge acquiring new customers? | پچھلے 6 مہینوں میں، نئے گاہک حاصل کرنے میں سب سے بڑا چیلنج کیا تھا؟ |
| | Options | وصول للمقاولين / منافسة / تكلفة تسويق / أخرى | Reaching contractors / Competition / Marketing cost / Other | کنٹریکٹرز تک رسائی / مقابلہ / مارکیٹنگ لاگت / دیگر |
| **S-V1** | feedback + pain_points | **ما آخر صفقة أو عميل جديد حصلت عليه؟ كم كلفك الوصول إليه (مقابل/إعلانات/وقت)؟** (نص مفتوح — بأي لغة) | **Your last deal or new customer — how much did it cost you to reach them (fees/ads/time)?** (open text — any language) | **آپ کا آخری سودا یا نیا گاہک — ان تک پہنچنے میں آپ کو کتنا خرچ آیا (فیس/اشتہارات/وقت)؟** (کھلا متن — کسی بھی زبان میں) |

---

## 3. RFQ الحالي (Current RFQ)

| Question ID | Field Name | العربية | English | اردو |
|-------------|-----------|---------|---------|------|
| S-10 | needs | في آخر طلب عرض (RFQ) استقبلته، كيف وصل إليك؟ | Your last RFQ received — how did it reach you? | آپ کو ملا آخری RFQ — وہ آپ تک کیسے پہنچا؟ |
| | Options | واتساب / بريد / هاتف / منصة | WhatsApp / Email / Phone / Platform | واٹس ایپ / ای میل / فون / پلیٹ فارم |
| S-11 | business_activity | كم طلب عرض (RFQ) استقبلته في الشهر الماضي؟ | How many RFQs did you receive last month? | پچھلے مہینے آپ نے کتنے RFQs حاصل کیے؟ |
| | Options | <5 / 5-20 / 20-50 / >50 | <5 / 5-20 / 20-50 / >50 | 5 سے کم / 5-20 / 20-50 / 50 سے زیادہ |

---

## 4. الجاهزية الرقمية (Digital Readiness)

| Question ID | Field Name | العربية | English | اردو |
|-------------|-----------|---------|---------|------|
| S-12 | has_catalog | هل لديك كتالوج إلكتروني؟ | Do you have an electronic catalog? | کیا آپ کے پاس الیکٹرانک کیٹلاگ ہے؟ |
| | Options | نعم / لا | Yes / No | جی ہاں / نہیں |
| S-13 | digital_maturity | كيف تدير المخزون؟ | How do you manage inventory? | آپ انوینٹری کا انتظام کیسے کرتے ہیں؟ |
| | Options | ERP / Excel / يدوي | ERP / Excel / Manual | ERP / ایکسل / دستی |
| S-16 | digital_maturity | هل تستطيع الربط عبر API؟ | Can you connect via API? | کیا آپ API کے ذریعے جڑ سکتے ہیں؟ |
| | Options | جاهز / يحتاج دعماً / لا | Ready / Needs support / No | تیار / مدد کی ضرورت / نہیں |
| S-17 | digital_maturity | حضورك الرقمي (سوشيال)؟ | Your digital presence (social)? | آپ کی ڈیجیٹل موجودگی (سوشل)؟ |
| | Options | نشط / غير نشط / لا يوجد | Active / Inactive / None | فعال / غیر فعال / کوئی نہیں |

---

## 5. الانضمام إلى ABC (WTP)

| Question ID | Field Name | العربية | English | اردو |
|-------------|-----------|---------|---------|------|
| S-21 | needs | ما الذي دفعك فعلياً للتفكير في قنوات بيع جديدة خلال الـ 6 أشهر الماضية؟ | What actually prompted you to consider new sales channels in the past 6 months? | پچھلے 6 مہینوں میں آپ کو نئے سیلز چینلز پر غور کرنے کے لیے اصل میں کس چیز نے آمادہ کیا؟ |
| | Options | وصول لمقاولين / زيادة مبيعات / كتالوج / تقارير / لا شيء | Reaching contractors / Increasing sales / Catalog / Reports / Nothing | کنٹریکٹرز تک رسائی / فروخت میں اضافہ / کیٹلاگ / رپورٹس / کچھ نہیں |
| S-22 | pain_points | ما أكثر ما يقلقك في الانضمام إلى منصة رقمية للبيع؟ | What worries you most about joining a digital sales platform? | ڈیجیٹل سیلز پلیٹ فارم میں شامل ہونے پر آپ کو سب سے زیادہ کس چیز کی فکر ہے؟ |
| | Options | عمولة عالية / منافسة / تعقيد / أمان | High commission / Competition / Complexity / Security | زیادہ کمیشن / مقابلہ / پیچیدگی / سیکیورٹی |
| S-23 | willingness_to_pay | لو اشتركت في ABC، أي نموذج دفع تفضله؟ | If you subscribed to ABC, which payment model do you prefer? | اگر آپ ABC میں سبسکرائب ہوتے ہیں تو آپ کون سا ادائیگی ماڈل پسند کریں گے؟ |
| | Options | Freemium+عمولة / شهري / سنوي / عمولة فقط | Freemium+commission / Monthly / Annual / Commission only | فری میم+کمیشن / ماہانہ / سالانہ / صرف کمیشن |
| S-24 | commission_acceptance | ما الحد الأقصى لنسبة العمولة التي تدفعها عن صفقة مكتملة؟ | What is the maximum commission rate you would pay per completed deal? | مکمل ہونے والے سودے پر آپ زیادہ سے زیادہ کمیشن کی شرح کتنی ادا کریں گے؟ |
| | Options | <1% / 1-3% / 3-5% / 5-10% | <1% / 1-3% / 3-5% / 5-10% | 1% سے کم / 1-3% / 3-5% / 5-10% |
| **S-V2** | willingness_to_pay + pilot_status | **هل أنت مستعد لدفع اشتراك تجريبي (مثلاً 250 درهم) قبل الإطلاق لاختبار المنصة؟** | **Are you willing to pay a trial subscription (e.g. 250 AED) before launch to test the platform?** | **کیا آپ پلیٹ فارم کو جانچنے کے لیے لانچ سے پہلے آزمائشی سبسکرپشن (مثلاً 250 درہم) ادا کرنے کے لیے تیار ہیں؟** |
| | Options | نعم / لا / أحتاج تفاصيل | Yes / No / I need details | جی ہاں / نہیں / مجھے تفصیلات چاہییں |

---

## 6. First Transaction (مؤشر أساسي)

| Question ID | Field Name | العربية | English | اردو |
|-------------|-----------|---------|---------|------|
| FT-S | first_transaction_ready + ft_order_value | هل لديك حالياً قدرة ومخزون لتقديم عرض سعر (Quote) لطلب حقيقي خلال هذا الربع؟ | Do you currently have capacity and stock to quote on a real request this quarter? | کیا آپ کے پاس فی الحال اس سہ ماہی میں حقیقی درخواست پر قیمت دینے کی صلاحیت اور اسٹاک موجود ہے؟ |
| | Options | نعم — نطاق القيمة: ____ درهم / لا | Yes — value range: ____ AED / No | جی ہاں — قیمت کی حد: ____ درہم / نہیں |

---

## 7. الختام: Consent (الموافقة)

| Question ID | Field Name | العربية | English | اردو |
|-------------|-----------|---------|---------|------|
| Consent | relationship_status + contact | هل نتواصل معك لاختبار المنصة؟ | May we contact you to test the platform? | کیا ہم پلیٹ فارم کی جانچ کے لیے آپ سے رابطہ کر سکتے ہیں؟ |
| | Options | نعم + بريد/هاتف / لا | Yes + email/phone / No | جی ہاں + ای میل/فون / نہیں |

> **نص الموافقة الكامل:** انظر `CONSENT-DATA-USAGE.md` (اللغات الثلاث).

---

## 8. شاشات الشكر (Thank-you — اللغات الثلاث)

| العربية | English | اردو |
|---------|---------|------|
| شكراً لمشاركتك! سيساهم رأيك في بناء منصة ABC. | Thank you! Your input will help build ABC platform. | شرکت کرنے کا شکریہ! آپ کی رائے ABC پلیٹ فارم بنانے میں مدد دے گی۔ |

---

## 9. التوافق مع المخطط الموحد (بقيمة واحدة عبر اللغات)

| Field Name | Question ID | Entity Category |
|------------|-------------|-----------------|
| `entity_subtype` | S-01 | SUPP |
| `relevant_categories` | S-02 | SUPP |
| `company_size` | S-03 | SUPP |
| `pain_points` | S-09, S-22, S-V1 | SUPP |
| `needs` | S-08, S-10, S-21 | SUPP |
| `has_catalog` / `digital_maturity` | S-12, S-13, S-16, S-17 | SUPP |
| `willingness_to_pay` / `commission_acceptance` | S-23, S-24, S-V2 | SUPP |
| `first_transaction_ready` / `ft_order_value` | FT-S | SUPP |
| `language_preference` | شاشة اللغة الأولى | SUPP |

---

**✅ استبيان SUPPLIER-SURVEY (ثلاثي اللغات) — جاهز.**  
**الملف:** `docs/pilot-validation/SUPPLIER-SURVEY-MULTILANG.md`
