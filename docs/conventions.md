# الاتفاقيات الهندسية

## التسمية
- الكلاسات والـ Modules بـ PascalCase.
- الدوال والمتغيرات بـ camelCase.
- الجداول بـ singular PascalCase في الـ Schema.
- الـ Routes بصيغة kebab-case (مثال: `/orders/:id/pickup/ping`).

## معمارية الـ Backend
- كل ميزة في Module مستقل تحت `apps/api/src/modules/<feature>`.
- داخل كل Module:
  - `*.module.ts` يعرّف الـ Module.
  - `*.controller.ts` للـ HTTP endpoints.
  - `*.service.ts` للمنطق التطبيقي.
  - `dto/` للـ Validation DTOs.
  - `services/` للخدمات الفرعية (Pricing, State Machine, etc).
- استخدام `class-validator` + `class-transformer` للـ DTOs.
- الأخطاء تُرفع بـ NestJS HttpExceptions مع `code` ثابت يستخدمه الـ Frontend.

## معمارية الـ Frontend
- كل ميزة في Flutter داخل `lib/features/<feature>/` مع تقسيم `screens/widgets/providers/data`.
- في Next.js نتبع نمط `app/` (Next 14 App Router) مع كومبوننتات قابلة لإعادة الاستخدام تحت `src/components`.

## الـ Migrations
- جميع تغييرات قاعدة البيانات تمر عبر Prisma Migrations.
- اسم الـ migration وصفي: `add_loyalty_tier_multiplier`.

## الكود الجيد
- لا ملفات بدون استخدام.
- لا تعليقات تُكرّر ما يفعله الكود.
- لا تعابير سحرية (magic numbers) - نستخدم ثوابت مُسمّاة.
- اختبارات وحدوية لأي منطق غير بديهي (Pricing, State Machine).

## الترجمة
- جميع نصوص الواجهة في ملفات الترجمة، لا نضع نصوصاً ثابتة داخل الكود.
- جميع الجداول التي تحتوي على نص للعميل تحوي `name` و `nameAr`.
