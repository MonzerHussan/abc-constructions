# ABC — Contractor Survey (ثلاثي اللغات / Trilingual) — المقاولون

**المرحلة:** Pilot Validation Phase  
**الأداة:** استبيان كمّي — نسخة كاملة باللغات الثلاث (العربية / English / اردو)  
**الجمهور:** 20 مقاولاً (SMB أولوية — دبي/أبوظبي/الشارقة)  
**مدة الإكمال:** 8-12 دقيقة  
**المصدر المرجعي:** `CONTRACTOR-SURVEY.md` (النسخة العربية هي المرجع)  
**عقدة التوافق:** `MULTI-LANGUAGE-STANDARD.md`

> **قاعدة التصميم:** كل سؤال له **نفس Question ID ونفس Field Name ونفس الافتراض ونفس معيار النجاح ونفس الحقل في المخطط الموحد** — عبر اللغات الثلاث. النص الحر (C-V1) يُسمح به بأي لغة.

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
| C-01 | entity_subtype | نوع نشاطك؟ | What is your business type? | آپ کا کاروبار کس قسم کا ہے؟ |
| | Options | مقاول عام / تخصصي / مطور / أخرى | General Contractor / Specialized / Developer / Other | جنرل کنٹریکٹر / خصوصی / ڈیولپر / دیگر |
| C-02 | company_size | عدد موظفيك؟ | How many employees do you have? | آپ کے ملازمین کی تعداد کتنی ہے؟ |
| | Options | <10 / 10-50 / 50-100 / >100 | <10 / 10-50 / 50-100 / >100 | 10 سے کم / 10-50 / 50-100 / 100 سے زیادہ |
| C-03 | annual_volume | حجم مشاريعك السنوية؟ | What is your annual project volume? | آپ کے سالانہ پروجیکٹس کا حجم کیا ہے؟ |
| | Options | <5م / 5-10م / 10-50م / >50م درهم | <5M / 5-10M / 10-50M / >50M AED | 5 ملین سے کم / 5-10 ملین / 10-50 ملین / 50 ملین سے زیادہ درہم |

---

## 2. الألم والتوريد (Pain & Procurement)

| Question ID | Field Name | العربية | English | اردو |
|-------------|-----------|---------|---------|------|
| C-10 | pain_points | خلال الـ 6 أشهر الماضية، أي من مشاكل شراء المواد التالية واجهتها فعلياً؟ (اختر 3) | In the past 6 months, which material procurement problems did you actually face? (select up to 3) | پچھلے 6 مہینوں میں، مواد خریدنے کے درج ذیل مسائل میں سے آپ کو اصل میں کون سے مسائل پیش آئے؟ (زیادہ سے زیادہ 3 منتخب کریں) |
| | Options | أسعار غير شفافة / صعوبة إيجاد موردين / جودة / تأخير تسليم / توثيق / أخرى | Non-transparent prices / Difficulty finding suppliers / Quality / Delivery delays / Documentation / Other | غیر شفاف قیمتیں / سپلائر تلاش کرنے میں دشواری / معیار / ڈیلیوری میں تاخیر / دستاویزات / دیگر |
| C-11 | needs | في آخر مرة بحثت فيها عن مورد جديد، كيف وجدته؟ | Last time you looked for a new supplier, how did you find them? | پچھلی بار جب آپ نے نیا سپلائر تلاش کیا تو آپ نے اسے کیسے پایا؟ |
| | Options | توصيات / Google / معارض / منصات / مندوبون | Recommendations / Google / Exhibitions / Platforms / Sales reps | سفارشات / گوگل / نمائشیں / پلیٹ فارمز / سیلز ریپس |
| C-12 | needs | في مشروعك الأخير، هل أرسلت طلبات عروض (RFQ)؟ | In your latest project, did you send Requests for Quotation (RFQ)? | آپ کے آخری پروجیکٹ میں، کیا آپ نے قیمت کی درخواستیں (RFQ) بھیجیں؟ |
| | Options | لكل مشروع / غالباً / أحياناً / نادراً | Every project / Often / Sometimes / Rarely | ہر پروجیکٹ / اکثر / کبھی کبھار / شاذ و نادر |
| C-13 | pain_points | في آخر RFQ أرسلته، كم استغرقت العملية (من الطلب إلى استلام العروض)؟ | In your last RFQ, how long did the process take (from request to receiving quotes)? | آپ کے آخری RFQ میں، عمل میں کتنا وقت لگا (درخواست سے قیمت حاصل کرنے تک)؟ |
| | Options | <يوم / 1-3 أيام / أسبوع / أكثر | <1 day / 1-3 days / A week / More | ایک دن سے کم / 1-3 دن / ایک ہفتہ / زیادہ |
| C-14 | business_activity | كم مورداً تعاملت معهم في الشهر الماضي؟ | How many suppliers did you work with last month? | پچھلے مہینے آپ نے کتنے سپلائرز کے ساتھ کام کیا؟ |
| | Options | 1-5 / 6-20 / 20+ | 1-5 / 6-20 / 20+ | 1-5 / 6-20 / 20 سے زیادہ |
| **C-V1** | feedback + pain_points | **ما آخر مرة واجهت فيها مشكلة الحصول على مورد أو سعر؟ ماذا فعلت لحلها؟** (نص مفتوح — بأي لغة) | **The last time you faced a problem getting a supplier or a price, what did you do to solve it?** (open text — any language) | **آخری بار جب آپ کو سپلائر یا قیمت حاصل کرنے میں مسئلہ پیش آیا، تو آپ نے اسے حل کرنے کے لیے کیا کیا؟** (کھلا متن — کسی بھی زبان میں) |

---

## 3. الميزات المطلوبة (Required Features)

| Question ID | Field Name | العربية | English | اردو |
|-------------|-----------|---------|---------|------|
| C-21 | needs | رتب أهم الخدمات الرقمية لك؟ (اسحب واطلب الترتيب) | Rank the most important digital services for you? (drag to rank) | اپنے لیے سب سے اہم ڈیجیٹل خدمات کی ترتیب دیں؟ (گھسیٹ کر ترتیب دیں) |
| | Options | سوق مواد / RFQ / مقارنة أسعار / موردون موثقون / دفع / تقارير | Material marketplace / RFQ / Price comparison / Verified suppliers / Payments / Reports | میٹریل مارکیٹ پلیس / RFQ / قیمت کا موازنہ / تصدیق شدہ سپلائرز / ادائیگی / رپورٹس |

---

## 4. الجاهزية والدفع (Readiness & WTP)

| Question ID | Field Name | العربية | English | اردو |
|-------------|-----------|---------|---------|------|
| C-22 | adoption_interest | خلال الـ 12 شهراً القادمة، هل ستستخدم منصة تجمع موردين موثقين؟ | In the next 12 months, will you use a platform that brings together verified suppliers? | اگلے 12 مہینوں میں، کیا آپ ایسا پلیٹ فارم استعمال کریں گے جو تصدیق شدہ سپلائرز کو اکٹھا کرتا ہے؟ |
| | Options | سأستخدمها فعلياً / أخطط لذلك / ربما / لا أعلم / لا | I will definitely use it / I plan to / Maybe / I don't know / No | یقیناً استعمال کروں گا / ارادہ ہے / شاید / مجھے معلوم نہیں / نہیں |
| C-23 | willingness_to_pay | لو دفعت مقابل منصة ABC، أي نموذج دفع تفضله؟ | If you paid for the ABC platform, which payment model do you prefer? | اگر آپ ABC پلیٹ فارم کے لیے ادائیگی کریں تو آپ کون سا ادائیگی ماڈل پسند کریں گے؟ |
| | Options | اشتراك شهري / سنوي / عمولة / Freemium ثم اشتراك | Monthly / Annual / Commission / Freemium then subscription | ماہانہ / سالانہ / کمیشن / فری میم پھر سبسکرپشن |
| C-24 | willingness_to_pay | ما الحد الأقصى الذي تدفعه شهرياً فعلياً مقابل هذه الخدمة؟ | What is the maximum you would actually pay monthly for this service? | اس سروس کے لیے آپ ماہانہ زیادہ سے زیادہ کتنی ادائیگی کریں گے؟ |
| | Options | <100 / 100-400 / 400-1,000 / >1,000 درهم | <100 / 100-400 / 400-1,000 / >1,000 AED | 100 سے کم / 100-400 / 400-1,000 / 1,000 سے زیادہ درہم |
| **C-V2** | willingness_to_pay + pilot_status | **هل أنت مستعد لإيداع مبلغ رمزي (مثلاً 200 درهم) كوديعة تجريبية قبل الإطلاق؟** | **Are you willing to deposit a nominal amount (e.g. 200 AED) as a trial deposit before launch?** | **کیا آپ لانچ سے پہلے آزمائشی رقم (مثلاً 200 درہم) جمع کرانے کے لیے تیار ہیں؟** |
| | Options | نعم / لا / أحتاج تفاصيل | Yes / No / I need details | جی ہاں / نہیں / مجھے تفصیلات چاہییں |

---

## 5. First Transaction (مؤشر أساسي)

| Question ID | Field Name | العربية | English | اردو |
|-------------|-----------|---------|---------|------|
| FT-C | first_transaction_ready + ft_order_value | هل لديك حالياً طلب شراء مواد مفتوح (قبل نهاية الربع)؟ | Do you currently have an open material purchase order (before end of quarter)? | کیا آپ کے پاس فی الحال مواد کی خریداری کا کوئی کھلا آرڈر ہے (سہ ماہی کے اختتام سے پہلے)؟ |
| | Options | نعم — القيمة التقريبية: ____ درهم / لا | Yes — approx. value: ____ AED / No | جی ہاں — تقریبی قیمت: ____ درہم / نہیں |

---

## 6. الختام: Consent (الموافقة)

| Question ID | Field Name | العربية | English | اردو |
|-------------|-----------|---------|---------|------|
| Consent | relationship_status + contact | هل نتواصل معك لمتابعة وتجربة المنصة؟ | May we contact you to follow up and try the platform? | کیا ہم پلیٹ فارم آزمانے اور فالو اپ کے لیے آپ سے رابطہ کر سکتے ہیں؟ |
| | Options | نعم + بريد/هاتف / لا | Yes + email/phone / No | جی ہاں + ای میل/فون / نہیں |

> **نص الموافقة الكامل:** انظر `CONSENT-DATA-USAGE.md` (اللغات الثلاث).

---

## 7. شاشات الشكر (Thank-you — اللغات الثلاث)

| العربية | English | اردو |
|---------|---------|------|
| شكراً لمشاركتك! سيساهم رأيك في بناء منصة ABC. | Thank you! Your input will help build ABC platform. | شرکت کرنے کا شکریہ! آپ کی رائے ABC پلیٹ فارم بنانے میں مدد دے گی۔ |

---

## 8. التوافق مع المخطط الموحد (بقيمة واحدة عبر اللغات)

> كل سؤال يكتب في نفس حقل Entity بغض النظر عن اللغة — التفاصيل في `PILOT-DATA-ARCHITECTURE.md` (§5).

| Field Name | Question ID | Entity Category |
|------------|-------------|-----------------|
| `entity_subtype` | C-01 | CUST |
| `company_size` | C-02 | CUST |
| `annual_volume` | C-03 | CUST |
| `pain_points` | C-10, C-13, C-V1 | CUST |
| `needs` | C-11, C-12, C-21 | CUST |
| `willingness_to_pay` | C-23, C-24, C-V2 | CUST |
| `adoption_interest` | C-22 | CUST |
| `first_transaction_ready` / `ft_order_value` | FT-C | CUST |
| `language_preference` | شاشة اللغة الأولى | CUST |

---

**✅ استبيان CONTRACTOR-SURVEY (ثلاثي اللغات) — جاهز.**  
**الملف:** `docs/pilot-validation/CONTRACTOR-SURVEY-MULTILANG.md`
