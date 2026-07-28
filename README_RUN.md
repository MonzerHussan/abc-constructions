# ============================================
# دليل تشغيل منصة ABC - All About Constructions
# ============================================

## =====================
## الخطوة 1: تثبيت PostgreSQL
## =====================

# 1. افتح المتصفح وروح للرابط:
#    https://www.postgresql.org/download/windows/

# 2. اضغط "Download the installer"

# 3. افتح الملف المحمل واتبع الخطوات:
#    - اضغط Next في كل الخطوات
#    - عند السؤال عن كلمة المرور:
#      ✍️ اكتب كلمة مرور واحفظها (مثلاً: postgres123)
#    - اضغط Install

# 4. بعد التثبيت، افتح pgAdmin من قائمة Start

## =====================
## الخطوة 2: إنشاء قاعدة البيانات
## =====================

# في pgAdmin:
# 1. اضغط على "Servers" في اليسار
# 2. اضغط على "PostgreSQL" (السيرفر)
# 3. اضغط كليك يمين على "Databases"
# 4. اختر "Create" > "Databases"
# 5. اكتب الاسم: abc_constructions
# 6. اضغط Save

## =====================
## الخطوة 3: تحديث ملف .env
## =====================

# افتح الملف: tender-market\.env
# وعّل DATABASE_URL بكلمة المرور التي اخترتها:

# DATABASE_URL="postgresql://postgres:كلمة_المرور_التي_اخترتها@localhost:5432/abc_constructions"

# مثال:
# DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/abc_constructions"

## =====================
## الخطوة 4: تطبيق التغييرات على قاعدة البيانات
## =====================

# افتح Terminal (سطر أوامر) وروّح لمشروع tender-market:
# cd "C:\Users\HP\OneDrive\Documents\ABC\tender-market"

# ثم اكتب:
npx prisma migrate dev --name init

# هذا سيقوم بإنشاء جميع الجداول في قاعدة البيانات

## =====================
## الخطوة 5: تشغيل المشروع
## =====================

# اكتب في Terminal:
npm run dev

# سيرد عليك بشي مثل:
# ▲ Next.js 16.x
# - Local: http://localhost:3000

# افتح المتصفح واكتب:
# http://localhost:3000

## =====================
## الخطوة 6: تسجيل حساب جديد
## =====================

# 1. اضغط "إنشاء حساب" في الأعلى
# 2. اختر نوع حسابك (مقاول، مورد، مالك مشروع...)
# 3. اكتب بياناتك
# 4. اضغط "إنشاء الحساب"

## =====================
## الخطوة 7: استكشاف المنصة
## =====================

# 🏗️ مناقصات المشاريع:  http://localhost:3000/tenders/projects
# 📦 مناقصات المواد:     http://localhost:3000/tenders/materials
# 🛒 سوق البضائع:       http://localhost:3000/marketplace
# 🏢 عرض المشاريع:      http://localhost:3000/projects
# 💼 التوظيف:            http://localhost:3000/jobs
# 👥 مجتمع الإنشاءات:   http://localhost:3000/community

## =====================
## أوامر مهمة
## =====================

# تشغيل المشروع:
npm run dev

# إيقاف المشروع:
# اضغط Ctrl + C في Terminal

# بناء المشروع للإنتاج:
npm run build

# بدء التشغيل في الإنتاج:
npm start
