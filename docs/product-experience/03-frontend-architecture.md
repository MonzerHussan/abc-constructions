# اقتراح معمارية الواجهات — Frontend Architecture Proposal

**الإصدار:** 1.0
**الحالة:** ✅ معتمدة — مرجع رسمي (Sprint 0)
**تاريخ الاعتماد:** 31 يوليو 2026
**المرجع:** ADR-001 · ADR-005 · ADR-006 · ADR-016 · capability-map.md

---

## 1. الأهداف والمبادئ

- البناء فوق الـ Stack الحالي (Next.js 16 App Router + React 19 + TS + Tailwind 4) دون إعادة كتابة جذرية.
- فصل واجهات **عرض البيانات** (Server Components / RSC) عن **واجهات التفاعل** (Client Components).
- عقد API موحّد يلتزم بـ ADR-006 (Response Envelope + Pagination + Error Codes) — وتُهمَّش بقية الـ API Routes القديمة تدريجياً.
- تعبير رفيع عن الـ Role-Based Access على مستوى الـ Route (middleware + server guards + بوابة UI).
- RTL-first مع دعم كامل للإنجليزية والأردية كبنية معمارية لا كخيار لاحق.
- قواعد العزل المعمارية في ADR-005 تُطبق أيضاً على الواجهات: `app → modules` اتجاه واحد، لا استيراد مباشر لـ Prisma من الواجهات.

---

## 2. تقييم الوضع الحالي (لماذا نقترح ما نقترح)

| الجانب | الوضع الحالي | الفجوة |
|---|---|---|
| Server/Client | كل الـ 69 صفحة `"use client"` | لا RSC، حمولة JS كبيرة، لا SEO |
| بيانات | `useEffect + fetch` في كل صفحة | لا Cache، لا إعادة محاولة، لا استحقاق بيانات |
| React Query | مثبت في package.json وغير مستخدم | جاهز للتفعيل |
| عميل API | لا يوجد wrapper موحّد | أخطاء/shapes غير متسقة بين `/api` و `/api/v1` |
| حماية الطرق | middleware يحمي `/api` فقط + فحص client-side | لا حماية على مستوى الصفحات |
| تنقل | Navbar مستوردة في كل صفحة، لا layouts لكل قسم | لا App Shell موحّد |
| i18n | Context + dictionary مسطح، بدون persistence | يلزم: cookie + dir منظم + تحسين الأردية |
| Design System | لا يوجد (4 مكونات فقط في ui.tsx) | موضّح في `04-design-system-plan.md` |

---

## 3. الـ Stack المقترح

| الطبقة | الاختيار | الحالة |
|---|---|---|
| Framework | Next.js 16 (App Router) | ✅ موجود |
| Language | TypeScript strict | ✅ موجود |
| Styling | Tailwind CSS 4 (CSS-first) + `cn()` | ✅ موجود |
| UI Kit | مكونات داخلية فوق Radix UI primitives | 🔜 يُضاف |
| Server State | TanStack Query v5 | 🔜 يُفعّل |
| Forms | react-hook-form + Zod (شارك الـ validators من modules) | 🔜 يُضاف |
| i18n | next-intl (بديل تطوري للـ context الحالي) | 🔜 يقترح |
| Charts (Analytics) | Recharts | 🔜 يُضاف (P1) |
| Icons | lucide-react | ✅ موجود |
| Tests | Vitest (UI) + Playwright (E2E) | Vitest موجود |

> **قاعدة الإضافة:** أي مكتبة جديدة تمر عبر ADR خفيف (Decision Log) وتُسجّل في هذه الوثيقة.

---

## 4. هيكل المجلدات المقترح

```
src/
├── app/                            # Next.js App Router (الوجهات فقط)
│   ├── (public)/                   # صفحات عامة: home, marketplace, suppliers, jobs, training
│   │   ├── marketplace/
│   │   │   ├── page.tsx            # RSC: قائمة منتجات (تستدعي خدمة القراءة مباشرة)
│   │   │   └── [id]/page.tsx       # RSC: تفاصيل + عميل سفلي للتفاعل (RFQ, favorite)
│   │   └── ...
│   ├── (auth)/                     # login, register, forgot-password
│   ├── (portal)/                   # Route Group محمية — كل البوابات
│   │   ├── layout.tsx              # App Shell موحّد (Header + Sidebar حسب الدور)
│   │   ├── supplier/               # بوابات الأدوار
│   │   ├── manufacturer/
│   │   ├── contractor/
│   │   ├── consultant/
│   │   ├── workforce/
│   │   ├── training-provider/
│   │   └── dashboard/page.tsx      # التوجيه الموحّد بعد الدخول
│   ├── admin/                      # بوابة الإدارة (صلاحية ADMIN فقط)
│   ├── api/v1/                     # REST — الوجهة المعتمدة (تشغّـل module services)
│   ├── layout.tsx                  # Root layout (html/dir/حرف)
│   └── globals.css                 # Design Tokens (04-design-system-plan)
│
├── components/
│   ├── ui/                         # UI Kit (Design System) — بدون منطق أعمال
│   ├── layout/                     # AppShell, Sidebar, Header, Breadcrumbs
│   ├── shared/                     # مكونات عبر الأدوار (EmptyState, DataTable, CompareDrawer)
│   └── feedback/                   # Toast, Alert, Modal, Skeleton
│
├── features/                       # تجميع منطق واجهة لكل domain (مرتبط بـ modules)
│   ├── marketplace/
│   │   ├── api/                    # دالات React Query (useProducts, useProduct)
│   │   ├── components/             # ProductCard, ProductFilters, CompareBar
│   │   └── types.ts
│   ├── procurement/
│   │   ├── api/
│   │   ├── components/             # RfqForm, QuoteCompareTable, AwardDialog
│   │   └── types.ts
│   └── ... (supplier, inventory, jobs, training, workforce)
│
├── lib/
│   ├── api/                        # client.ts (typed fetcher) + server.ts (RSC fetcher)
│   ├── auth.ts                     # NextAuth config (موجود)
│   ├── i18n/                       # routing + messages + direction (ترقية تدريجية)
│   ├── rbac.ts                     # (موجود) + usePermissions caching
│   └── utils.ts                    # (موجود) + formatters locale-aware
│
└── modules/                        # Backend Domains (موجود — لا يُعدَّل من الواجهات)
```

---

## 5. تنظيم المكونات (Component Organization)

قاعدة الحفر (Hierarchy):

```
1. UI Primitives (components/ui)   — Button, Input, Select, Table, Badge, Modal, Toast
   - بدون معرفة بالـ Domain، تدعم dir/locale، API موحّد (variants).
2. Layout Shell (components/layout) — AppShell، Sidebar، Header، PageContainer
   - تعرف الدور لبناء التنقل (من config لكل بوابة).
3. Shared Domain Components (components/shared) — DataTable، EmptyState، StatusPill، MoneyText
   - تعرف مفاهيم عامة: Money (ADR-016)، Status، Currency.
4. Feature Components (features/*/components) — ProductCard، RfqForm، QuoteCompareTable
   - مرتبطة بـ Domain واحد، تستورد من الطبقات فوقها فقط.
5. Pages (app/**/page.tsx) — تركيب فقط: RSC يجلب البيانات، Client components تتعامل مع التفاعل.
```

**قواعد إلزامية:**
- `components/ui` لا تستورد من `features` أو `modules`.
- `features/*` لا تستورد من `features` آخر (عزل domain).
- أي مكون تفاعلي اسمه `*Form` أو `*Dialog` يُبنى على نماذج/حوارات UI Kit.
- الاسم PascalCase للمكونات، kebab-case للمجلدات (متوافق مع ADR-010).

---

## 6. إدارة الحالة (State Management)

| نوع الحالة | الأداة | الملاحظة |
|---|---|---|
| Server State (قراءة بيانات API) | TanStack Query v5 | cache في طبقة الـ features/api |
| Server Mutations (كتابة) | Server Actions + useMutation | Server Actions للعمليات الآمنة البسيطة، REST للعمليات المعقدة |
| Client UI State | useState / useReducer محلي | داخل المكون |
| URL State (فلاتر/بحث/فرز/ترقيم) | useSearchParams | أي قائمة قابلة للمشاركة تحمل حالتها في الـ URL |
| App Context | Context نادر | Language + Session فقط (لا store عام) |
| Form State | react-hook-form + Zod resolver | المخططات مستوردة من `modules/*/validators` لتجنب الازدواج |

**نموذج بيانات الـ Query داخل `features/*/api`:**

```typescript
// features/marketplace/api/queries.ts
export const productKeys = {
  all: ["products"] as const,
  list: (params: ProductListParams) => [...productKeys.all, "list", params] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
};

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => api.get("/marketplace/products", { params }),
    placeholderData: keepPreviousData,
  });
}
```

---

## 7. نهج التكامل مع الـ API (API Integration)

### 7.1 عميل API موحّد (Typed Client)

- ملف واحد `lib/api/client.ts` يغلف `fetch` ويعرف شكل ADR-006:

```typescript
// lib/api/client.ts (مقترح)
type Envelope<T> = { success: true; data: T; meta: ApiMeta } |
                   { success: false; error: ApiError; meta: ApiMeta };
type Paginated<T> = Envelope<T> & { pagination?: PaginationMeta };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  const body: Envelope<T> = await res.json();
  if (!body.success) throw new ApiClientError(body.error, res.status);
  return body.data;
}

export const api = {
  get: <T>(p: string, opts?: QueryOptions) => request<T>(p, { method: "GET", ...opts }),
  post: <T>(p: string, data?: unknown) => request<T>(p, { method: "POST", body: JSON.stringify(data) }),
  // put, patch, del
};
```

### 7.2 قواعد المعالجة

- كل عميل يحوّل `ApiClientError` (كود + رسالة + تفاصيل) إلى رسالة UI محلية (`t(error.code)` إن وُجدت ترجمة، وإلا fallback للرسالة الافتراضية).
- **المصادقة:** الطلبات المتماثلة تحمل `credentials: "same-origin"` (JWT عبر cookie من NextAuth).
- **إلغاء التكرار:** مفاتيح Query موحّدة (`queryKeys`).
- **التحديث المتفائل:** للعمليات المعروفة (حفظ منتج مفضل، تحديث حالة) عبر `useMutation` + `setQueryData`.
- **معالجة 401:** اعتراض مركزي → تسجيل خروج تلقائي وإعادة توجيه لـ `/auth/login`.

### 7.3 خارطة الترحيل

| المرحلة | الإجراء |
|---|---|
| الآن | كتابة أي شاشة جديدة على `/api/v1/*` فقط عبر `lib/api/client.ts` |
| تحويل | شاشات قديمة تُرحَّل تدريجياً من `fetch` المباشر إلى client |
| إيقاف | عند اكتمال النقل، `deprecate` للـ endpoints القديمة ثم إزالتها |

---

## 8. المصادقة وحماية الطرق (Authentication & Route Guards)

### 8.1 التدفق

```
GET /supplier/... أو /admin/... أو /(portal)/...
        │
        ▼
middleware.ts (معتمد) — فحص الجلسة (JWT من NextAuth)
        │
        ├── غير مسجّل → /auth/login?callbackUrl=...
        │
        ├── مسجّل لكن الدور لا يملك صلاحية المجموعة → /dashboard (أو شاشة 403)
        │
        └── مسجّل وصاحب صلاحية → layout البوابة
                │
                ▼
        Server Component guard في layout (مصدر ثقة الخادم):
        requireRole(["SUPPLIER"]) → يقرر عرض الـ Sidebar والأقسام
        (لا نكتفي بفحص client-side)
```

### 8.2 قاعدة التوجيه حسب الدور

| المجموعة | الأدوار المسموحة |
|---|---|
| `(portal)/supplier` | SUPPLIER, TRADER, WORKSHOP (والأدوار المؤسسية من ADR-018: DEALER, DISTRIBUTOR...) |
| `(portal)/manufacturer` | MANUFACTURER |
| `(portal)/contractor` | CONTRACTOR, SUBCONTRACTOR |
| `(portal)/consultant` | CONSULTANT |
| `(portal)/workforce` | FREELANCER, WORKER (مستجد) |
| `(portal)/training-provider` | مقدمي التدريب (دور مؤسسي) |
| `admin` | ADMIN, SUPER_ADMIN |
| `(public)` | الكل |

### 8.3 صلاحيات الأدق (Feature-level)

- `usePermissions()` (موجود في `hooks/usePermissions.ts`) يُعطى cache عبر React Query:
  - `queryKey: ["permissions", organizationId]`
  - يُستخدم لإظهار/إخفاء أزرار وأقسام داخل البوابة.
- **قاعدة إلزامية:** الحماية النهائية دائماً على الخادم (API + Server Component). الـ UI يخفف فقط وليس حارساً.

---

## 9. لوحات الأدوار (Role-Based Dashboards)

كل بوابة تشترك في نفس الـ App Shell لكن بمحتوى تنقل مختلف من **Config واحد لكل دور**:

```typescript
// lib/portal-config.ts (مقترح)
export const portalConfig: Record<Portal, PortalConfig> = {
  supplier: {
    nav: [
      { href: "/supplier", labelKey: "dashboard", icon: "layout-dashboard" },
      { href: "/supplier/profile", labelKey: "companyProfile", icon: "building-2" },
      { href: "/supplier/products", labelKey: "products", icon: "package" },
      { href: "/supplier/inventory", labelKey: "inventory", icon: "warehouse" },
      { href: "/supplier/rfqs", labelKey: "rfqs", icon: "file-text" },
      { href: "/supplier/orders", labelKey: "orders", icon: "shopping-cart" },
      { href: "/supplier/analytics", labelKey: "analytics", icon: "chart-bar" },
    ],
    widgets: ["kpiOrderStats", "pendingRfqs", "lowStock", "recentOrders"],
  },
  // contractor, manufacturer, consultant, workforce, trainingProvider, admin
};
```

**Widget Registry:** أدوات لوحة التحكم مسجلة ومركّبة حسب الدور (KPI Cards، قوائم معلقة، تنبيهات مخزون، أحدث الطلبات). الـ Layout شبكة `12-col` مع `span` محدد لكل widget.

**Admin Dashboard:** يستخدم نفس الـ registry لكن ببيانات Aggregate (مستخدمواً، مؤسسات، تحقق معلق، تداول).

---

## 10. i18n ومعمارية RTL

### 10.1 الترقية التدريبية (لا ثورة)

| الخطوة | الوصف |
|---|---|
| 1. **Persistence** | حفظ اللغة في `cookie` (`NEXT_LOCALE`) وقراءتها في Root Layout — لا إعادة تعيين عند كل تحديث |
| 2. **الدليل والاتجاه** | `dir` يُشتق من اللغة عند الطلب الأول (SSR) بدل DirSync بعد التحميل فقط |
| 3. **dictionary منظمة** | تقسيم `translations.ts` إلى مجلدات حسب feature (messages/marketplace/ar.json ...) |
| 4. **خط عربي محسّن** | إضافة خط عربي (IBM Plex Sans Arabic أو Cairo) بديل للواجهة العربية — موضح في Design System |
| 5. **الأردية (متطلب معتمد R1)** | إكمال التغطية UR (حالياً ناقصة) + خط Nastaliq (D9) — الأردية واجهة كاملة RTL ضمن الـ RTL المشترك |
| 6. **التنسيقات** | `formatDate/formatCurrency` locale-aware (بدل hardcode "ar-EG") + دعم `Currency` من ADR-016 + `Intl.NumberFormat` للأرقام (ar-SA / ur-PK / en) |

### 10.2 قواعد النصوص

- كل نص UI من الـ dictionary — لا `ternary` مضمّن في الصفحات.
- الوحدات والأكواد الفنية (SKU, RFQ-001) تُترك لاتينية دائماً مع `dir="ltr"`.
- رسائل الخطأ تُترجم محلياً على العميل من `error.code`.

### 10.3 قواعد ملكية الترجمة (D10 — Translation Ownership Rules)

| القاعدة | التفصيل |
|---|---|
| **الملكية لكل لغة** | مسؤول/مزوّد واحد معيَّن لكل لغة (العربية · الإنجليزية · الأردية) هو المرجع النهائي لصحة الترجمة وتوقيتها |
| **dictionary منظمة** | ملفات ترجمة حسب feature (`messages/<feature>/ar.json|en.json|ur.json`) بجوار الكود — لا ملف ضخم واحد |
| **Glossary موحّد** | قاموس مصطلحات البناء موحّد (سجّد في `docs/localization/glossary.md`): كل مصطلح (RFQ، BOQ، KYC، PO، Stock) له ترجمة رسمية واحدة في اللغات الثلاث — لا ترجمات متعددة لنفس المفهوم |
| **قفل المفاتيح** | مفاتيح الترجمة **لا تُحذف ولا تُعاد تسميتها** أبداً (قد تكون مستخدمة في نسخ قديمة/صلات خارجية)؛ تُهمَّر كـ `deprecated` ثم تُزال بعد مراجعة |
| **تغطية 100%** | قبل كل إطلاق: فحص آلي يضمن وجود كل مفتاح في اللغات الثلاث (`linter` يَفشل عند مفتاح ناقص — لا `fallback` صامت للعربية) |
| **التناسق الزمني** | السلسلة تُترجم وتُقفل معها (Feature Freeze = Translation Freeze)؛ التحديث المتأخر يُنشر كتصحيح ولا يحجب الإطلاق |
| **لا نصوص عالقة** | لا نصوص مضمّنة في المكوّنات؛ أي سلسلة جديدة تُضاف عبر PR يمر بمراجعة ترجمة |
| **مراجعة الجودة** | عيّنة عشوائية ≥ 10% من المفاتيح الجديدة تُراجع لغوياً في كل لغة (مترجم بشري) قبل الاعتماد |

---

## 11. أنماط جلب البيانات (Data Fetching Patterns)

| السيناريو | النمط |
|---|---|
| قائمة عامة/سوق (قراءة) | **RSC**: `await productCatalogService.search(params)` → HTML مباشر + قارئ أفضل للـ SEO. التفاعل (فلاتر) عبر `useSearchParams` + Client component. |
| صفحة بعد تسجيل الدخول | **RSC + auth()** ثم Client مكونات تفاعلية. |
| بيانات شخصية متغيرة (عروض، طلبات) | **Client + React Query** مع `staleTime` قصير. |
| عمليات كتابة بسيطة | **Server Actions** (نشر منتج، إضافة مفضل، تحديث حالة) مع `useTransition`. |
| عمليات معقدة/عابرة للـ Domains | **REST `/api/v1`** عبر client + `useMutation`. |

**قاعدة:** الصفحات القابلة للفهرسة (سوق، وظائف، دورات، موردون) RSC. الصفحات الشخصية (بوابات، لوحات) هجينة تبدأ RSC.

---

## 12. الأداء والـ SEO

- صفحات RSC عامة → `generateMetadata` لكل صفحة (عنوان + وصف + og) باللغة النشطة.
- صور منتجات/مشاريع: `next/image` + WebP + lazy + `sizes`.
- `dynamic = "force-dynamic"` حيث يلزم، و `revalidate` للبيانات شبه الثابتة.
- مكونات ثقيلة (خرائط Leaflet، الرسوم البيانية) → `next/dynamic` مع `ssr: false`.
- تقليل JS: الاعتماد على RSC يخفض حمولة الصفحات العامة جذرياً.
- Bundle Analysis ضمن معايير القبول (`npx @next/bundle-analyzer`).

---

## 13. الاختبارات (Testing Strategy)

| المستوى | الأداة | التركيز |
|---|---|---|
| Unit (مكونات/دوال) | Vitest + Testing Library | مكونات UI، formatters، client API |
| Architecture | Vitest (موجود 420+ اختباراً) | إضافة قواعد عزل الواجهات (لا استيراد modules/ui من app...) |
| E2E | Playwright | تدفقات حرجة: Onboarding → RFQ → PO؛ RTL/LTR switch؛ تسجيل دخول |
| A11y | axe-core | فحص تلقائي في E2E |
| Visual | (اختياري P2) | chromatic/playwright snapshots |

**معيار القبول:** كل شاشة جديدة تنجح في اختبار smoke (تحميل + تفاعل رئيسي + بدون أخطاء console).

---

## 14. خطة التنفيذ (Rollout)

| Sprint | العمل |
|---|---|
| **Sprint 1** | Design Tokens + UI Kit أساسي (Button/Input/Select/Table/Badge/Modal/Toast) + Root Layout موحّد + App Shell + حماية Routes في middleware + i18n persistence |
| **Sprint 2** | `lib/api/client` + تفعيل React Query + أول features (marketplace list/detail + RFQ flow) |
| **Sprint 3** | بوابات: supplier (profile/products/inventory/rfqs/orders) + contractor (projects/BOQ/RFQ/offers) |
| **Sprint 4** | workforce + training-provider + consultant + تحويل الشاشات القديمة |
| **Sprint 5+** | Analytics dashboards + migration كاملة من `/api` القديمة + E2E suite |

---

## 15. القرارات المفتوحة (Open Questions)

| السؤال | المقترح | يحتاج |
|---|---|---|
| next-intl بدل context الحالي؟ | نعم، ترقية تدريجية | موافقة الـ Architecture Team |
| Server Actions vs REST للكتابة؟ | الاثنان: Server Actions للبسيط، REST للمعقد | لا شيء |
| react-hook-form أم Form بدون مكتبة؟ | react-hook-form | لا شيء |
| Recharts أم مكتبة أخرى للرسوم؟ | Recharts | قرار نهائي (P1) |
| تصدير المخططات من validators إلى الواجهة؟ | نعم (share types) | تنظيم imports عبر tsconfig paths |

---

**نهاية اقتراح معمارية الواجهات**
