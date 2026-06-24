import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/formatting/currency.dart';
import '../../../core/network/api_response.dart';
import '../../cart/providers/cart_providers.dart';
import '../../orders/providers/orders_providers.dart';
import '../../profile/providers/profile_providers.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  String _fulfillment = 'DRIVE_THRU';
  String _method = 'APPLE_PAY';
  String? _vehicleId;
  bool _submitting = false;
  final TextEditingController _coupon = TextEditingController();

  @override
  void dispose() {
    _coupon.dispose();
    super.dispose();
  }

  Future<void> _placeOrder() async {
    final cart = ref.read(cartControllerProvider);
    if (cart.isEmpty || cart.branchId == null) return;
    setState(() => _submitting = true);
    try {
      final order = await ref.read(ordersApiProvider).create(
            branchId: cart.branchId!,
            fulfillment: _fulfillment,
            vehicleId: _vehicleId,
            lines: cart.lines,
            couponCode: _coupon.text.trim().isEmpty ? null : _coupon.text.trim(),
          );
      ref.read(cartControllerProvider.notifier).clear();
      ref.invalidate(customerOrdersProvider);
      if (!mounted) return;
      context.go('/orders/${order.id}');
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartControllerProvider);
    final vehicles = ref.watch(customerVehiclesProvider);
    final tax = cart.subtotal * 0.15;
    final total = cart.subtotal + tax;

    return Scaffold(
      appBar: AppBar(title: const Text('الدفع')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          Text('طريقة الاستلام', style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: 8),
          SegmentedButton<String>(
            segments: const <ButtonSegment<String>>[
              ButtonSegment<String>(value: 'DRIVE_THRU', label: Text('من السيارة')),
              ButtonSegment<String>(value: 'PICKUP', label: Text('استلام داخلي')),
            ],
            selected: <String>{_fulfillment},
            onSelectionChanged: (sel) => setState(() => _fulfillment = sel.first),
          ),
          if (_fulfillment == 'DRIVE_THRU') ...<Widget>[
            const SizedBox(height: 16),
            Text('السيارة', style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 8),
            vehicles.when(
              data: (list) {
                if (list.isEmpty) {
                  return Card(
                    child: ListTile(
                      leading: const Icon(Icons.add),
                      title: const Text('أضف سيارة من ملفك الشخصي'),
                      onTap: () => context.push('/profile'),
                    ),
                  );
                }
                return Column(
                  children: list
                      .map((v) => Card(
                            child: RadioListTile<String>(
                              value: v.id,
                              groupValue: _vehicleId ??
                                  (list.firstWhere(
                                    (e) => e.isDefault,
                                    orElse: () => list.first,
                                  )).id,
                              onChanged: (val) => setState(() => _vehicleId = val),
                              title: Text('${v.make} ${v.model ?? ''} - ${v.color}'),
                              subtitle: Text('لوحة: ${v.plateNumber}'),
                            ),
                          ))
                      .toList(),
                );
              },
              loading: () =>
                  const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator())),
              error: (_, __) => const Text('تعذّر تحميل السيارات'),
            ),
          ],
          const SizedBox(height: 24),
          Text('طريقة الدفع', style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: 8),
          _PaymentTile(
            value: 'APPLE_PAY',
            groupValue: _method,
            title: 'Apple Pay',
            icon: Icons.apple,
            onSelect: (v) => setState(() => _method = v),
          ),
          _PaymentTile(
            value: 'MADA',
            groupValue: _method,
            title: 'مدى',
            icon: Icons.credit_card,
            onSelect: (v) => setState(() => _method = v),
          ),
          _PaymentTile(
            value: 'STC_PAY',
            groupValue: _method,
            title: 'STC Pay',
            icon: Icons.account_balance_wallet_outlined,
            onSelect: (v) => setState(() => _method = v),
          ),
          _PaymentTile(
            value: 'CARD',
            groupValue: _method,
            title: 'بطاقة بنكية',
            icon: Icons.credit_card_outlined,
            onSelect: (v) => setState(() => _method = v),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _coupon,
            decoration: const InputDecoration(labelText: 'رمز كوبون (اختياري)'),
          ),
          const SizedBox(height: 16),
          const Divider(),
          _SummaryRow(label: 'المجموع', value: formatCurrency(cart.subtotal)),
          _SummaryRow(label: 'الضريبة', value: formatCurrency(tax)),
          const SizedBox(height: 8),
          _SummaryRow(label: 'الإجمالي', value: formatCurrency(total), isTotal: true),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton(
            onPressed: cart.isEmpty || _submitting ? null : _placeOrder,
            child: _submitting
                ? const SizedBox(
                    height: 18,
                    width: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : Text('تأكيد الطلب · ${formatCurrency(total)}'),
          ),
        ),
      ),
    );
  }
}

class _PaymentTile extends StatelessWidget {
  const _PaymentTile({
    required this.value,
    required this.groupValue,
    required this.title,
    required this.icon,
    required this.onSelect,
  });

  final String value;
  final String groupValue;
  final String title;
  final IconData icon;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    final bool selected = value == groupValue;
    return Card(
      child: ListTile(
        leading: Icon(icon),
        title: Text(title),
        trailing: Icon(selected ? Icons.check_circle : Icons.radio_button_unchecked),
        onTap: () => onSelect(value),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value, this.isTotal = false});

  final String label;
  final String value;
  final bool isTotal;

  @override
  Widget build(BuildContext context) {
    final style = isTotal
        ? Theme.of(context).textTheme.titleMedium
        : Theme.of(context).textTheme.bodyMedium;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[Text(label, style: style), Text(value, style: style)],
      ),
    );
  }
}
