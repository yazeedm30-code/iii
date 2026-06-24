import '../../../core/network/api_client.dart';
import '../domain/branch.dart';

class BranchesApi {
  BranchesApi(this._client);

  final ApiClient _client;

  Future<List<Branch>> list({double? latitude, double? longitude, String? cityId}) {
    return _client.getJson<List<Branch>>(
      '/branches',
      query: {
        if (latitude != null) 'latitude': latitude,
        if (longitude != null) 'longitude': longitude,
        if (cityId != null) 'cityId': cityId,
        'pageSize': 50,
      },
      requireAuth: false,
      decode: (data) {
        final map = data! as Map<String, dynamic>;
        final items = map['items'] as List<dynamic>;
        return items
            .map((item) => Branch.fromJson(item as Map<String, dynamic>))
            .toList(growable: false);
      },
    );
  }
}
