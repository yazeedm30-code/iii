import '../../../core/network/api_client.dart';
import '../domain/loyalty_models.dart';

class LoyaltyApi {
  LoyaltyApi(this._client);

  final ApiClient _client;

  Future<LoyaltyOverview> overview() {
    return _client.getJson<LoyaltyOverview>(
      '/loyalty/overview',
      decode: (data) => LoyaltyOverview.fromJson(data! as Map<String, dynamic>),
    );
  }
}
