# Customer App

تطبيق العميل (Flutter) — يدعم iOS و Android من قاعدة كود واحدة.

## التشغيل

```bash
flutter pub get
flutter run --dart-define=API_BASE_URL=http://localhost:3000/api/v1
```

## البنية

- `lib/core/` — البنية المشتركة (الثيم، الراوتر، الشبكة، الترجمة).
- `lib/features/` — كل ميزة في فولدر مستقل (auth, branches, menu, cart, checkout, orders, loyalty, profile).
- `lib/main.dart` — نقطة الدخول.

## تشغيل code generation

```bash
dart run build_runner build --delete-conflicting-outputs
```

## نشر

- يستهدف Flutter ≥ 3.19.
- المنصات: iOS 13+, Android 6.0+.
- اللغات: العربية (RTL) والإنجليزية (LTR).
- الثيمات: نهاري وليلي.
