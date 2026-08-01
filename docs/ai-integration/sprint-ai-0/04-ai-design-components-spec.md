# Sprint AI-0 · Deliverable 4 — AI Design Components Specification

> **المسار:** AI & Integration Layer — Sprint AI-0
> **الحالة:** 📝 مواصفة — جاهزة للاعتماد (تخضع لاعتماد Product Experience)
> **يخدم القرار:** G4 — إضافة مكوّنات AI إلى Design System
> **المرجع:** `docs/product-experience/04-design-system-plan.md` (Tokens/UI Kit) + `02-screen-map.md`

---

## 1. مبدأ

4 مكوّنات AI تُضاف إلى `src/components/ui/` بنفس قواعد نظام التصميم (Tokens، cva، A11y AA، RTL/LTR، ثلاثي اللغات). **هذه وثيقة مواصفة — التنفيذ يتم في Sprint التنفيذ بعد الاعتماد.**

| المكوّن | الغرض | يخدم |
|---------|-------|------|
| `ai-match-reason-card` | عرض نتيجة مطابقة مورد مع الأسباب والتحليل | Supplier Matching (7.8/7.9) |
| `ai-confidence-badge` | شارة مستوى الثقة لكل ناتج AI | كل قدرات AI |
| `ai-natural-language-search` | بحث باللغة الطبيعية + اقتراحات | Search Assistant (4.1/4.6/Landing) |
| `ai-analysis-panel` | لوحة عرض نتائج تحليل AI (BOQ/مناقصة/سعر) | BOQ/Tender/Pricing |

> ملفات/أسماء الـ mappers في هذه الوثيقة **مقترحة** — تُنفَّذ داخل `components/ui/ai/` وفق مراحل بناء الـ Design System (Phase B/C).

---

## 2. المكوّن 1 — `AiMatchReasonCard`

### 2.1 الغرض
بطاقة تعرض **مورداً واحداً** ضمن نتائج المطابقة الذكية: النتيجة الإجمالية، شارة التحقق، الأسباب القابلة للعرض، وتحليل الدرجات — لتمكين الشفافية (UX Principle 1).

### 2.2 الاستخدام في الشاشات
- `7.9 العروض الواردة ومقارنتها` (اقتراحات موردين)
- `7.8 إنشاء RFQ` (موردون مقترحون)
- `4.4 مقارنة الموردين لمنتج واحد`
- `5.13 RFQs واردة` (لمحة فرصة)

### 2.3 Props API

```typescript
interface AiMatchReasonCardProps {
  supplier: {
    id: string;
    name: string;
    nameAr?: string;
    logo?: string;
    verificationLevel: 'UNVERIFIED' | 'BASIC' | 'VERIFIED' | 'TRUSTED' | 'FLAGSHIP';
    rating?: number;
    coverage?: string[];
  };
  score: number;                 // 0..1
  breakdown: {
    semantic: number;
    rules: number;
    price: number;
    delivery: number;
    rating: number;
  };
  reasons: string[];             // مترجمة حسب اللغة
  cta?: { label: string; href: string };
  onFeedback?: (action: 'ACCEPTED' | 'DISMISSED' | 'IGNORED') => void;
  compact?: boolean;
}
```

### 2.4 الحالات (Variants/States)

| الحالة | السلوك |
|--------|--------|
| `loading` | Skeleton بأبعاد البطاقة |
| `default` | نتيجة مطابقة طبيعية |
| `compact` | نسخة مصغرة (قائمة) — بدون breakdown |
| `empty/error` | EmptyState أو رسالة خطأ قابلة لإعادة المحاولة |

### 2.5 الهيكل المقترح

```
┌───────────────────────────────────────────────┐
│ [logo] الاسم           [AiConfidenceBadge 92%] │
│        مستوى التحقق (StatusBadge) · ⭐ rating  │
│ ────────────────────────────────────────────── │
│ الأسباب:                                       │
│  • مطابقة دلالية عالية لقدرة: حديد تسليح        │
│  • التحقق: VERIFIED · يغطي الرياض · 5 أيام     │
│ ────────────────────────────────────────────── │
│ سعر .90  تسليم .85  تقييم .80   [عرض المورد]   │
└───────────────────────────────────────────────┘
```

### 2.6 تصميم (Tokens)
- الحاوية: `Card` — `bg-surface-0 rounded-xl border border-surface-200 shadow-sm`
- الأسباب: `text-surface-700 text-sm` مع bullets
- breakdown: أشرطة صغيرة `h-1.5 rounded-full` بلون `brand-500` (نسبة التعبئة = score)
- A11y: البطاقة قابلة للفهم دون لون (نصوص + أرقام).

---

## 3. المكوّن 2 — `AiConfidenceBadge`

### 3.1 الغرض
شارة صغيرة توضح **مستوى ثقة النموذج** في أي ناتج AI (مطابقة، تحليل، استخراج، توصية) — مع Tooltip يشرح المعنى. تكامل إلزامي مع كل ناتج AI (إجابةً عن G4 و UX Principle 1).

### 3.2 الاستخدام
- فوق `AiMatchReasonCard`
- رأس `AiAnalysisPanel`
- نتائج Natural Language Search
- أي نص "مولّد بالذكاء الاصطناعي"

### 3.3 Props API

```typescript
interface AiConfidenceBadgeProps {
  confidence: number;           // 0..1
  label?: string;               // مخصص (افتراضياً "ثقة AI")
  tooltip?: string;             // شرح المعنى
  status?: 'default' | 'fallback'; // fallback → يحذر أن النتيجة قواعدية
  size?: 'sm' | 'md';
}
```

### 3.4 التدرج اللوني (لا يعتمد على اللون وحده — أيقونة + نص)

| المدى | الحالة | Token | أيقونة |
|-------|--------|-------|--------|
| ≥ 0.8 | عالية | `success-500` | ✓ |
| 0.6 – 0.8 | متوسطة | `info-500` | ~ |
| < 0.6 | منخفضة | `warning-500` | ! |
| `fallback` | نتيجة قواعدية (بديل) | `surface-500` | ⚙ |

### 3.5 قواعد
- كل ناتج AI يعرض البadge (شفافية إلزامية).
- `fallback` تعني "لم يعمل النموذج — نتيجة بديلة" — تُعرض بوضوح.
- في وضع RTL/LTR أيقونة الثقة تُقلب منطقياً عند الحاجة.

---

## 4. المكوّن 3 — `AiNaturalLanguageSearch`

### 4.1 الغرض
حقل بحث يفهم **السؤال الطبيعي متعدد اللغات** (ar/en/ur) ويحوّله لنتائج منظمة — مع اقتراحات أثناء الكتابة وحالة "تفسير AI".

### 4.2 الاستخدام
- `1.1 الصفحة الرئيسية (البحث الذكي)` — Landing
- `4.1 بحث المنتجات` / `4.6 نتائج البحث المتقدم`
- `9.5 بحث الوظائف` (مرحلة لاحقة)

### 4.3 Props API

```typescript
interface AiNaturalLanguageSearchProps {
  onSearch: (query: string) => void;          // بحث كلاسيكي (Retrieval — G3)
  onAiQuery: (query: string) => Promise<void>; // تفسير AI (Understanding — G3)
  placeholder?: string;                        // مترجم حسب اللغة
  languages: ('ar' | 'en' | 'ur')[];
  suggestions?: string[];                      // اقتراحات (خارجية/كاش)
  loading?: boolean;                           // حالة تفسير AI
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

### 4.4 الحالات

| الحالة | السلوك |
|--------|--------|
| `idle` | أيقونة بحث + placeholder |
| `typing` | Debounce → اقتراحات (Combobox pattern من UI Kit) |
| `ai-interpreting` | Spinner + نص "جارٍ فهم طلبك…" (بديل للبحث المباشر) |
| `results` | يوجّه للنتائج (Retrieval) أو للتفسير الذكي |
| `error` | رسالة خطأ + إعادة محاولة + إمكانية البحث الكلاسيكي (Fallback) |
| `empty` | اقتراح "جرّب: حديد تيوتو معتمد في جدة" |

### 4.5 تصميم
- يعتمد على `SearchInput`/`Combobox` في UI Kit مع توسعة حالات AI.
- في العربية (RTL) الأيقونة في `start`، زر الإرسال في `end` (قاعدة النماذج §5.2).
- A11y: نمط `combobox` (role + aria-expanded + listbox) من Radix.
- **G3:** الزر لا يخفي البحث الكلاسيكي — زر إضافي "البحث الذكي" يظهر الخيارين بوضوح.

### 4.6 ملاحظة تجربة
- أول استخدام: يشرح Tooltip أن "البحث الذكي يفهم اللغة الطبيعية".
- Fallback: إذا فشل تفسير AI → نتائج بحث كلاسيكية فوراً (مبدأ P6).

---

## 5. المكوّن 4 — `AiAnalysisPanel`

### 5.1 الغرض
لوحة موحّدة لعرض **نتائج تحليلات AI**: ملخص مناقصة، تطبيع BOQ، تقدير تكلفة، مؤشر أسعار — مع رأس يوضح النوع والثقة، وأفعال (إعادة توليد/ملاحظة/تنزيل).

### 5.2 الاستخدام
- `7.5/7.6 رفع/معاينة BOQ` (تطبيع الأصناف + تقدير)
- `7.9 مقارنة العروض` (تلميحات)
- `8.12 تقييم العروض` (تحليل مساعد)
- `13.13 مراجعة محتوى السوق` (تحليلات)

### 5.3 Props API

```typescript
type AiAnalysisType = 'boq' | 'tender' | 'pricing' | 'insight';

interface AiAnalysisPanelProps {
  type: AiAnalysisType;
  title: string;                    // مترجم
  confidence: number;               // → AiConfidenceBadge
  status: 'loading' | 'ready' | 'error' | 'empty';
  result?: AiAnalysisResult;        // بنية حسب النوع
  actions?: {
    onRegenerate?: () => void;
    onFeedback?: (f: 'HELPFUL' | 'NOT_HELPFUL') => void;
    onDownload?: () => void;
  };
  sourceLinks?: { label: string; href?: string }[]; // مصادر (Grounded)
}
```

### 5.4 بنية النتيجة حسب النوع

| النوع | `AiAnalysisResult` |
|-------|--------------------|
| `boq` | `{ items: { raw, category, unit, qty, estimatedCost }[], totalEstimate, warnings[] }` |
| `tender` | `{ summary, requirements[], risks[], deadline, budget }` |
| `pricing` | `{ median, percentile25, percentile75, sampleSize, currency }` |
| `insight` | `{ headline, body, priority }` |

### 5.5 الحالات

| الحالة | السلوك |
|--------|--------|
| `loading` | Skeleton + "جارٍ التحليل…" (يرتبط بـ AiJob) |
| `ready` | رأس (نوع + ثقة) + محتوى + مصادر + أفعال |
| `error` | رسالة + إعادة محاولة + Fallback (إذا وُجد) |
| `empty` | EmptyState يشرح لماذا + CTA |

### 5.6 تصميم
- الحاوية: `Widget` من UI Kit (Header + Body + Actions).
- الجداول الداخلية (BOQ) تستخدم نمط `DataTable` + `BOQ Table` (§5.4 Design System).
- التقديرات المالية عبر `MoneyText` (locale-aware، ADR-016).
- A11y: `aria-live="polite"` لحالات التحميل/التحديث.

---

## 6. خريطة الاعتماد (Dependencies)

| المكوّن | يعتمد على | مرحلة UI Kit |
|---------|-----------|--------------|
| `AiMatchReasonCard` | Card, StatusBadge, AiConfidenceBadge, Tooltip, Skeleton | Phase B/C |
| `AiConfidenceBadge` | Badge, Tooltip | Phase B |
| `AiNaturalLanguageSearch` | SearchInput, Combobox/ASYNC, Spinner, Tooltip, EmptyState | Phase B |
| `AiAnalysisPanel` | Widget, AiConfidenceBadge, DataTable, MoneyText, EmptyState, Skeleton | Phase C |

## 7. معايير القبول (للتسليم والتنفيذ)

| # | المعيار |
|---|---------|
| 1 | المكوّنات الأربعة معتمدة من Product Experience |
| 2 | كل مكوّن: Props موثقة + Variants (cva) + حالات + RTL/LTR + A11y AA |
| 3 | أمثلة استخدام باللغات الثلاث (AR/EN/UR) لكل مكوّن |
| 4 | تُسجَّل في `components/ui/README.md` (قاعدة Design System §9) |
| 5 | لا تنفيذ برمجي لهذه المكوّنات قبل اعتماد Sprint التنفيذ |
