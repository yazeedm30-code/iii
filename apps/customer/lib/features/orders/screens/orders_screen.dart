import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/formatting/currency.dart';
import '../../../core/widgets/async_value_view.dart';
import '../domain/order.dart';
import '../providers/orders_providers.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  static const Map<String, String> _statusLabels = <String, String>{
    'PLACED': 'تم استلام الطلب',
    'ACCEPTED': 'تم القبول',
    'PREPARING': 'جاري التحضير',
    'READY': 'جاهز للاستلام',
    'HANDED_OVER': 'تم التسليم',
    'CANCELLED': 'ملغي',
    'REFUNDED': 'مُسترد',
  };

  static const Map<String, Color> _statusColors = <String, Color>{
    'PLACED': Color(0xFFF59E0B),
    'ACCEPTED': Color(0xFF0EA5E9),
    'PREPARING': Color(0xFFF97316),
    'READY': Color(0xFF16A34A),
    'HANDED_OVER': Color(0xFF6B7280),
    'CANCELLED': Color(0xFFDC2626),
    'REFUNDED': Color(0xFF6B7280),
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(customerOrdersProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('طلباتي'),
        actions: <Widget>[
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(customerOrdersProvider),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(customerOrdersProvider);
          await ref.read(customerOrdersProvider.future);
        },
        child: AsyncValueView<List<CustomerOrder>>(
          value: orders,
          onRetry: () => ref.invalidate(customerOrdersProvider),
          data: (items) {
            if (items.isEmpty) {
              return const Center(child: Text('لم تقم بأي طلب بعد'));
            }
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) {
                final order = items[i];
                final color = _statusColors[order.status] ?? Colors.grey;
                return Card(
                  child: ListTile(
                    title: Text('طلب رقم #${order.number}'),
                    subtitle: Text(
                      '${_statusLabels[order.status] ?? order.status} · ${formatCurrency(order.totalAmount)}',
                    ),
                    leading: CircleAvatar(
                      backgroundColor: color.withOpacity(0.15),
                      child: Icon(Icons.receipt_long, color: color, size: 20),
                    ),
                    trailing: const Icon(Icons.chevron_left),
                    onTap: () => context.push('/orders/${order.id}'),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
