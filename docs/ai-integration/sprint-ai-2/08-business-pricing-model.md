# Sprint AI-2 · Deliverable 8 — Business & Pricing Model (نموذج الأعمال والأسعار)

> **المسار:** AI & Integration Layer — Sprint AI-2
> **الحالة:** 📝 مواصفة — جاهزة للاعتماد
> **المرجع:** `09-pricing-strategy.md` (الأساس) · `03-ai-usage-tracking-model.md` (Credits) · `09-ai-cost-management.md` (تكلفة) · `01-agent-taxonomy.md` (الوكلاء)

---

## 1. المبدأ

كل وكيل **قيمة قابلة للقياس** — يُسعَّر بما يحققه للمستخدم/المنظمة، مع تغطية التكلفة (09). **الأسعار النهائية تُثبَّت بعد Pilot** — هنا يُسلَّم الإطار لا الأرقام.

## 2. تصنيف الوكلاء تجارياً

| الفئة | الوكلاء | الجمهور | نموذج الإيراد |
|-------|---------|---------|---------------|
| **موجّه للمستخدم (B2C)** | Job Seeker, Student | أفراد | Freemium + Premium |
| **موجّه للأعمال (B2B)** | Contractor, Supplier, Recruiter, Trainer | شركات | اشتراك باقات |
| **عمليات داخلي (Ops)** | Procurement, Logistics, CS, Sales, Marketing, Finance, Legal, HR, Analytics, Security, Admin | منصة/عملاء Enterprise | ضمن اشتراك المنصة (لا بيع منفصل) |

## 3. نماذج التسعير (Pricing Models)

| النموذج | متى | المثال |
|---------|-----|--------|
| **Credits (Pay-per-use)** | استخدام متغير (استدعاءات/تحليلات) | BOQ Extract، مقارنة عروض |
| **Seat (اشتراك لكل مستخدم)** | وكلاء شخصيون يوميون | Contractor Agent ضمن باقة |
| **Bundle (باقة منظومة)** | تكامل وكلاء منظومة كاملة | Construction Suite |
| **Enterprise (مخصص)** | وكلاء منصة للشركات الكبرى | CS+Sales+Analytics... |

## 4. خريطة التسعير لكل منظومة (الإطار)

### 4.1 Career
| الوكيل | النموذج | الفكرة |
|--------|---------|--------|
| Job Seeker | Freemium + Premium (تحسين CV/إشعارات) | مجاني أساسي، مدفوع للتميز |
| Recruiter | Seat / باقة توظيف | لكل مقعد توظيف |

### 4.2 Learning
| الوكيل | النموذج | الفكرة |
|--------|---------|--------|
| Student | Freemium (مسار تعلم مجاني) + Premium | شهادات/مراجعات متقدمة |
| Trainer | Seat (للمدربين) | أدوات تحليل أداء |

### 4.3 Construction
| الوكيل | النموذج | الفكرة |
|--------|---------|--------|
| Contractor | **Starter/Pro/Enterprise** (اشتراك) + Credits لـ BOQ | قيمة RFQ/Matching مباشرة |
| Supplier | اشتراك + Credits لعروض محسنة | قيمة اقتراح عروض |
| Procurement | Enterprise (عمليات) | تنسيق مشتريات داخلي |
| Logistics | Enterprise (عمليات) | تتبع/تخطيط |

### 4.4 Platform Business (L3)
| الوكيل | النموذج |
|--------|---------|
| CS/Sales/Marketing | ضمن اشتراكات المنصة (يعززها) |
| Finance/Legal/HR | Enterprise مخصص |
| Analytics/Security/Admin | Enterprise + ميزة حوكمة |

## 5. آلية الربط بالتكلفة (Credits — 09)

```
كل استدعاء → AiGateway → AiUsage (تكلفة فعلية)
باقة المستخدم → AiQuota (creditsAvailable) → خصم/رفض (AI_QUOTA_EXCEEDED)
```

| القاعدة | التفصيل |
|---------|---------|
| لا باقة تعرض وكيلاً خاسراً | يُضبط حد الحصص بحيث التكلفة ≤ سعر الباقة |
| Credits قابلة للشراء | Premium/Enterprise يشتري رصيداً إضافياً |
| تجربة محدودة | Free = حدود كاش/قواعدية أولاً (G3) — LLM عند الضرورة ضمن الحد |
| شفافية | المستخدم يرى استهلاكه (لوحة Credits) |

## 6. عروض الانطلاق (GTM للوكلاء)

| المرحلة | التركيز |
|---------|---------|
| Pilot | وكلاء Construction (Contractor/Supplier) — القيمة الأعلى (04-icp) |
| بعد Pilot | إضافة Career/Learning (B2C) — جمهور أعرض |
| لاحقاً | L3 (Enterprise) — بيع حزم منصة |

## 7. مؤشرات نجاح النموذج

| المؤشر | الهدف |
|--------|-------|
| قيمة الوكيل = ما يوفّره (وقت/مال) | يُقاس عبر التبني |
| تكلفة/وكيل ≤ سعره | من 09/03 |
| نسبة تحويل Free→Paid | هدف يُثبَّت بعد Pilot |
| رضا المستخدم (AiFeedback) | ≥ 4/5 |

## 8. قبول التسليم

| # | المعيار |
|---|---------|
| 1 | تصنيف الوكلاء تجارياً (B2C/B2B/Ops) معتمد |
| 2 | نماذج التسعير (Credits/Seat/Bundle/Enterprise) معتمدة |
| 3 | خريطة التسعير لكل منظومة معتمدة (إطار لا أرقام) |
| 4 | ربط التكلفة (09) بالباقات معتمد — لا باقة خاسرة |
| 5 | خطة GTM للوكلاء معتمدة |
