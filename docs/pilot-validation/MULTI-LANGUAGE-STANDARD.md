# ABC — Multi-Language Standard (عقدة التوافق متعدد اللغات)

**المرحلة:** Pilot Preparation Phase  
**الوضع:** ✅ ضمن Baseline المعتمد  
**الغرض:** ضمان أن كل أدوات الـ Pilot متوفرة بالكامل باللغات الرسمية الثلاث (العربية / English / اردو) مع **توافق مطلق** في المعرّفات والحقول — بحيث تُدمج نتائج اللغات الثلاث وتُحلَّل وتُحوَّل إلى CRM/ERP دون فقدان أي معلومة.

---

## 1. اللغات الرسمية الثلاث

| الرمز | اللغة | الاتجاه | السيناريو المستهدف في الإمارات |
|-------|-------|---------|-------------------------------|
| `ar` | العربية (Arabic) | RTL | الشركات والموردون المحليون |
| `en` | الإنجليزية (English) | LTR | الشركات متعددة الجنسيات |
| `ur` | الأوردو (Urdu) | RTL | القوى العاملة والمقاولون الناطقون بالأوردو |

> **القاعدة:** **نسخة كاملة لكل أداة بكل لغة** — لا ترجمات جزئية ولا سطور مختلطة.

---

## 2. مبدأ التوافق (Consistency Contract)

> **التوافق يعني:** نفس المعرّف، نفس الحقل، نفس المعنى — بغض النظر عن اللغة.

| العنصر | القاعدة |
|--------|---------|
| **Question ID** | مطابق تماماً عبر اللغات (C-01، C-V1، FT-C، ...) — لا يُعاد ترميزه |
| **Field Name** | مطابق (يُستخدم كاسم العمود في التخزين/التصدير) |
| **Question–Assumption Mapping** | مطابق (الافتراض المرتبط واحد لكل اللغات) |
| **Validation Criteria** | مطابق (نفس معيار النجاح S-## وعتباته) |
| **Entity Schema Mapping** | مطابق (نفس الحقل الهدف في المخطط الموحد) |
| **الخيارات** | نفس القيمة الدلالية (تترجم القيمة لا المعنى) |

> **مثال تطبيقي:**
> - `C-24` بالعربية: "ما الحد الأقصى الذي تدفعه شهرياً فعلياً مقابل هذه الخدمة؟"
> - `C-24` بالإنجليزية: "What is the maximum you would actually pay monthly for this service?"
> - `C-24` بالأوردو: "اس سروس کے لیے آپ ماہانہ زیادہ سے زیادہ کتنی ادائیگی کریں گے؟"
> - الخيارات جميعها: `<100` / `100-400` / `400-1,000` / `>1,000` درهم — **القيم الرقمية ثابتة**
> - الافتراض: `P-01` | معيار النجاح: `S-03` | الحقل: `willingness_to_pay`

---

## 3. حقل Language Preference (تفضيل اللغة)

> **حقل أساسي جديد لكل Entity** — يُضاف إلى المخطط الموحد (Identity) ويُسجَّل في أول شاشة من الاستبيان.

| الحقل | النوع | القيم | ملاحظة تحويل CRM |
|-------|-------|-------|------------------|
| `language_preference` | Enum | `Arabic` / `English` / `Urdu` | Communication Preference |

### 3.1 لماذا نحفظه؟
- **CRM:** تحديد لغة التواصل التلقائي مع كل Account/Contact.
- **Marketing Automation:** إرسال الحملات باللغة المفضلة لكل شريحة.
- **Customer Success:** دعم العملاء بلغة العميل.
- **Communication Preferences:** كل المراسلات (Email/WhatsApp/SMS) تُوجَّه باللغة المحفوظة.

### 3.2 كيف يُسجَّل؟
- **سؤال أول (غير إجبارية الإجابة التلقائية):** "ما لغتك المفضلة للتواصل؟ / Your preferred language? / آپ کی ترجیحی زبان؟"
- **افتراضي ذكي:** اللغة الافتراضية تُستنتج من القناة (رابط عربي→ar، رابط أوردو→ur) وتُعرض للمستخدم لتأكيدها أو تغييرها.
- يُخزَّن في `language_preference` ضمن Entity Identity.

### 3.3 واجهة اختيار اللغة (Language Selector)

```
🌐 اختر لغتك / Choose your language / اپنی زبان منتخب کریں
- العربية
- English
- اردو
```

---

## 4. الملفات الثلاثية اللغة (Trilingual Files)

| الملف | العربية | English | اردو |
|-------|---------|---------|------|
| Contractor Survey | `CONTRACTOR-SURVEY.md` | `CONTRACTOR-SURVEY-MULTILANG.md` (عمود EN) | نفس الملف (عمود UR) |
| Supplier Survey | `SUPPLIER-SURVEY.md` | `SUPPLIER-SURVEY-MULTILANG.md` (عمود EN) | نفس الملف (عمود UR) |
| Interview Script | `INTERVIEW-SCRIPT.md` | `INTERVIEW-SCRIPT-MULTILANG.md` | نفس الملف |
| Consent | `CONSENT-DATA-USAGE.md` | §EN | §UR |
| Feedback Forms | `FEEDBACK-COLLECTION-SYSTEM.md` + `FEEDBACK-FRAMEWORK.md` | MULTILANG | MULTILANG |
| Invitation Messages | `SAMPLE-CONTACT-PLAN.md` §4 | `COMMUNICATION-MESSAGES-MULTILANG.md` | نفس الملف |
| Follow-up Messages | `SAMPLE-CONTACT-PLAN.md` §4 | `COMMUNICATION-MESSAGES-MULTILANG.md` | نفس الملف |
| Typeform | `TYPEFORM-SPEC.md` (3 نسخ لغات) | §2 | §2 |

---

## 5. قواعد الترجمة (Translation Rules)

| القاعدة | التفصيل |
|---------|---------|
| **دقة دلالية** | الترجمة للدلالة لا حرفياً — أي صياغة تُبقي المعنى والسلوك المطلوب |
| **عدم القيادة (Non-leading)** | تُحافظ الترجمة على الحياد — لا صيغ موحية في أي لغة |
| **ثبات الأرقام والعملة** | الأرقام والنطاقات (AED، %، موظف) لا تُترجم بل تُثبَّت |
| **مراجعة التوافق** | قبل النشر: جدول تحقق بكل Question ID في اللغات الثلاث مطابق للمصدر |
| **المصدر المرجعي** | النسخة العربية هي المرجع (Source of Truth) — الترجمة تُطابقها 100% |

---

## 6. دمج النتائج عبر اللغات (Cross-Language Merge)

> **التخزين:** كل الردود بكل اللغات تُدمج في **نفس** Unified Entity Registry — لا جداول منفصلة لكل لغة.

| الخطوة | الإجراء |
|--------|---------|
| 1 | كل رد يُخزَّن تحت `entity_id` + `language_preference` |
| 2 | نفس `Question ID` يكتب في نفس العمود — لا يتأثر باختلاف اللغة |
| 3 | النص المفتوح (C-V1/S-V1) يُرمَّز باللغة الأصلية ثم يُلخَّص إنجليزياً/عربياً في `feedback` |
| 4 | التحليل يعمل على كل الردود كمجموعة واحدة (بدون تقسيم لغوي) |
| 5 | تصدير CRM يشمل `language_preference` كحقل أساسي |

---

## 7. التوافق مع المخطط الموحد (Unified Schema Alignment)

| حقل Entity | المصدر اللغوي |
|------------|---------------|
| `language_preference` | سؤال اختيار اللغة (الشاشة الأولى) |
| `pain_points` | C-10/C-13 (كل اللغات → نفس الحقل) |
| `willingness_to_pay` | C-24 (الخيارات الرقمية ثابتة عبر اللغات) |
| `feedback` | C-V1/S-V1 (نص حر بأي لغة) |
| `source_detail` | Q0 (نفس الترميز) |

> **النتيجة:** اللغات الثلاث تملأ نفس الحقول — البيانات قابلة للتحويل المباشر إلى CRM دون أي إعادة معالجة لغوية.

---

## 8. فحص الجاهزية قبل الإطلاق (Multi-Language Checklist)

- [ ] كل أداة متوفرة باللغات الثلاث **كاملة** (لا ترجمة جزئية)
- [ ] كل Question ID مطابق عبر اللغات الثلاث
- [ ] كل Field Name مطابق
- [ ] كل Option Values متطابقة دلالياً (والأرقام ثابتة)
- [ ] Question–Assumption Mapping مطابق في كل اللغات
- [ ] Validation Criteria مطابقة
- [ ] Consent متوفر باللغات الثلاث (نص كامل)
- [ ] Invitation + Follow-up Messages باللغات الثلاث
- [ ] `language_preference` يُسجَّل في Entity Identity
- [ ] Cross-Language Merge يعمل على Registry موحد
- [ ] RTL صحيح للعربية والأوردو + LTR للإنجليزية

---

**✅ معيار MULTI-LANGUAGE-STANDARD.md — جاهز.**  
**الملف:** `docs/pilot-validation/MULTI-LANGUAGE-STANDARD.md`
