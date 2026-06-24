# المساهمة

## الفرع
- جميع التغييرات تتم على فروع منفصلة عن `main`.
- اسم الفرع وصفي: `feature/loyalty-tiers` أو `fix/order-totals-rounding`.

## رسائل الـ Commit
نتبع نمط Conventional Commits:
- `feat: add referral bonus on first order`
- `fix(api): correct VAT calculation for modifiers`
- `chore(deps): bump nestjs to 10.4.7`

## قائمة المراجعة قبل الـ PR
- [ ] جميع الاختبارات تمر محلياً.
- [ ] لا تنبيهات من الـ linter.
- [ ] أيّ migration جديد مُختبَر على نسخة محلية.
- [ ] التوثيق محدَّث إذا تغيّر السلوك.

## مراجعة الكود
- نطلب موافقة مراجِع واحد على الأقل قبل الدمج.
- لا تدمج PR فيه نقاشات مفتوحة.
