# إدارة الأسرار (Secrets Management) — منصة ABC

**التاريخ:** 2026-08-01  
**الحالة:** تدقيق + خطة تدوير (التنفيذ التشغيلي يتطلب وصولاً للبنية التحتية)

---

## 1. فحص تسريب الأسرار في Git History — نتيجة

| الملف/الموقع | السر المكشوف | الخطورة | الحالة |
|---|---|---|---|
| `.env.example` (commit `549ce0a` — Initial) | `DATABASE_URL` يتضمن كلمة مرور postgres حقيقية | **حرجة** | ✅ **مُدوَّر** — كلمة المرور القديمة مُبطَلة |
| `.env.example` (commit `35becc6` — HEAD) | نفس السر ما زال | **حرجة** | ✅ **مُدوَّر** — `.env.example` نظيف الآن |
| `.env` (محلي، gitignored) | كان يستخدم السر القديم | **حرجة** | ✅ **مُحدَّث** — يستخدم `abc_app` بكلمة مرور جديدة |
| `DATABASE_SETUP.sql` | لا أسرار | — | ✅ آمن |
| `README.md` / `INSTALL_GUIDE.md` | لا أسرار | — | ✅ آمن |
| `package-lock.json` | integrity hashes فقط | — | ✅ آمن |

**الخلاصة:** ✅ **تم تنفيذ التدوير** في 2026-08-01:
1. تدوير كلمة مرور `postgres` (السر القديم مُبطَل ولا يعمل).
2. إنشاء مستخدم مخصص `abc_app` (ليس superuser) بكلمة مرور قوية.
3. نقل اتصال التطبيق إلى `abc_app` في `.env`.
4. منح `abc_app` صلاحيات محدودة على `abc_constructions` فقط.
5. **متبقٍ:** السر القديم لا يزال في Git history (commit `549ce0a`، `35becc6`) — لكنه **مُبطَل** (لا يعمل). تنظيف التاريخ بـ `git filter-repo` خطة جاهزة (القسم 5).

## 2. إجراءات إلزامية (قبل أو مع أول Commit)

### 2.1 تدوير كلمة مرور PostgreSQL — ✅ تم
- تم تنفيذ `ALTER USER postgres WITH PASSWORD '...'` على الخادم المحلي.
- كلمة المرور القديمة **مُبطَلة ولا تعمل**.
- تم إنشاء مستخدم مخصص `abc_app` (ليس superuser) ونقل التطبيق إليه.
- `abc_app` لديه صلاحيات محدودة على `abc_constructions` فقط (USAGE, CREATE على public؛ SELECT/INSERT/UPDATE/DELETE على الجداول).

### 2.2 تدوير AUTH_SECRET (إلزامي — لم يُنفّذ بعد)
- توليد جديد لكل بيئة: `openssl rand -base64 32`
- يُنشر في Secret Manager الخاص بالاستضافة (Vercel/Neon/CI).

### 2.3 مفاتيح Google OAuth (إلزامي قبل أي تسريب)
- إنشاء OAuth clients منفصلة: `dev`, `staging`, `prod`.
- إذا سُرب أي client secret سابقاً → أعد توليده في Google Cloud Console.

## 3. فصل الأسرار بين البيئات

| المتغير | Dev | Staging | Production |
|---|---|---|---|
| `DATABASE_URL` | `abc_app` + `abc_dev` + كلمة مستقلة | `abc_app` + `abc_staging` + كلمة مستقلة | `abc_app` + `abc_prod` + كلمة مستقلة |
| `AUTH_SECRET` | عشوائي محلي | عشوائي مستقل | عشوائي مستقل |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://staging…` | `https://…` |
| `AUTH_GOOGLE_ID/SECRET` | client dev | client staging | client prod |

**قاعدة ذهبية:** لا يُعاد استخدام أي سر بين بيئتين. أي سر يُرفع لـ git يُعد مكشوفاً ويُدوَّر.

## 4. أين تُخزَّن الأسرار؟

- **محلياً:** `.env.local` (في `.gitignore`).
- **CI/CD:** GitHub Actions → Settings → Secrets (تُحقن كمتغيرات، لا تُكتب في الملفات).
- **الاستضافة:** Vercel Environment Variables أو Neon/Supabase dashboard أو أي Secret Manager.
- **أبداً:** لا ملف `.env*` في git، لا قيم في `package.json`/workflow/كود.

## 5. خطة إزالة السر من Git History (جاهزة — تحتاج موافقة لـ force push)

السر القديم مُبطَل (لا يعمل)، لكن لا يزال ظاهراً في Git history المنظور على GitHub. تنظيف التاريخ اختياري الآن من ناحية الأمان (السر عديم الفائدة)، لكنه مستحسن للنظافة:

- **الخيار A (مستحسن): `git filter-repo`**
  ```bash
  # 1. تثبيت الأداة
  pip install git-filter-repo

  # 2. نسخة احتياطية كاملة أولاً
  git clone --mirror https://github.com/MonzerHussan/abc-constructions.git abc-backup.git

  # 3. استبدال السر القديم (مُبطَل الآن) في كل التاريخ
  echo "LEAKED_OLD_PASSWORD==>REDACTED" > /tmp/replacements.txt
  git filter-repo --replace-text /tmp/replacements.txt --force

  # 4. إعادة ربط الـ origin ثم force push
  git remote add origin https://github.com/MonzerHussan/abc-constructions.git
  git push origin --force --all
  git push origin --force --tags
  ```

- **الخيار B: إعادة إنشاء التاريخ** — repo حديث (commitان فقط):
  ```bash
  # احذف .git، أعد init، commit نظيف واحد، ثم force push
  rm -rf .git
  git init
  git add -A
  git commit -m "feat: establish QA security and CI/CD foundation for beta readiness"
  git remote add origin https://github.com/MonzerHussan/abc-constructions.git
  git push --force -u origin main
  ```

> ⚠️ **تنبيه:** بعد `--force` يجب إبلاغ كل المتعاونين بسحب الفرع من جديد (أو إعادة clone).
> ⚠️ **GitHub support:** يمكن طلب حذف الكاش المنظور عبر GitHub Support إذا لزم.
> ⚠️ **الأهم:** التدوير تم فعلاً (السر مُبطَل) — تنظيف التاريخ خطوة تنظيفية وليست أمنية حرجة.

## 6. التحقق بعد التنفيذ

```bash
# 1. لا سر في working tree
grep -r "LEAKED_PASSWORD" . --include="*.env*" 2>$null

# 2. لا سر في git history
git log -p --all | findstr /i "LEAKED_PASSWORD"

# 3. .env* غير متتبعة
git check-ignore .env .env.local
```
