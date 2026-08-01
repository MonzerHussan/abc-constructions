# ADR-003: Service Layer — No Repository Pattern (Yet)

## التاريخ
2026-07-30

## الحالة
معتمد

## السياق
هيكل الوصول للبيانات يحتاج تحديداً واضحاً. الخيارات:
1. **Controller → Repository → Prisma** — طبقة Repository مجردة فوق Prisma
2. **Controller → Service → Prisma** — Service يستخدم Prisma مباشرة
3. **Controller → Service → Repository → Prisma** — كامل الطبقات

## القرار
اعتمدنا الخيار **2: Controller (Route) → Service → Prisma** مباشرة.

الأسباب:
- Prisma نفسه ORM حديث مع Data Access Layer قوي (findUnique, findMany, create, update, upsert)
- إضافة Repository في البداية = كتابة آلاف الأسطر لتمرير البيانات فقط (مثال: `Repository.findById()` → `return prisma.findUnique()`)
- Repository Pattern مفيد عندما: أكثر من DB، أكثر من ORM، Offline Storage. لا يوجد أي من هذه الحالات حالياً
- يمكن إضافة Repository لاحقاً دون تغيير الـ Service Interface (عبر Facade Pattern)

## متى نضيف Repository
عند ظهور أحد هذه الاحتياجات:
- دعم أكثر من Database
- استخدام أكثر من ORM (Prisma + Drizzle مثلاً)
- Offline First (PouchDB/CouchDB محلياً)
- Unit Testing يتطلب Mocking كامل للـ Data Layer (حالياً نستخدم Integration Testing مع DB حقيقي)

## النتائج
- **إيجابي:** تقليل كبير في كمية الكود، تسريع التطوير، تقليل التعقيد
- **سلبي:** لا عزل كامل للـ ORM (لكن هذا مقبول حالياً)
- **محايد:** Prisma يسمح بالتبديل بين SQLite, PostgreSQL, MySQL دون تغيير كود

## بدائل مستقبلية
- ADR جديد لإضافة Repository Pattern عند ظهور أحد الاحتياجات المذكورة أعلاه
