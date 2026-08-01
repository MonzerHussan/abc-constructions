# ABC — Pilot Data Collection Architecture (بنية جمع بيانات الـ Pilot)

**المرحلة:** Pilot Preparation Phase  
**الوضع:** ✅ APPROVED — Pilot Data Architecture Baseline (تصميم معماري فقط — لا بناء CRM الآن)  
**الغرض:** تصميم كل بيانات الـ Pilot حول **Unified Stakeholder Model** تكون نواة أول قاعدة علاقات موحدة لمنظومة ABC بالكامل — قابلة للتحويل لاحقاً إلى CRM/ERP Ecosystem **بدون إعادة جمع البيانات من الصفر**  
**النقاط المعتمدة:** Unified Stakeholder Model · Entity-Centric Structure · entity_id الدائم · CRM Classification · Lead Scoring Framework · Migration Path · Data Governance Layer · Relationship Timeline · Entity Relationship Mapping · Privacy & Consent Mapping · Export/API Readiness

---

## 1. مبادئ التصميم (Design Principles)

| # | المبدأ | المعنى |
|---|--------|--------|
| 1 | **Entity-Centric لا Survey-Centric** | البيانات تُنظَّم حول الكيان (Entity) لا حول الاستبيان — الاستبيان مجرد قناة جمع واحدة |
| 2 | **EntityID ثابت ومستقر** | كل جهة تحصل على معرف فريد دائم (ENTITY-XXXXX) يُستخدم في كل الأدوات ومستقبلاً في CRM — لا يُعاد إنشاؤه |
| 3 | **مخطط موحد وقابل للتوسع** | نفس المخطط (Schema) يعمل لكل الكيانات — إضافة نوع Entity جديد لا تتطلب إعادة تصميم |
| 4 | **قابلية النقل (Portability)** | كل حقل مُعرف بمصطلح CRM قياسي (Lead, Account, Contact, Opportunity, Interaction) لتُبنى عليه أي منصة لاحقاً |
| 5 | **لا إعادة جمع** | أي معلومة جُمعت في الـ Pilot تُخزَّن مرة واحدة في المخطط الموحد وتُستدعى منها عند التحويل |
| 6 | **تقييم موحد (Lead Scoring)** | كل Entity قابلة للتقييم بنفس معادلة النقاط — بغض النظر عن نوعها |

---

## 2. النطاق المستقبلي — كل من يتفاعل مع ABC هو Entity

```
                         ┌─────────────────────────────┐
                         │   ABC Ecosystem Entity Graph │
                         └─────────────────────────────┘
                                        │
        ┌──────────────────┬────────────┴────────────┬──────────────────┐
        ▼                  ▼                         ▼                  ▼
  CUSTOMER          SUPPLIER                  ECOSYSTEM           INTERNAL
  ┌──────────┐   ┌──────────────┐   ┌──────────────────────┐   ┌──────────────┐
  │ Contractors │  │ Suppliers      │   │ Strategic Partners  │   │ Potential Team│
  │ Developers  │  │ Manufacturers  │   │ Industry Associations│  │ Members       │
  │ Consultants │  │ Distributors   │   │ Service Providers   │   │ Advisors      │
  │ Project     │  │ Material       │   │ Investors           │   │ Service Staff │
  │ Owners      │  │ Vendors        │   │ Media               │   │              │
  └──────────┘   └──────────────┘   └──────────────────────┘   └──────────────┘
```

> **القاعدة:** أي جهة تُسجَّل في أي أداة من أدوات الـ Pilot (استبيان/مقابلة/إحالة/فعالية/تسجيل FT) تُنشأ لها Entity في قاعدة العلاقات الموحدة.

---

## 3. تصنيفات الكيانات (Entity Taxonomy)

| الرمز | الفئة | الأنواع الفرعية | دور ABC المتوقع |
|-------|-------|-----------------|-----------------|
| `CUST` | Customer Entities | Contractors / Developers / Consultants / Project Owners | المشترون (Demand) |
| `SUPP` | Supplier Entities | Suppliers / Manufacturers / Distributors / Material Vendors | البائعون (Supply) |
| `ECO` | Ecosystem Entities | Strategic Partners / Industry Associations / Service Providers / Investors / Advisors | داعمو النظام |
| `INT` | Internal Entities | Potential Team Members / Service Staff | التنفيذ |

### أنواع فرعية رسمية (Sub-type values — تُستخدم كقيم Enum في المخطط)

```
customer_subtype: contractor | developer | consultant | project_owner
supplier_subtype: supplier | manufacturer | distributor | material_vendor
ecosystem_subtype: strategic_partner | industry_association | service_provider | investor | advisor | media
internal_subtype: potential_team_member | service_staff
```

---

## 4. مخطط الكيان الموحد (Unified Entity Schema)

> **الأساس:** كل Entity تُوصف بخمس مجموعات بيانات. هذه هي نواة مستقبل CRM.

### 4.1 الهوية (Identity)

| الحقل | النوع | مثال | ملاحظة تحويل CRM |
|-------|-------|------|------------------|
| `entity_id` | String (PK) | ENTITY-00001 | Account ID |
| `entity_category` | Enum | CUST/SUPP/ECO/INT | Account Type |
| `entity_subtype` | Enum | contractor/distributor/... | Sub-type |
| `legal_name` | String | شركة الإعمار الحديثة | Account Name |
| `person_name` | String | محمد عبدالله | Contact Name |
| `role_in_org` | String | مدير مشتريات | Contact Title |
| `contact_email` | Email | — | Email |
| `contact_phone` | String | — | Phone |
| `linkedin_url` | URL | — | LinkedIn |
| `language` | Enum | AR/EN | Preference |
| **`language_preference`** | **Enum** | **Arabic / English / Urdu** | **Communication Preference (CRM + Marketing + Customer Success)** |
| `created_at` | Date | — | Created Date |
| `source_system` | Enum | Typeform/Interview/Referral/Event/FT | Originating System |

### 4.2 الملف التجاري (Business Profile)

| الحقل | النوع | مثال | ملاحظة تحويل CRM |
|-------|-------|------|------------------|
| `industry_segment` | Enum | Construction/Steel/Finishing/MEP... | Industry |
| `company_size` | Enum | 1-9/10-49/50-100/100+ | Employees Range |
| `location` | String | Dubai | Territory |
| `business_activity` | String | مقاول عام / توزيع حديد | Activity |
| `relevant_categories` | List[Enum] | أسمنت، حديد، تشطيب | Product Categories |
| `annual_volume` | Numeric (opt) | 10-50M AED | Annual Revenue (opt) |
| `digital_maturity` | Enum (SUPP) | ERP/Excel/Manual | Tech Stack |
| `has_catalog` | Bool (SUPP) | نعم/لا | Catalog Status |

### 4.3 بيانات العلاقة (Relationship Data)

| الحقل | النوع | مثال | ملاحظة تحويل CRM |
|-------|-------|------|------------------|
| `source` | Enum | Survey/Interview/Referral/Event/FT | Lead Source |
| `source_detail` | String | LinkedIn InMail | Channel |
| `interaction_history` | List[Interaction] | [{date, channel, note}] → انظر §12 | Activity Feed |
| `communication_records` | List[Message] | [{date, type, content}] | Email/Message Log |
| `interest_level` | Enum | none/low/medium/high | Interest |
| `relationship_status` | Enum | new/engaged/trial/active/churned/blacklist | Status |
| `contact_frequency` | Enum | once/monthly/weekly | Cadence |
| `last_contact_date` | Date | — (مشتق من §12) | Last Activity |
| `referral_from` | EntityID | ENTITY-00012 | Referred By |
| `related_entities` | Graph | Contractor↔Supplier↔Project (انظر §13) | Related Accounts |

### 4.4 بيانات التحقق (Validation Data)

| الحقل | النوع | مثال | ملاحظة تحويل CRM |
|-------|-------|------|------------------|
| `pain_points` | List[String] | أسعار غير شفافة / تأخير تسليم | Pain (Tag) |
| `needs` | List[String] | مقارنة أسعار / RFQ رقمي | Needs |
| `feedback` | List[Feedback] | [{type, text, date}] | Feedback Log |
| `willingness_to_pay` | Enum | band (e.g. 100-400 AED) | WTP Range |
| `commission_acceptance` | Enum (SUPP) | <1%/1-3%/3-5% | Commission Band |
| `adoption_interest` | Enum | فوراً/6-12 شهر/لاحقاً/لا | Adoption Intent |
| `first_transaction_ready` | Bool | نعم/لا | FT Ready |
| `ft_order_value` | Numeric (opt) | 500K AED | Potential Value |
| `pilot_status` | Enum | invited/started/completed/interviewed/ft_trial | Pilot Funnel |
| `assumption_results` | Map | {P-01: ✅, M-06: 🟡} | Validation Results |

### 4.5 التصنيف (CRM Classification)

| الحقل | القيمة | المعنى |
|-------|--------|--------|
| `crm_classification` | `Lead` | جهة مهتمة مبدئياً بلا تأكيد |
| | `Prospect` | مؤهلة وموافقة على التواصل |
| | `Customer` | بدأت استخدام المنصة (بعد Pilot) |
| | `Supplier` | مورد نشط على المنصة |
| | `Partner` | شراكة استراتيجية أو خدمية |
| | `Investor` | مستثمر محتمل |
| | `Other_Stakeholder` | جهات النظام الأخرى |

> **قاعدة انتقالية:** تبدأ كل Entity كـ `Lead` من مصدر الـ Pilot، وتتغير لاحقاً وفق إشارات التفاعل — **دون فقدان التاريخ**.

---

## 5. مصفوفة التحقق — أدوات الـ Pilot تغذي المخطط الموحد

> **الإثبات:** كل سؤال/قناة حالية في الـ Pilot تُخزَّن في حقول المخطط أعلاه. لا توجد معلومة ضائعة.

| الأداة الحالية | الحقل الهدف في المخطط | Entity الفئة |
|----------------|------------------------|--------------|
| Q0 (المصدر) | `source` + `source_detail` | الكل |
| C-01/C-02/C-03 | `entity_subtype` + `company_size` + `annual_volume` | CUST |
| C-10/C-11/C-12/C-13 | `pain_points` + `needs` | CUST |
| C-V1 | `feedback` (نوعي) + `pain_points` | CUST |
| C-21 | `needs` (أولوية الميزات) | CUST |
| C-22 | `adoption_interest` | CUST |
| C-23/C-24 | `willingness_to_pay` | CUST |
| C-V2 | `willingness_to_pay` (دفع ملموس) + `pilot_status` | CUST |
| FT-C | `first_transaction_ready` + `ft_order_value` | CUST |
| S-01/S-02/S-03 | `entity_subtype` + `relevant_categories` + `company_size` | SUPP |
| S-06/S-07 | `business_activity` + حجم تداول | SUPP |
| S-08/S-09 | `pain_points` + `needs` | SUPP |
| S-V1 | `feedback` (نوعي) + `pain_points` | SUPP |
| S-10/S-11 | `needs` + حجم RFQ | SUPP |
| S-12/S-13/S-16/S-17 | `has_catalog` + `digital_maturity` | SUPP |
| S-21/S-22 | `needs` + `pain_points` (حواجز) | SUPP |
| S-23/S-24 | `willingness_to_pay` + `commission_acceptance` | SUPP |
| S-V2 | `willingness_to_pay` (ملموس) + `pilot_status` | SUPP |
| FT-S | `first_transaction_ready` + `ft_order_value` | SUPP |
| Consent | `relationship_status` + `contact_email/phone` | الكل |
| المقابلات | `feedback` + `interaction_history` | الكل |
| فعاليات/إحالات | `source` + `referral_from` | الكل |
| تقييم نهاية الاستبيان | `feedback` (NPS) | الكل |

---

## 6. نموذج التقييم الموحد (Lead Scoring Framework)

> **الغرض:** تقييم أي Entity (Customer/Supplier/Ecosystem) بنفس المعادلة — جاهز للتحويل لأي CRM Scoring Engine.

### 6.1 محاور التقييم (مع الأوزان)

| المحور | الوزن | ما يقيسه |
|--------|-------|----------|
| **Strategic Value** | 30% | أهمية الشريحة/الحجم/الدور للنظام |
| **Engagement Level** | 20% | عمق التفاعل (استبيان/مقابلة/ردود/مرات تواصل) |
| **Commercial Potential** | 35% | WTP، حجم الصفقة، قابلية أول صفقة |
| **Conversion Probability** | 15% | الجاهزية الزمنية + الموافقة + الإشارات السلوكية |

### 6.2 معادلة النقاط

```
Score = 0.30×StrategicValue + 0.20×Engagement + 0.35×Commercial + 0.15×Conversion
مجموع نقاط كل محور: 0-100  →  Score النهائي: 0-100
```

### 6.3 بطاقة التسجيل (Scorecard لكل محور — 0-100)

#### Strategic Value (0-100)
| المعيار | 0-25 | 26-50 | 51-75 | 76-100 |
|---------|------|-------|-------|--------|
| حجم (CUST) | <10 موظف | 10-49 | 50-99 | 100+ |
| حجم (SUPP) | <10 | 10-49 | 50-100 | 100+ |
| الدور | طرفي | مورد/مقاول نشط | لاعب إقليمي | لاعب استراتيجي |
| الفئة | نادر | ثانوية | أساسية | فئة محورية |

#### Engagement Level (0-100)
| الإشارة | النقاط |
|---------|--------|
| أكمل الاستبيان | +30 |
| وافق على المتابعة (Consent) | +20 |
| مقابلة معمقة | +25 |
| رد على المتابعة | +15 |
| FT تجريبي | +10 |
| لم يرد إطلاقاً | 0 |

#### Commercial Potential (0-100)
| المعيار | النقاط |
|---------|--------|
| WTP أعلى نطاق | +35 |
| FT-C/FT-S = نعم | +30 |
| حجم صفقة >500K | +25 |
| قبول عمولة 3% | +10 |
| لا دفع/لا FT | 0 |

#### Conversion Probability (0-100)
| الإشارة | النقاط |
|---------|--------|
| Adoption = فوراً | +35 |
| Adoption = 6-12 شهر | +20 |
| C-V2/S-V2 = نعم (وديعة/اشتراك) | +30 |
| Consent = نعم | +15 |
| لا إشارات | 0 |

### 6.4 فئات النقاط (Tiers)

| النطاق | التصنيف | الإجراء |
|--------|---------|---------|
| 75-100 | 🟢 **Priority (A)** | أولوية متابعة/تطوير |
| 50-74 | 🟡 **Nurture (B)** | رعاية دورية |
| 25-49 | 🟠 **Monitor (C)** | مراقبة |
| 0-24 | ⚪ **Cold/Archive** | أرشفة/إعادة اتصال لاحق |

> **استخدام النتيجة:** تُرفق النتيجة لكل Entity في سجل الـ Pilot، وتُدمج لاحقاً كأساس "Priority/Rank" في أي CRM دون إعادة حساب من الصفر.

---

## 7. سجل الـ Entity الموحد (Unified Entity Registry)

> **المخزن الحالي (لا CRM):** جدول مركزي (Google Sheets/Airtable) يجمع كل الكيانات من كل الأدوات.

| الحقل | من Tool | مطلوب في Pilot؟ |
|-------|---------|------------------|
| entity_id | منشأ تلقائياً | ✅ |
| entity_category / subtype | يدوي أو من C-01/S-01 | ✅ |
| Identity (الاسم، البريد، الهاتف) | Consent | ✅ |
| business_profile (حجم، موقع، فئة) | الاستبيان | ✅ |
| source + channel | Q0 | ✅ |
| interest / status | تحديث يدوي | ✅ |
| pilot_status (funnel) | تحديث أسبوعي | ✅ |
| WTP / commission / FT | الاستبيان + FT | ✅ |
| pain_points / needs / feedback | C-V1/S-V1 + ملاحظات | ✅ |
| lead_score | من بطاقة التسجيل | ✅ |
| crm_classification | مشتق | ✅ |
| interaction_history | Timeline (§12) | ✅ |
| related_entities | Relationship Graph (§13) | ✅ |
| consent_status / date / allowed_usage | سجل الموافقة (§14) | ✅ |
| deletion_request | سجل الموافقة (§14) | ✅ |
| data_retention_expiry | سياسة الاحتفاظ (§11.3) | ✅ |

**قاعدة النقل:** عند بناء CRM مستقبلاً → يُستورد `entity_id` وكل الحقول أعلاه مباشرة (الخريطة: المخطط الموحد ↔ حقول CRM القياسية مدرجة في كل جدول أعلاه).

---

## 8. مسار التحويل إلى CRM/ERP (Migration Path — مستقبلاً)

| المرحلة | الإجراء |
|---------|---------|
| 1. نهاية الـ Pilot | تصدير Unified Entity Registry (CSV/API) بمخطط موحد |
| 2. بناء CRM | إنشاء كيانات Lead/Account/Contact/Opportunity/Activity |
| 3. الاستيراد | تعيين الحقول (Field Mapping) حسب خريطة §4 — بدون إعادة جمع |
| 4. التوحيد (Dedup) | الدمج عبر `entity_id` + البريد |
| 5. التوسع | إضافة Entity جديدة (Investor/Partner/...) بنفس المخطط |
| 6. تكامل ERP | فئة SUPP تُربط ببيانات المخزون/الطلبات بنفس `entity_id` |

**الضمان:** أي بيانات تُجمع في الـ Pilot الآن **تخزَّن في المخطط الموحد**، فأي CRM/ERP مستقبلاً يقرأها مباشرة.

---

## 9. التطبيق العملي — أدوات الـ Pilot تتحدث المخطط الموحد

| الأداة الحالية | التعديل المطلوب |
|----------------|-----------------|
| `CONTRACTOR-SURVEY.md` / `SUPPLIER-SURVEY.md` | يضاف رأس `entity_id` لكل سجل + تعيين الأجوبة لحقول المخطط (§5) + تسجيل SURVEY في Timeline |
| `TYPEFORM-SPEC.md` | حقول التصدير تُطابق أسماء المخطط (source, WTP, ...) + سجل consent_status/date تلقائي |
| `FEEDBACK-COLLECTION-SYSTEM.md` | سجل التوثيق يستخدم `entity_id` بدل `respondent_id` + يضيف lead score + interaction record لكل تفاعل |
| `SAMPLE-CONTACT-PLAN.md` | القوائم تستخدم `entity_id` + أعمدة classification/score + تسجيل CALL/EMAIL في Timeline |
| `RESULT-ANALYSIS-TEMPLATES.md` | يضاف قالب تحليل Lead Scoring (توزيع النقاط) + ملخص Consent compliance |
| `PILOT-ASSUMPTION-TRACKER.md` | النتائج تُخزَّن في `assumption_results` لكل Entity |
| `PILOT-SUCCESS-SCORECARD.md` | دون تغيير (يقيس نجاح الـ Pilot ككل) |
| `CONSENT-DATA-USAGE.md` | يُراجع لتطابق مع سجل الموافقة (§14) — consent_status/date/withdrawal |

---

## 10. الامتثال والضوابط

- كل بيانات الـ Pilot تلتزم `CONSENT-DATA-USAGE.md` — استخدامها لتطوير المنتج فقط.
- `entity_id` يجعل إدارة الحذف/الانفصال (GDPR/PDPL-aligned) ممكنة بلا إزالة جماعية.
- لا يُنشأ CRM الآن — المخطط توثيق معماري فقط يضمن مستقبلاً "نقل بلا إعادة جمع".

---

## 11. طبقة حوكمة البيانات (Data Governance Layer)

> **الغرض:** مسؤوليات وضوابط صارمة لكل بيانات الـ Entity — تُنفَّذ منذ اليوم الأول.

### 11.1 ملكية البيانات (Data Owner)

| الدور | المسؤول | النطاق |
|-------|---------|--------|
| **Data Owner** | Pilot Lead | الملكية الكاملة لمخطط البيانات وسلامته |
| **Data Steward** | منسق العينة | الصيانة اليومية وجودة الإدخال |
| **Data Analyst** | محلل البيانات | الترميز، lead_score، التقارير |
| **Security Contact** | المسؤول الفني | الوصول، النسخ الاحتياطي، الحذف |

### 11.2 قواعد الوصول (Data Access Rules)

| الدور | ما يُسمح به |
|-------|-------------|
| منسق العينة | قراءة/تحديث بيانات التواصل وحالة الاتصال |
| المحلل | قراءة كاملة + ترميز + تقييم (بلا أرقام تواصل شخصية عند التصدير) |
| Pilot Lead | كامل الصلاحيات + اعتماد الحذف |
| الأطراف الخارجية (مستثمر/مستشار) | **ممنوع** — عرض بيانات مجمّعة/مجهولة فقط |

**مبدأ الحد الأدنى (Least Privilege):** كل دور يصل فقط للبيانات اللازمة لمهمته.

### 11.3 سياسة الاحتفاظ (Data Retention Policy)

| نوع البيانات | مدة الاحتفاظ | الإجراء عند الانتهاء |
|--------------|---------------|----------------------|
| بيانات تعريف (بريد/هاتف) | حتى اكتمال تحليل Pilot أو طلب الحذف | حذف نهائي |
| إجابات مجمّعة (بلا هوية) | 12 شهراً بعد Pilot | أرشفة أو حذف |
| نتائج Lead Scoring | 24 شهراً | أرشفة للتحويل لـ CRM |
| سجلات الموافقة (Consent) | دائمة (إثبات الامتثال) | احتفاظ آمن |

### 11.4 مسؤولية التحديث (Data Update Responsibility)

| نوع التحديث | المسؤول | التكرار |
|-------------|---------|---------|
| حالة الاتصال / pilot_status | منسق العينة | فوري/أسبوعي |
| interaction_history | منسق العينة + المحلل | عند كل تفاعل |
| lead_score | المحلل | أسبوعي |
| assumption_results | المحلل | أسبوعي |
| تصنيف CRM | المحلل + Pilot Lead | شهري/عند أحداث كبرى |

### 11.5 معالجة الكيانات المكررة (Duplicate Entity Handling)

**قاعدة الكشف:** التكرار يُكتشف عبر أي من: `entity_id` مطابق، أو بريد/هاتف/نطاق شركة مطابق.

| الحالة | الإجراء |
|--------|---------|
| بريد مطابق لكن entity_id مختلف | دمج سجلاً في واحد (الاتحاد) + الاحتفاظ بكل interaction |
| نفس الشركة بنشاطين مختلفين (مشتري + مورد) | Entity واحدة بنوع مزدوج + سياقات منفصلة |
| تكرار من أداة أخرى (استبيان + مقابلة) | إلحاق التفاعل بنفس entity_id — لا إنشاء جديد |
| تعارض (بيانات متضاربة) | المرجع الأحدث تاريخياً + توثيق القرار في السجل |

> **قاعدة ذهبية:** `entity_id` هو المفتاح — أي دمج يُحافظ على `entity_id` الأصلي ويُحدَّث الحقول دون فقدان `interaction_history`.

---

## 12. الخط الزمني للعلاقة (Relationship Timeline — Interaction History)

> **الغرض:** تسجيل كامل تفاعلات كل Entity كسجل زمني واحد — قابل للنمو إلى Activity Feed في أي CRM.

### 12.1 أنواع التفاعل المسجلة (Interaction Types)

| النوع | الرمز | مثال |
|-------|-------|------|
| Survey Response | `SURVEY` | إكمال استبيان (C/S) |
| Interview | `INTERVIEW` | مقابلة معمقة 30-45 دقيقة |
| Email | `EMAIL` | إرسال/استلام بريد |
| Call | `CALL` | مكالمة هاتفية |
| Meeting | `MEETING` | اجتماع مباشر/افتراضي |
| Feedback | `FEEDBACK` | ملاحظة مكتوبة/شكوى/اقتراح |
| Pilot Activity | `PILOT_ACTIVITY` | FT تجريبي، إرسال RFQ، تقديم عرض |
| Referral | `REFERRAL` | إحالة جهة أخرى |

### 12.2 حقول سجل التفاعل (Interaction Record)

| الحقل | النوع | مثال |
|-------|-------|------|
| `interaction_id` | String (PK) | INT-000001 |
| `entity_id` | FK | ENTITY-00001 |
| `type` | Enum | SURVEY / INTERVIEW / EMAIL / CALL / MEETING / FEEDBACK / PILOT_ACTIVITY / REFERRAL |
| `date` | Date/Time | 2026-08-10 14:30 |
| `channel` | Enum | Typeform / WhatsApp / Email / Phone / In-Person / Platform |
| `responsible_person` | String | منسق العينة / المحلل / Pilot Lead |
| `outcome` | String | "أكمل الاستبيان — WTP 400 AED" / "وافق على المقابلة" / "رفض — عمولة عالية" |
| `next_action` | String (opt) | "متابعة 48 ساعة" |
| `related_entity` | EntityID (opt) | ENTITY-00012 (طرف آخر في التفاعل) |

### 12.3 قاعدة السجل الزمني

- كل Entity لها سجل تفاعلات **زمني تراكمي** (`interaction_history`) — لا يُحذف التاريخ عند التعديل.
- يُعرض كـ Timeline (أحدث أولاً) في السجل/الداشبورد.
- `last_contact_date` يُشتق تلقائياً من آخر تفاعل.

### 12.4 مثال سجل تفاعلات Entity

```
ENTITY-00001 (مقاول):
  2026-08-10  SURVEY    Typeform      المحلل      أكمل الاستبيان — WTP 400 AED
  2026-08-12  EMAIL     Email         المنسق      أُرسل شكر + دعوة لمقابلة
  2026-08-14  CALL      Phone         المنسق      وافق على مقابلة الأسبوع القادم
  2026-08-18  INTERVIEW Video Call    المحلل      ألم RFQ مؤكد + جاهزية FT (طلب 500K)
  2026-08-22  PILOT_ACTIVITY Platform  المنسق      طلب RFQ تجريبي لـ 3 موردين
```

---

## 13. خرائط علاقات الكيانات (Entity Relationship Mapping)

> **الغرض:** البنية تُنمّذ العلاقات بين الكيانات كـ **Graph** — قابلة للنمو إلى Network Platform (ليس مجرد جدول).

### 13.1 أنواع العلاقات (Relationship Types)

| العلاقة | الأطراف | الدلالة |
|---------|---------|---------|
| **Serves / Demands** | Contractor ↔ Supplier | تبادل طلب/عرض |
| **Owns** | Project Owner ↔ Project | مالك المشروع |
| **Executes** | Contractor ↔ Project | مقاول منفذ |
| **Advises** | Consultant ↔ Project | استشارة للمشروع |
| **Initiates** | Contractor ↔ RFQ | مقاول يطلق طلب عروض |
| **Bids** | Supplier ↔ RFQ | مورد يقدم عرضاً |
| **Results** | RFQ ↔ Transaction | عروض تتحول لصفقة |
| **Partners** | Company ↔ Partner | شراكة استراتيجية/خدمية |
| **Supports** | Partner ↔ Pilot Activity | دعم برنامج Pilot |
| **Funds** | Investor ↔ ABC | استثمار محتمل |
| **Advises** | Advisor ↔ ABC | إرشاد |
| **Refers** | Entity ↔ Entity | إحالة |
| **Employs** | Internal ↔ Team Role | توظيف محتمل |

### 13.2 الرسم البياني للعلاقات (Entity Graph)

```
         Project Owner ─── Owns ─── Project ─── Advises ─── Consultant
                                      │
                                  Executes
                                      │
                                     Contractor
                                    ↙      ↘
                              Initiates    Partners
                             ↙              ↘
                          RFQ ── Bids ──→ Supplier ── Partners ──→ Strategic Partner
                           │
                       Results
                           ↓
                      Transaction
                           ↕
                      Supplier (تنفيذ)
```

### 13.3 نموذج التخزين (Graph-Ready)

| جدول/مجموعة | المحتوى |
|-------------|---------|
| `entities` | العقد (Nodes) — كل Entity |
| `relationships` | الأضلاع (Edges): `{from_entity, to_entity, rel_type, since_date, status}` |
| `interactions` | الأحداث الزمنية (Activity) |
| `projects` / `rfqs` / `transactions` | كيانات تجارية ناشئة أثناء Pilot |

> **قابلية النمو:** أي كيان تجاري جديد (Project/RFQ/Transaction) يُنمّذ كعقدة مرتبطة بالأطراف — البنية جاهزة لتشغيل خوارزميات الشبكة (توصيات الموردين، أنماط الطلب) مستقبلاً.

---

## 14. ربط الخصوصية والموافقة (Privacy & Consent Mapping)

> **الغرض:** كل Entity مقترنة بسجل موافقة خاص بها — استيفاء متطلبات الامتثال من اليوم الأول.

### 14.1 حقول سجل الموافقة (Consent Record)

| الحقل | النوع | مثال |
|-------|-------|------|
| `consent_status` | Enum | granted / denied / withdrawn / not_requested |
| `consent_date` | Date | 2026-08-10 |
| `consent_version` | String | v1.0 (نص `CONSENT-DATA-USAGE.md`) |
| `allowed_usage` | List[Enum] | product_research / contact_for_pilot / early_adopter_list |
| `deletion_request` | Bool + Date | requested 2026-09-01 |
| `data_retention_expiry` | Date | تُحسب من سياسة الاحتفاظ (§11.3) |

### 14.2 مصفوفة الموافقة والاستخدام المسموح

| حالة الموافقة | ما يُسمح به | ما يُمنع |
|----------------|-------------|----------|
| `granted` | استخدام بيانات التحقق + التواصل للـ Pilot + قائمة Early Adopter (حسب allowed_usage) | بيع/مشاركة خارجية |
| `denied` | لا جمع إطلاقاً (يُنهى الاستبيان) | أي معالجة |
| `withdrawn` | وقف التواصل فوراً + حذف بيانات التعريف | متابعة استخدام |
| `not_requested` | بيانات مجمّعة فقط (إن وُجدت عبر قناة غير رسمية) | أي تواصل فردي |

### 14.3 ربط الموافقة بالأدوات

| الأداة | الربط |
|--------|-------|
| Typeform | الشاشة الأولى تُسجّل consent_status + consent_date تلقائياً |
| SAMPLE-CONTACT-PLAN | كل Entity تُتاح للتواصل فقط إذا consent_status = granted |
| FEEDBACK-COLLECTION-SYSTEM | أي ملاحظة من Entity بـ withdrawn تُهمل فوراً |
| RESULT-ANALYSIS | التقارير تُستثني الكيانات المنسحبة |

### 14.4 إجراء طلب الحذف

1. يُسجَّل `deletion_request = true` + التاريخ في سجل الموافقة.
2. تُحذف بيانات التعريف (بريد/هاتف/اسم) خلال مهلة الامتثال.
3. تُحذف أي بيانات غير مجمّعة مرتبطة بالكيان.
4. يُحتفظ فقط بسجل الموافقة (إثبات) + البيانات المجمّعة (إن سُمح بها).

---

## 15. الجاهزية للتصدير/الـ API (Export/API Readiness)

> **توصية مستقبلية:** المخطط مُصمَّم ليُصدَّر مباشرة إلى أي منصة مستهدفة دون إعادة هيكلة.

### 15.1 الأنظمة المستهدفة

| النظام | نوع التصدير | المطابقة |
|--------|-------------|----------|
| **CRM** | Account + Contact + Lead + Opportunity + Activity | خريطة §4 (كل حقل بعمود CRM قياسي) |
| **Marketing Automation** | Segmentation + Campaign Lists + Tags | `interest_level`, `adoption_interest`, `crm_classification` |
| **ERP** | Supplier Master + Transaction Data | فئة SUPP ↔ مخزون/طلبات/فواتير |
| **Analytics Platform** | Fact/Dimension Tables (Entities, Interactions, Relationships) | سجلات Timeline + Relationship Graph |

### 15.2 صيغ التصدير المدعومة

| الصيغة | الاستخدام |
|--------|-----------|
| **CSV** | استيراد فوري لمعظم المنصات |
| **JSON** | API/Data Warehouse |
| **Webhook/API (مستقبلاً)** | مزامنة لحظية عند بناء المنصة |

### 15.3 عقدة التوحيد (Canonical Contract)

- **مفتاح التوحيد:** `entity_id` (دائم) + `contact_email` (أساسي للـ Dedup).
- **ثبات الأسماء:** أسماء الحقول في المخطط هي نفسها في التصدير (لا إعادة تسمية بين الأنظمة).
- **نمط التصدير:** كل Entity تخرج مع كامل `interaction_history` + `relationships` + `consent` في حزمة واحدة قابلة للقراءة الآلية.

### 15.4 خطوات التفعيل المستقبلي

1. تصدير Registry بـ CSV/JSON (نمط موحد).
2. اختيار النظام المستهدف (CRM أولاً).
3. تعيين الحقول حسب الخريطة (§4) — تلقائي (أسماء مطابقة).
4. استيراد + Dedup عبر `entity_id`.
5. تفعيل المزامنة عبر API عند إطلاق المنصة.

---

## 16. التعدد اللغوي (Multi-Language Layer)

> **الغرض:** ضمان جمع البيانات باللغات الرسمية الثلاث (العربية / English / اردو) مع **توافق مطلق** في المعرّفات والحقول — انظر `MULTI-LANGUAGE-STANDARD.md`.

### 16.1 مبادئ التعدد اللغوي

| المبدأ | التفصيل |
|--------|---------|
| **نسخة كاملة لكل لغة** | لا ترجمة جزئية — كل أداة متوفرة بالثلاث كاملاً |
| **توافق المعرّفات** | نفس Question ID وField Name عبر اللغات — الترجمة للدلالة لا الترميز |
| **مخطط موحد واحد** | اللغات الثلاث تملأ نفس الحقول في نفس الـ Entity — لا جداول لغوية منفصلة |
| **حقل `language_preference`** | يُخزَّن في Identity لكل Entity — أساس التواصل المستقبلي |

### 16.2 حقل Language Preference في المخطط

| الحقل | النوع | القيم | الاستخدام المستقبلي |
|-------|-------|-------|---------------------|
| `language_preference` | Enum | Arabic / English / Urdu | CRM (لغة التواصل) + Marketing Automation (الحملات) + Customer Success (الدعم) |

### 16.3 الأدوات اللغوية الثلاثية (Trilingual Artifacts)

| الأداة | الملف ثلاثي اللغات | الأصل المرجعي |
|--------|--------------------|---------------|
| Contractor Survey | `CONTRACTOR-SURVEY-MULTILANG.md` | `CONTRACTOR-SURVEY.md` |
| Supplier Survey | `SUPPLIER-SURVEY-MULTILANG.md` | `SUPPLIER-SURVEY.md` |
| Interview Script | `INTERVIEW-SCRIPT-MULTILANG.md` | `INTERVIEW-SCRIPT.md` |
| Consent | `CONSENT-DATA-USAGE.md` (§1.1-1.3) | — |
| Communication Messages | `COMMUNICATION-MESSAGES-MULTILANG.md` | `SAMPLE-CONTACT-PLAN.md` §4 |
| معيار التوافق | `MULTI-LANGUAGE-STANDARD.md` | — |

### 16.4 دمج النتائج عبر اللغات (Cross-Language Merge)

1. كل رد يُخزَّن تحت `entity_id` + `language_preference`.
2. نفس Question ID يكتب في نفس العمود بغض النظر عن اللغة.
3. النص المفتوح (C-V1/S-V1) يُرمَّز باللغة الأصلية ويُلخَّص في `feedback`.
4. التحليل يعمل على كل الردود كمجموعة واحدة.
5. تصدير CRM يشمل `language_preference` كحقل أساسي.

### 16.5 فحص الجاهزية اللغوية قبل الإطلاق

- [ ] كل أداة باللغات الثلاث كاملة
- [ ] Question ID / Field Name مطابقة عبر اللغات
- [ ] Options دلالياً متطابقة (والأرقام ثابتة)
- [ ] Consent بالثلاث (نص كامل)
- [ ] Invitation/Follow-up بالثلاث
- [ ] `language_preference` يُسجَّل في Identity
- [ ] RTL صحيح (عربية/أوردو) + LTR (إنجليزية)

---

**✅ بنية PILOT-DATA-ARCHITECTURE.md — جاهزة (Approved — Baseline v1.2 مع Multi-Language).**  
**الوضع:** Pilot Data Architecture ✅ Approved  
**الملف:** `docs/pilot-validation/PILOT-DATA-ARCHITECTURE.md`
