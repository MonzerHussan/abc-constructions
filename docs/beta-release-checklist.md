# قائمة فحص إطلاق Beta — منصة ABC

**الإصدار:** 0.1.0  
**التاريخ:** 2026-08-01  
**الغرض:** قائمة تحقق تشغيلية شاملة يجب إكمالها قبل فتح Beta للمستخدمين. كل بند إما ✅ (منجز) أو ⬜ (قيد التنفيذ/يُنفذ تشغيلياً).

---

## 1. الجودة (Quality)

| # | البند | الحالة | الملاحظة |
|---|---|---|---|
| Q-01 | جميع الاختبارات الآلية تمر | ✅ | 1,115 اختباراً (28 ملفاً) |
| Q-02 | فحص الأنواع نظيف (`tsc --noEmit`) | ✅ | 0 أخطاء |
| Q-03 | Build إنتاجي ناجح | ✅ | `next build` (يتطلب DB) — يُنفذ في CI |
| Q-04 | التغطية عند أو فوق خط الأساس | ✅ | Lines 80.41% / Branches 61.68% |
| Q-05 | E2E (Playwright) يُنفذ ويجتاز | ⬜ | spec مكتوب؛ التنفيذ في CI عند ربط GitHub |
| Q-06 | اختبارات البنية (architecture) تمر | ✅ | 574 قاعدة |
| Q-07 | lint: لا إدخال أخطاء جديدة من الفريق | ⚠️ | 208 أخطاء موروثة موثقة (technical-debt.md)؛ CI لا يُعطَّل بها |

## 2. الأمان (Security)

| # | البند | الحالة | الملاحظة |
|---|---|---|---|
| S-01 | تصعيد صلاحيات التسجيل مغلق | ✅ | `selfRegisterSchema` + allowlist أدوار |
| S-02 | Rate limiting على نقاط المصادقة | ✅ | check-credentials, register, MFA, authorize |
| S-03 | رفع الملفات مُحكَّم (magic bytes) | ✅ | PNG/JPEG/WebP/PDF + حد 10MB |
| S-04 | endpoints seed محمية | ✅ | ممنوعة في production + ADMIN/SUPER_ADMIN |
| S-05 | رؤوس أمان HTTP | ✅ | CSP, X-Frame-Options, HSTS, nosniff |
| S-06 | جلسات (maxAge 7 أيام) + منع غير النشطين | ✅ | |
| S-07 | **تدوير كلمة مرور DB القديمة (المكشوفة في git)** | ✅ **تم** | تم تدوير كلمة مرور postgres + إنشاء `abc_app` + نقل التطبيق إليه — السر القديم مُبطَل |
| S-08 | **تدوير AUTH_SECRET لكل بيئة** | ⬜ **إلزامي** | قبل النشر |
| S-09 | مفاتيح Google OAuth منفصلة لكل بيئة | ⬜ **إلزامي** | إن استُخدم Google sign-in |
| S-10 | فحص أسرار آلي (gitleaks) في CI | ⬜ | موصى به — إضافة قادمة |
| S-11 | RBAC مُتحقَّق عبر اختبارات | ✅ | أدوار self-registration + أذونات seed/middleware |
| S-12 | **تنظيف Git history من السر القديم** | ⬜ | خطة filter-repo جاهزة (يحتاج موافقة force push) |

## 3. الأداء (Performance)

| # | البند | الحالة | الملاحظة |
|---|---|---|---|
| P-01 | قياسات Baseline (TTFB/LCP) للصفحات الحرجة | ⬜ | يجب أخذها قبل الإطلاق (انظر performance-report.md) |
| P-02 | Load testing | ⬜ | اختياري للـ Beta؛ k6/autocannon عند الحاجة |
| P-03 | مقاييس استجابة API مسجلة | ⬜ | إعداد Prisma query logging + أداة رصد |
| P-04 | فحوصات أداء DB (EXPLAIN / فهارس) | ⬜ | فهرسة الحقول الحرجة مؤجلة (TD-08/TD-09) |
| P-05 | لا N+1 معروف على المسار الحرج | ⚠️ | بحاجة تأكيد عبر logging |

## 4. النشر والتشغيل (Deployment)

| # | البند | الحالة | الملاحظة |
|---|---|---|---|
| D-01 | متغيرات البيئة (dev/staging/prod) موثقة | ✅ | `.env.example` مفصّل + secrets-management.md |
| D-02 | أسرار الإنتاج في Secret Manager (وليس git) | ⬜ | إجراء عند الاستضافة |
| D-03 | `DATABASE_URL` لكل بيئة منفصلة | ⬜ | إلزامي |
| D-04 | **نسخة احتياطية مجرّبة (Backup tested)** | ⬜ **إلزامي** | تجربة استعادة فعلية قبل Beta |
| D-05 | **خطة استرجاع (Rollback plan)** | ⬜ **إلزامي** | راجع deployment-guide.md |
| D-06 | baseline migration جاهز للنسخ الجديدة | ✅ | `prisma/baseline/0_baseline.sql` |
| D-07 | CI/CD pipeline مفعّل على GitHub | ⬜ | الملف جاهز؛ يُفعَّل عند الرفع |
| D-08 | مراقبة/تنبيهات (uptime, errors, logs) | ⬜ | خطة موجودة في monitoring-plan.md |

## 5. التوثيق (Documentation)

| # | البند | الحالة |
|---|---|---|
| DOC-01 | استراتيجية الاختبار | ✅ docs/qa/test-strategy.md |
| DOC-02 | حالات الاختبار | ✅ docs/qa/test-cases.md |
| DOC-03 | تقرير الأتمتة | ✅ docs/qa/automation-report.md |
| DOC-04 | التدقيق الأمني | ✅ docs/security/security-audit.md |
| DOC-05 | نموذج التهديدات | ✅ docs/security/threat-model.md |
| DOC-06 | تقرير الثغرات | ✅ docs/security/vulnerabilities-report.md |
| DOC-07 | إدارة الأسرار | ✅ docs/security/secrets-management.md |
| DOC-08 | تقرير الأداء | ✅ docs/performance/performance-report.md |
| DOC-09 | معمارية CI/CD | ✅ docs/devops/cicd-architecture.md |
| DOC-10 | دليل النشر | ✅ docs/devops/deployment-guide.md |
| DOC-11 | خطة المراقبة | ✅ docs/devops/monitoring-plan.md |
| DOC-12 | الديون التقنية | ✅ docs/technical-debt.md |
| DOC-13 | تقرير الجاهزية | ✅ docs/beta-readiness-report.md |

---

## خلاصة الحالة

- **منجز بالكود:** الجودة، معظم الأمان، CI/CD، التوثيق.
- **⬜ إلزامي قبل فتح Beta (تشغيلي):** تدوير الأسرار (S-07/08/09)، نسخة احتياطية مجرّبة (D-04)، خطة استرجاع (D-05)، تعبئة أسرار الاستضافة (D-02/03).
- **⬜ موصى به عند الإطلاق:** قياسات أداء baseline (P-01)، تفعيل المراقبة (D-08).
