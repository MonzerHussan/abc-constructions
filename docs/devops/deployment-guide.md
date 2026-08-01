# دليل النشر — منصة ABC (Beta)

**التاريخ:** 2026-08-01

---

## 1. المتطلبات

- Node.js 20+
- PostgreSQL 14+ (يُفضل 16)
- مدير حزم npm

## 2. المتغيرات البيئية

| المتغير | الوصف | إلزامي |
|---|---|---|
| `DATABASE_URL` | URI لقاعدة PostgreSQL | نعم |
| `AUTH_SECRET` | مفتاح توقيع جلسات Auth.js (32+ حرفاً عشوائياً) | نعم |
| `AUTH_TRUST_HOST` | `true` عند النشر خلف بروكسي | نعم |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | بيانات OAuth Google (اختياري) | لا |

> استخدم `openssl rand -base64 32` لتوليد `AUTH_SECRET`. لا تضع الأسرار في git أبداً.

## 3. خطوات النشر

### 3.1 محلياً (اختبار)
```bash
npm ci
npx prisma generate
npx prisma migrate deploy   # تطبيق الـ migrations القياسية
npm run build
npm start
```

### 3.2 على Vercel (الخيار الموصى به لـ Next.js)
1. اربط المستودع بـ Vercel.
2. عيّن المتغيرات أعلاه في Project Settings → Environment Variables.
3. أمر البناء الافتراضي `next build` يعمل (يشمل `prisma generate` في `postinstall`).
4. حدد قاعدة بيانات PostgreSQL مُدارة (Neon/Supabase/Vercel Postgres).

### 3.3 على خادم مخصص (Docker/VPS)
```bash
# إعداد التطبيق
npm ci --omit=dev
npx prisma generate
npx prisma migrate deploy
npm run build

# التشغيل
npm start   # يستمع على PORT (افتراضي 3000)
```
- أوصى بوضع خلف وكيل عكسي (Nginx/Caddy) مع HTTPS.
- نسق الملفات المرفوعة: `public/uploads` — ثبّت حجم قرص كافٍ أو انتقل إلى S3 عند التوسع.

## 4. قاعدة البيانات (مهم)

- المخطط الحالي في git: **137 نموذجاً**، لكن يوجد فقط 5 migrations.
- **Baseline migration** أُنشئ كأثر أمان: `prisma/baseline/0_baseline.sql` (متولد من schema الحالي).
- **للنسخ الجديدة (Fresh DB):** نفذ
  ```bash
  psql $DATABASE_URL -f prisma/baseline/0_baseline.sql
  ```
  ثم سجل ذلك كـ `_prisma_migrations` أو استخدم `prisma db push`.
- **لقاعدة حالية متطابقة:** التزم بـ `prisma migrate deploy` المعتاد.
- **تحذير:** لا تنفذ baseline على قاعدة حية دون نسخة احتياطية، ولا تخلط بين المسارين.

## 5. الأمان عند النشر

- عطّل `NODE_ENV=production` تلقائياً يفعّل حماية endpoints seed (موجودة).
- تأكد من إعداد رؤوس الأمان (موجودة في `next.config.ts`).
- استخدم HTTPS وأعد تدوير الأسرار عند الشك.

## 6. فحص ما بعد النشر

```bash
curl -I https://YOUR_DOMAIN/          # تحقق من رؤوس الأمان
curl -I https://YOUR_DOMAIN/api/seed/roles   # يجب أن يعيد 401/403
npm run typecheck                       # محلياً
```
