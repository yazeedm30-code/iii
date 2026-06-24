import '../../../core/network/api_client.dart';
import '../domain/menu_models.dart';

class MenuApi {
  MenuApi(this._client);

  final ApiClient _client;

  Future<MenuPayload> getMenu(String branchId, {String? search}) {
    return _client.getJson<MenuPayload>(
      '/branches/$branchId/menu',
      query: {if (search != null && search.isNotEmpty) 'search': search},
      requireAuth: false,
      decode: (data) => MenuPayload.fromJson(data! as Map<String, dynamic>),
    );
  }

  Future<MenuProduct> getProduct(String branchId, String productId) {
    return _client.getJson<MenuProduct>(
      '/branches/$branchId/products/$productId',
      requireAuth: false,
      decode: (data) => MenuProduct.fromJson(data! as Map<String, dynamic>),
    );
  }
}
