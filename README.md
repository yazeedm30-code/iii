# Drive-Thru & Pickup Platform

منصة متكاملة للطلبات المسبقة والاستلام من السيارة، مصممة لخدمة الكافيهات والمطاعم في المملكة العربية السعودية ومنطقة الخليج.

## البنية

هذا المستودع مُنظّم كـ **Monorepo** ويضم التطبيقات والخدمات التالية:

```
.
├── apps/
│   ├── api/               # NestJS Backend (REST + WebSocket + Workers)
│   ├── customer/          # Flutter Mobile App (iOS + Android)
│   ├── employee/          # Flutter Mobile App للموظفين
│   ├── admin/             # Next.js لوحة تحكم الإدارة العامة
│   ├── merchant/          # Next.js لوحة تحكم أصحاب الفروع
│   ├── kds/               # Next.js شاشة المطبخ Kitchen Display System
│   └── branch-display/    # Next.js شاشة عرض حالة الطلبات داخل الفرع
├── packages/
│   ├── api-contracts/     # OpenAPI specs & shared types
│   └── design-tokens/     # ألوان وخطوط وقيم التصميم المشتركة
├── infra/
│   ├── docker/            # ملفات Docker و docker-compose
│   ├── k8s/               # ملفات Kubernetes للنشر السحابي
│   └── terraform/         # IaC للبنية التحتية
└── docs/                  # التوثيق المعماري والـ ADRs
```

## التقنيات

| المكوّن | التقنية |
|---------|---------|
| Backend API | NestJS 10, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Realtime | Socket.IO + Redis Adapter |
| Cache & Queue | Redis 7, BullMQ |
| Mobile | Flutter 3.x, Riverpod |
| Dashboards | Next.js 14, React, TanStack Query, TailwindCSS |
| Infrastructure | Docker, Kubernetes, GitHub Actions CI/CD |
| Observability | OpenTelemetry, Prometheus, Grafana |

## المتطلبات

- Node.js ≥ 20
- pnpm ≥ 9
- Docker ≥ 24
- Flutter ≥ 3.19 (لتطبيقات الجوال)

## التشغيل السريع

```bash
# تثبيت الاعتمادات
pnpm install

# تشغيل قاعدة البيانات و Redis محلياً
docker compose -f infra/docker/docker-compose.dev.yml up -d

# تطبيق هجرات قاعدة البيانات
pnpm --filter @platform/api prisma:migrate

# تشغيل الـ Backend
pnpm --filter @platform/api dev

# تشغيل لوحة الإدارة
pnpm --filter @platform/admin dev

# تشغيل KDS
pnpm --filter @platform/kds dev
```

لتشغيل تطبيق العميل:

```bash
cd apps/customer
flutter pub get
flutter run
```

## التطوير

- جميع التغييرات تمر عبر Pull Requests.
- التوثيق المعماري في `docs/architecture/`.
- اتفاقيات الكود في `docs/conventions.md`.
- سياسة الأمان في `SECURITY.md`.

## الترخيص

Proprietary. جميع الحقوق محفوظة.
