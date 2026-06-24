import '../../../core/network/api_client.dart';
import '../../cart/domain/cart_models.dart';
import '../domain/order.dart';

class OrdersApi {
  OrdersApi(this._client);

  final ApiClient _client;

  Future<CustomerOrder> create({
    required String branchId,
    required String fulfillment,
    required List<CartLine> lines,
    String? vehicleId,
    String? notes,
    String? couponCode,
    int? pointsToRedeem,
  }) {
    final body = <String, dynamic>{
      'branchId': branchId,
      'fulfillment': fulfillment,
      if (vehicleId != null) 'vehicleId': vehicleId,
      if (notes != null && notes.isNotEmpty) 'notes': notes,
      if (couponCode != null && couponCode.isNotEmpty) 'couponCode': couponCode,
      if (pointsToRedeem != null && pointsToRedeem > 0) 'pointsToRedeem': pointsToRedeem,
      'items': lines
          .map((line) => <String, dynamic>{
                'productId': line.product.id,
                'quantity': line.quantity,
                if (line.modifierOptions.isNotEmpty)
                  'modifierOptionIds': line.modifierOptions.map((m) => m.id).toList(),
                if (line.notes != null && line.notes!.isNotEmpty) 'notes': line.notes,
              })
          .toList(),
    };
    return _client.postJson<CustomerOrder>(
      '/orders',
      body: body,
      decode: (data) => CustomerOrder.fromJson(data! as Map<String, dynamic>),
    );
  }

  Future<List<CustomerOrder>> list() {
    return _client.getJson<List<CustomerOrder>>(
      '/orders',
      decode: (data) {
        final map = data! as Map<String, dynamic>;
        final items = map['items'] as List<dynamic>;
        return items
            .map((o) => CustomerOrder.fromJson(o as Map<String, dynamic>))
            .toList(growable: false);
      },
    );
  }

  Future<CustomerOrder> getById(String orderId) {
    return _client.getJson<CustomerOrder>(
      '/orders/$orderId',
      decode: (data) => CustomerOrder.fromJson(data! as Map<String, dynamic>),
    );
  }

  Future<Map<String, dynamic>> sendArrivalPing(
    String orderId, {
    required double latitude,
    required double longitude,
    String source = 'GPS',
  }) {
    return _client.postJson<Map<String, dynamic>>(
      '/orders/$orderId/pickup/ping',
      body: {'latitude': latitude, 'longitude': longitude, 'source': source},
      decode: (data) => Map<String, dynamic>.from(data! as Map),
    );
  }

  Future<Map<String, dynamic>> markArrived(String orderId) {
    return _client.postJson<Map<String, dynamic>>(
      '/orders/$orderId/pickup/arrived',
      decode: (data) => Map<String, dynamic>.from(data! as Map),
    );
  }
}
