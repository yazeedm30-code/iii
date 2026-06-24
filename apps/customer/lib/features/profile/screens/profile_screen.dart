import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/localization/locale_controller.dart';
import '../../../core/network/api_response.dart';
import '../../../core/widgets/async_value_view.dart';
import '../../auth/providers/auth_providers.dart';
import '../domain/profile_models.dart';
import '../providers/profile_providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(customerProfileProvider);
    final locale = ref.watch(localeControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('حسابي')),
      body: AsyncValueView<CustomerProfile>(
        value: profileAsync,
        onRetry: () => ref.invalidate(customerProfileProvider),
        data: (profile) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(customerProfileProvider);
            ref.invalidate(customerVehiclesProvider);
            await ref.read(customerProfileProvider.future);
          },
          child: ListView(
            children: <Widget>[
              ListTile(
                leading: CircleAvatar(
                  backgroundImage:
                      profile.avatarUrl == null ? null : NetworkImage(profile.avatarUrl!),
                  child: profile.avatarUrl == null ? const Icon(Icons.person) : null,
                ),
                title: Text(profile.firstName +
                    (profile.lastName == null ? '' : ' ${profile.lastName}')),
                subtitle: Text('رمز الإحالة: ${profile.referralCode}'),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.workspace_premium_outlined),
                title: const Text('نقاط الولاء'),
                trailing: Text('${profile.pointsBalance}'),
                onTap: () => context.push('/loyalty'),
              ),
              ListTile(
                leading: const Icon(Icons.directions_car_outlined),
                title: const Text('سياراتي'),
                onTap: () => _openVehicles(context, ref),
              ),
              ListTile(
                leading: const Icon(Icons.location_on_outlined),
                title: const Text('عناويني'),
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
                onTap: () => ref
                    .read(localeControllerProvider.notifier)
                    .switchTo(locale.languageCode == 'ar' ? 'en' : 'ar'),
              ),
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.redAccent),
                title:
                    const Text('تسجيل خروج', style: TextStyle(color: Colors.redAccent)),
                onTap: () => ref.read(authControllerProvider.notifier).logout(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _openVehicles(BuildContext context, WidgetRef ref) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _VehiclesSheet(),
    );
  }
}

class _VehiclesSheet extends ConsumerWidget {
  const _VehiclesSheet();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final vehicles = ref.watch(customerVehiclesProvider);
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: ConstrainedBox(
          constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              const Padding(
                padding: EdgeInsets.all(16),
                child: Text('سياراتي',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
              ),
              Expanded(
                child: AsyncValueView<List<Vehicle>>(
                  value: vehicles,
                  onRetry: () => ref.invalidate(customerVehiclesProvider),
                  data: (list) {
                    if (list.isEmpty) {
                      return const Center(child: Text('لم تضف سيارات بعد'));
                    }
                    return ListView(
                      children: list
                          .map((v) => ListTile(
                                leading: const Icon(Icons.directions_car),
                                title: Text(
                                    '${v.make} ${v.model ?? ''} · ${v.color}'),
                                subtitle: Text('لوحة: ${v.plateNumber}'),
                                trailing: v.isDefault
                                    ? const Icon(Icons.star, color: Colors.amber)
                                    : null,
                              ))
                          .toList(),
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: FilledButton.icon(
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة سيارة'),
                  onPressed: () async {
                    await showDialog<void>(
                      context: context,
                      builder: (_) => const _AddVehicleDialog(),
                    );
                    ref.invalidate(customerVehiclesProvider);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AddVehicleDialog extends ConsumerStatefulWidget {
  const _AddVehicleDialog();

  @override
  ConsumerState<_AddVehicleDialog> createState() => _AddVehicleDialogState();
}

class _AddVehicleDialogState extends ConsumerState<_AddVehicleDialog> {
  final _make = TextEditingController();
  final _model = TextEditingController();
  final _color = TextEditingController();
  final _plate = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _make.dispose();
    _model.dispose();
    _color.dispose();
    _plate.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _submitting = true);
    try {
      await ref.read(profileApiProvider).addVehicle(
            make: _make.text.trim(),
            model: _model.text.trim().isEmpty ? null : _model.text.trim(),
            color: _color.text.trim(),
            plateNumber: _plate.text.trim(),
          );
      if (!mounted) return;
      Navigator.of(context).pop();
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('إضافة سيارة'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            TextField(controller: _make, decoration: const InputDecoration(labelText: 'النوع')),
            TextField(controller: _model, decoration: const InputDecoration(labelText: 'الموديل')),
            TextField(controller: _color, decoration: const InputDecoration(labelText: 'اللون')),
            TextField(controller: _plate, decoration: const InputDecoration(labelText: 'رقم اللوحة')),
          ],
        ),
      ),
      actions: <Widget>[
        TextButton(
          onPressed: _submitting ? null : () => Navigator.of(context).pop(),
          child: const Text('إلغاء'),
        ),
        FilledButton(
          onPressed: _submitting ? null : _save,
          child: _submitting
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : const Text('حفظ'),
        ),
      ],
    );
  }
}
