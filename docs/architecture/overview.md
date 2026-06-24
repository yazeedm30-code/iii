# البنية المعمارية

نظرة عامة على البنية التقنية لمنصة الطلبات المسبقة والاستلام من السيارة.

## المكوّنات

```
                ┌──────────────────────┐
                │   Customer App        │  Flutter (iOS + Android)
                │   Employee App        │  Flutter
                │   Admin Dashboard     │  Next.js
                │   Merchant Dashboard  │  Next.js
                │   KDS                 │  Next.js
                │   Branch Display      │  Next.js
                └──────────┬───────────┘
                           │ HTTPS / WSS
                ┌──────────▼───────────┐
                │   NestJS API Gateway │
                │   REST + WebSocket   │
                └──────────┬───────────┘
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │
 ┌─────▼─────┐      ┌──────▼──────┐      ┌──────▼──────┐
 │ PostgreSQL │     │   Redis     │     │  S3 / MinIO │
 │ (Prisma)   │     │ Queue/Cache │     │   Assets    │
 └────────────┘     └─────────────┘     └─────────────┘
```

## الطبقات

### 1. الواجهات الأمامية
- **Customer App** و **Employee App**: تطبيقات Flutter من قاعدة كود واحدة، تستهدف iOS 13+ و Android 6.0+.
- **لوحات التحكم (Admin / Merchant)**: تطبيقات Next.js 14 (App Router) مع TanStack Query وSocket.IO.
- **KDS / Branch Display**: تطبيقات Next.js محسّنة للشاشات الكبيرة وتعمل بوضع Always On.

### 2. الـ Backend
- **NestJS 10**: بنية معيارية (Modules) مع Repository Pattern عبر Prisma.
- **Prisma ORM**: جميع الجداول والمؤشرات والقيود محددة في `apps/api/prisma/schema.prisma`.
- **WebSocket Gateway**: قناة `/realtime` تبث:
  - تحديثات الطلبات لكل من العميل والفرع و KDS.
  - إشعارات وصول العميل لخدمة Drive-Thru.
  - لوحة عرض الفرع.

### 3. الأمان
- JWT مع Access (15 د) + Refresh (30 يوم).
- جلسات قابلة للإلغاء مع كشف إعادة الاستخدام (refresh token reuse detection).
- Throttler عالمي مع Helmet و Rate-Limiting.
- Role-based guards (`UserKind`: CUSTOMER / EMPLOYEE / MERCHANT / ADMIN).
- مكان للـ 2FA (الحقول جاهزة في الـ Schema).

### 4. التكاملات
| التكامل | الوضع |
|---------|------|
| Apple Pay / Google Pay | seam جاهز عبر `PaymentProvider` |
| مدى | provider مستقل |
| STC Pay | provider مستقل |
| Stripe (CARD/GooglePay) | مكتمل ومُمَكّن باستخدام مفتاح البيئة |
| Foodics / Salla | يمكن إضافتها كـ providers خارجية |
| ZATCA E-Invoicing | الحقول جاهزة في جدول `Invoice` |
| Firebase | إعدادات الـ Push جاهزة |

## آلية الـ Drive-Thru

1. العميل يضع طلباً مع تحديد سيارته.
2. التطبيق يرسل GPS pings دورياً إلى `/orders/:id/pickup/ping`.
3. الـ Backend يحسب المسافة بدالة Haversine ويبث حدث `order:arrival` للفرع/KDS حين يدخل العميل ضمن `arrivalRadiusM`.
4. العميل يضغط زر "وصلت" → يرسل `/arrived` فيُعلَم الفرع وتبدأ نافذة التسليم.

## الاختبارات
- Backend: Jest (unit + integration). Endpoint `/health` يضمن جاهزية الخدمة وقاعدة البيانات.
- Frontend Web: TypeScript type-checking + ESLint.
- Customer App: `flutter analyze` + `flutter test`.

## النشر
- جميع التطبيقات تُحزَّم في صور Docker متعددة المراحل.
- النشر السحابي عبر `infra/docker/docker-compose.prod.yml` أو Kubernetes (مكان لإضافة manifests).
- GitHub Actions يقوم بـ lint/test/build على كل PR.
