import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/localization/locale_controller.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeControllerProvider);
    final controller = ref.read(localeControllerProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: const Text('حسابي')),
      body: ListView(
        children: <Widget>[
          const ListTile(
            leading: CircleAvatar(child: Icon(Icons.person)),
            title: Text('اسم المستخدم'),
            subtitle: Text('+966555000111'),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.location_on_outlined),
            title: const Text('عناويني'),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.directions_car_outlined),
            title: const Text('سياراتي'),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.favorite_outline),
            title: const Text('المفضلة'),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.notifications_outlined),
            title: const Text('الإشعارات'),
            onTap: () {},
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.language),
            title: const Text('اللغة'),
            trailing: Text(locale.languageCode == 'ar' ? 'العربية' : 'English'),
            onTap: () => controller.switchTo(locale.languageCode == 'ar' ? 'en' : 'ar'),
          ),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.redAccent),
            title: const Text('تسجيل خروج', style: TextStyle(color: Colors.redAccent)),
            onTap: () {},
          ),
        ],
      ),
    );
  }
}
