import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/formatting/currency.dart';
import '../../../core/network/api_response.dart';
import '../../../core/widgets/async_value_view.dart';
import '../domain/order.dart';
import '../providers/orders_providers.dart';

class OrderTrackingScreen extends ConsumerStatefulWidget {
  const OrderTrackingScreen({super.key, required this.orderId});

  final String orderId;

  @override
  ConsumerState<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends ConsumerState<OrderTrackingScreen> {
  static const List<String> _steps = <String>[
    'PLACED',
    'ACCEPTED',
    'PREPARING',
    'READY',
    'HANDED_OVER',
  ];
  static const Map<String, String> _stepLabels = <String, String>{
    'PLACED': 'تم استلام الطلب',
    'ACCEPTED': 'تم القبول',
    'PREPARING': 'جاري التحضير',
    'READY': 'جاهز للاستلام',
    'HANDED_OVER': 'تم التسليم',
  };

  Timer? _poll;
  bool _arriving = false;

  @override
  void initState() {
    super.initState();
    _poll = Timer.periodic(const Duration(seconds: 5), (_) {
      ref.invalidate(orderByIdProvider(widget.orderId));
    });
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  Future<void> _markArrived() async {
    setState(() => _arriving = true);
    try {
      await ref.read(ordersApiProvider).markArrived(widget.orderId);
      ref.invalidate(orderByIdProvider(widget.orderId));
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم إعلام الفرع بوصولك')),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _arriving = false);
    }
  }

  int _currentStepIndex(String status) {
    final idx = _steps.indexOf(status);
    return idx < 0 ? 0 : idx;
  }

  @override
  Widget build(BuildContext context) {
    final orderAsync = ref.watch(orderByIdProvider(widget.orderId));
    return Scaffold(
      appBar: AppBar(title: const Text('تتبع الطلب')),
      body: AsyncValueView<CustomerOrder>(
        value: orderAsync,
        onRetry: () => ref.invalidate(orderByIdProvider(widget.orderId)),
        data: (order) {
          final currentIndex = _currentStepIndex(order.status);
          final isCancelled = order.status == 'CANCELLED';
          return ListView(
            padding: const EdgeInsets.all(16),
            children: <Widget>[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          Expanded(child: Text('طلب #${order.number}')),
                          Text(formatCurrency(order.totalAmount),
                              style: Theme.of(context).textTheme.titleMedium),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        order.fulfillment == 'DRIVE_THRU'
                            ? 'استلام من السيارة'
                            : 'استلام داخلي',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      if (order.pickupCode != null) ...<Widget>[
                        const Divider(height: 24),
                        const Text('رمز الاستلام'),
                        const SizedBox(height: 8),
                        Text(
                          order.pickupCode!,
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                letterSpacing: 8,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: Column(
                    children: _steps.map((step) {
                      final idx = _steps.indexOf(step);
                      final done = !isCancelled && idx <= currentIndex;
                      return ListTile(
                        leading: Icon(
                          done ? Icons.check_circle : Icons.radio_button_unchecked,
                          color: done ? Theme.of(context).colorScheme.primary : null,
                        ),
                        title: Text(_stepLabels[step] ?? step),
                      );
                    }).toList(),
                  ),
                ),
              ),
              if (isCancelled)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Card(
                    child: ListTile(
                      leading: Icon(Icons.cancel_outlined, color: Colors.redAccent),
                      title: Text('تم إلغاء الطلب'),
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              if (order.fulfillment == 'DRIVE_THRU' &&
                  order.customerArrivedAt == null &&
                  order.status != 'HANDED_OVER' &&
                  !isCancelled)
                FilledButton.icon(
                  onPressed: _arriving ? null : _markArrived,
                  icon: const Icon(Icons.directions_car_filled_outlined),
                  label: Text(_arriving ? 'جاري الإرسال...' : 'وصلت للموقع'),
                ),
              if (order.customerArrivedAt != null)
                Card(
                  child: ListTile(
                    leading: Icon(Icons.location_on,
                        color: Theme.of(context).colorScheme.primary),
                    title: const Text('تم إعلام الفرع بوصولك'),
                    subtitle: Text(
                      order.customerArrivedAt!.toLocal().toString().substring(0, 19),
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              const Text('عناصر الطلب',
                  style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              for (final item in order.items)
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.local_cafe),
                    title: Text(item.nameAr),
                    subtitle: item.modifiers.isEmpty
                        ? null
                        : Text(item.modifiers
                            .map((m) =>
                                (m as Map<String, dynamic>)['nameAr']?.toString() ?? '')
                            .where((s) => s.isNotEmpty)
                            .join(' · ')),
                    trailing: Text(
                      '×${item.quantity}  ${formatCurrency(item.lineTotal)}',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
