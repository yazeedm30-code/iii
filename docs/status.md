# حالة المشروع - الإصدار الأولي

هذا الإصدار يضع الأساس المعماري ويغطي القلب الوظيفي للمنصة. الجداول التالية توضّح ما هو جاهز للتطوير الفوري وما يحتاج عمل لاحق.

## ما هو مكتمل

| النطاق | الحالة |
|--------|--------|
| Monorepo + pnpm workspaces | ✅ |
| Prisma Schema شامل (32 model) | ✅ |
| Backend Core (NestJS, Pino, Helmet, Throttler, Swagger) | ✅ |
| Auth (OTP / Apple / Google / JWT + Refresh) | ✅ |
| Catalog, Branches, Cities, Cart Pricing | ✅ |
| Orders + State Machine + Loyalty accrual | ✅ |
| Payments (Stripe, Apple Pay, Mada, STC Pay) - integration seams | ✅ |
| Pickup / Drive-Thru (GPS pings + Geofence) | ✅ |
| Realtime WebSocket Gateway | ✅ |
| Reports (sales / hourly / top products / branches) | ✅ |
| Employees (shifts + queue + order transitions) | ✅ |
| Admin module (merchants/branches/products/categories/coupons) | ✅ |
| Customer App (Flutter) - 11 شاشة | ✅ |
| Admin Dashboard (Next.js) - shell + dashboard | ✅ |
| KDS (Next.js) - real-time tickets shell | ✅ |
| Branch Display (Next.js) - board shell | ✅ |
| Merchant Dashboard - home shell | ✅ |
| Docker + CI (GitHub Actions) | ✅ |
| تقنية وحدوية للـ State Machine و Geo utils | ✅ |
| رفع صور المنتجات والتصنيفات وشعار التاجر (Local FS dev / S3 prod) | ✅ |

## ما يحتاج عمل قبل الإطلاق التجاري

### Backend
- ZATCA E-Invoicing: ربط فعلي مع API الزكاة وتوقيع XAdES.
- Payment providers: إكمال الـ webhooks وحماية التوقيع.
- Apple/Google identity tokens: تفعيل التحقق الكامل عبر JWKS.
- Push: تفعيل Firebase Admin Messaging كاملاً.
- BullMQ Workers لـ: تجديد النقاط، انتهاء الكوبونات، إرسال الفواتير.
- اختبارات تكامل end-to-end شاملة لمسار الطلب.

### Customer App
- ربط الشاشات بـ Dio API client (حالياً mocks).
- شاشة الخريطة (Google Maps + Geolocator).
- تكامل Sign in with Apple وGoogle Sign-In الفعلي.
- Firebase Messaging لاستقبال الـ Push.
- Localization JSON كامل (حالياً نصوص inline).

### Dashboards
- صفحات إدارة كاملة (CRUD) لكل مورد في لوحة الإدارة.
- ربط WebSocket في KDS بالـ Backend الفعلي.
- شاشات تسجيل دخول للوحات.
- Charts للتقارير عبر Recharts.

### DevOps
- Kubernetes manifests / Helm chart.
- Observability (OpenTelemetry, Prometheus, Grafana).
- Secrets management (Vault / AWS Secrets Manager).
- Image scanning في الـ CI.

## الترخيص
Proprietary. جميع الحقوق محفوظة.
