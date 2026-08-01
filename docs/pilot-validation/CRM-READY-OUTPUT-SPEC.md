# ABC — CRM-Ready Output Spec (مواصفة التصدير الجاهز للـ CRM)

**المرحلة:** Typeform Build Phase ✅  
**الهدف:** تحديد أعمدة التصدير الدقيقة (Google Sheets/CSV) بحيث يُستورد السجل مباشرة إلى أي CRM/ERP دون remapping  
**المصدر:** `PILOT-DATA-ARCHITECTURE.md` (Unified Schema) + `TYPEFORM-BUILD-SHEET.md`

---

## 1. هيكل أعمدة التصدير (Master Column Layout)

> تُنشأ أعمدة Google Sheets بنفس هذه الأسماء تماماً. كل صف = Entity واحدة.

### 1.1 هوية الكيان (Identity)

| # | اسم العمود | المصدر | مثال |
|---|-----------|--------|------|
| 1 | `entity_id` | تلقائي (سكريبت/صيغة) | ENTITY-00001 |
| 2 | `entity_category` | ثابت لكل نموذج | CUST / SUPP |
| 3 | `entity_subtype` | C-01 / S-01 | contractor / distributor |
| 4 | `legal_name` | Consent/يدوي | — |
| 5 | `person_name` | Consent | — |
| 6 | `contact_email` | Consent (إجباري عند نعم) | m@example.com |
| 7 | `contact_phone` | Consent (اختياري) | +9715... |
| 8 | **`language_preference`** | LANG (شاشة 0) | Arabic / English / Urdu |

### 1.2 الملف التجاري (Business Profile)

| # | اسم العمود | المصدر | مثال |
|---|-----------|--------|------|
| 9 | `company_size` | C-02 / S-03 | 10-50 |
| 10 | `annual_volume` | C-03 | 10-50M AED |
| 11 | `relevant_categories` | S-02 | أسمنت، حديد |
| 12 | `has_catalog` | S-12 | نعم |
| 13 | `digital_maturity` | S-13/S-16/S-17 | Excel |
| 14 | `business_activity` | C-14 / S-06/S-07 | مقاول عام |

### 1.3 بيانات العلاقة (Relationship)

| # | اسم العمود | المصدر | مثال |
|---|-----------|--------|------|
| 15 | `source` | `?src=` | linkedin |
| 16 | `source_detail` | Q0 | LinkedIn |
| 17 | `relationship_status` | Consent | new / engaged |
| 18 | `interest_level` | يدوي لاحقاً | medium |
| 19 | `last_contact_date` | Timeline | 2026-08-10 |

### 1.4 بيانات التحقق (Validation)

| # | اسم العمود | المصدر | مثال |
|---|-----------|--------|------|
| 20 | `pain_points` | C-10/C-13/C-V1/S-09/S-22 | أسعار غير شفافة |
| 21 | `needs` | C-11/C-12/C-21/S-08/S-10/S-21 | RFQ رقمي |
| 22 | `feedback_summary` | ترميز C-V1/S-V1 | ألم RFQ مؤكد |
| 23 | `willingness_to_pay` | C-23/C-24/C-V2/S-23/S-V2 | 400-1,000 AED |
| 24 | `commission_acceptance` | S-24 | 1-3% |
| 25 | `adoption_interest` | C-22 | فوراً |
| 26 | `first_transaction_ready` | FT-C / FT-S | نعم |
| 27 | `ft_order_value` | FT-C / FT-S (نعم) | 500,000 AED |
| 28 | `pilot_status` | تلقائي | completed |

### 1.5 الـ Lead Score (حقول قابلة للحساب)

| # | اسم العمود | المصدر | مثال |
|---|-----------|--------|------|
| 29 | `lead_score_strategic` | من §6.3 (Pilot) | 80 |
| 30 | `lead_score_engagement` | من §6.3 (Pilot) | 60 |
| 31 | `lead_score_commercial` | من §6.3 (Pilot) | 75 |
| 32 | `lead_score_conversion` | من §6.3 (Pilot) | 50 |
| 33 | `lead_score_total` | المعادلة (0-100) | 70 |
| 34 | `lead_score_tier` | A/B/C/Cold | B |

### 1.6 سجل الموافقة (Consent Records)

| # | اسم العمود | المصدر | مثال |
|---|-----------|--------|------|
| 35 | `consent_status` | CONSENT | granted |
| 36 | `consent_date` | تلقائي | 2026-08-10 |
| 37 | `consent_version` | ثابت | v1.0 |
| 38 | `allowed_usage` | consent | product_research |
| 39 | `deletion_request` | يدوي | false |
| 40 | `data_retention_expiry` | حسابي | 2027-08-10 |

### 1.7 تسلسل زمني (Timeline — اختياري في Pilot)

| # | اسم العمود | المصدر | مثال |
|---|-----------|--------|------|
| 41 | `interaction_history` | سجل التفاعلات (§12) | JSON/text |
| 42 | `related_entities` | Relationship Graph (§13) | ENTITY-00012 |

---

## 2. نموذج بيانات (Sample Row — مقاول، عربي، WTP عالٍ)

| العمود | القيمة |
|--------|--------|
| entity_id | ENTITY-00001 |
| entity_category | CUST |
| entity_subtype | contractor |
| contact_email | m@example.com |
| language_preference | Arabic |
| company_size | 10-50 |
| annual_volume | 10-50M AED |
| pain_points | أسعار غير شفافة; تأخير تسليم |
| needs | RFQ رقمي; مقارنة أسعار |
| willingness_to_pay | 400-1,000 AED |
| adoption_interest | فوراً |
| first_transaction_ready | نعم |
| ft_order_value | 500,000 AED |
| source | linkedin |
| consent_status | granted |
| consent_date | 2026-08-10 |
| lead_score_total | 78 |
| lead_score_tier | A |

### نموذج — مورد، أوردو، عمولة منخفضة

| العمود | القيمة |
|--------|--------|
| entity_id | ENTITY-00021 |
| entity_category | SUPP |
| entity_subtype | distributor |
| language_preference | Urdu |
| has_catalog | لا |
| digital_maturity | Excel |
| commission_acceptance | 1-3% |
| first_transaction_ready | نعم |
| ft_order_value | 250,000 AED |
| source | whatsapp |
| consent_status | granted |
| lead_score_total | 62 |
| lead_score_tier | B |

---

## 3. قاعدة دمج اللغات الثلاث (Merge Rule)

| الخطوة | الإجراء |
|--------|---------|
| 1 | تصدير CSV من النماذج الثلاثة (Contractor + Supplier)، كل بلغاته الثلاث |
| 2 | توحيد الأعمدة (نفس Header من الجدول أعلاه) |
| 3 | إضافة `entity_id` لكل صف (تسلسل عبر كل الصفوف) |
| 4 | تعبئة `entity_category` من النموذج، و`language_preference` من شاشة LANG |
| 5 | حساب أعمدة lead_score (الجداول المحسوبة) |
| 6 | دمج الصفوف في **Unified Entity Registry** واحد |
| 7 | التصدير النهائي بـ CSV/JSON → جاهز لاستيراد CRM |

---

## 4. حساب Lead Score (صيغ الأعمدة)

```
lead_score_total = ROUND(0.30×strategic + 0.20×engagement + 0.35×commercial + 0.15×conversion, 0)

Tier:
  75-100 → A
  50-74  → B
  25-49  → C
  0-24   → Cold
```

---

## 5. فحص جاهزية التصدير (Output Readiness Check)

- [ ] جميع الأعمدة 40+ بأسماء المخطط الموحد
- [ ] `entity_id` في كل صف
- [ ] `entity_category` + `entity_subtype` معبأتان
- [ ] `language_preference` من شاشة LANG
- [ ] `consent_status` + `consent_date` تسجلا تلقائياً
- [ ] أعمدة lead_score محسوبة
- [ ] `ft_order_value` حاضر عند FT = نعم
- [ ] التصدير يقرأ في Google Sheets/CSV بلا أخطاء
- [ ] بيانات اللغات الثلاث مجتمعة في صفوف موحدة

---

**✅ مواصفة CRM-READY-OUTPUT-SPEC.md — جاهزة.**  
**الملف:** `docs/pilot-validation/CRM-READY-OUTPUT-SPEC.md`
