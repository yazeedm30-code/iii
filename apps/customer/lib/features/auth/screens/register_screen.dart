import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_response.dart';
import '../providers/auth_providers.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final TextEditingController _firstName = TextEditingController();
  final TextEditingController _lastName = TextEditingController();
  final TextEditingController _referral = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  bool _submitting = false;

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _referral.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_formKey.currentState?.validate() != true) return;
    setState(() => _submitting = true);
    try {
      await ref.read(authControllerProvider.notifier).completeRegistration(
            firstName: _firstName.text.trim(),
            lastName: _lastName.text.trim().isEmpty ? null : _lastName.text.trim(),
            referralCode: _referral.text.trim().isEmpty ? null : _referral.text.trim(),
            preferredLocale: 'AR',
          );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('استكمال الحساب')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                TextFormField(
                  controller: _firstName,
                  decoration: const InputDecoration(labelText: 'الاسم الأول'),
                  enabled: !_submitting,
                  validator: (v) => (v?.trim().isEmpty ?? true) ? 'الاسم مطلوب' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _lastName,
                  decoration: const InputDecoration(labelText: 'الاسم الأخير'),
                  enabled: !_submitting,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _referral,
                  decoration: const InputDecoration(labelText: 'رمز الإحالة (اختياري)'),
                  enabled: !_submitting,
                ),
                const Spacer(),
                FilledButton(
                  onPressed: _submitting ? null : _submit,
                  child: _submitting
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('متابعة'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
