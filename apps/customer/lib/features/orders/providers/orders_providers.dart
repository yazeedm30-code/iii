import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../data/orders_api.dart';
import '../domain/order.dart';

final Provider<OrdersApi> ordersApiProvider =
    Provider<OrdersApi>((ref) => OrdersApi(ref.watch(apiClientProvider)));

final FutureProvider<List<CustomerOrder>> customerOrdersProvider =
    FutureProvider<List<CustomerOrder>>((ref) => ref.watch(ordersApiProvider).list());

final FutureProviderFamily<CustomerOrder, String> orderByIdProvider =
    FutureProvider.family<CustomerOrder, String>((ref, orderId) {
  return ref.watch(ordersApiProvider).getById(orderId);
});
