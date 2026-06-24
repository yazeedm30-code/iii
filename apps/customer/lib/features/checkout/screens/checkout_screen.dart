import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String _method = 'APPLE_PAY';
  String _fulfillment = 'DRIVE_THRU';

  @override
  Widget build(BuildContext context) {
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
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton(
            onPressed: () => context.go('/orders/demo-order'),
            child: const Text('تأكيد الطلب'),
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
