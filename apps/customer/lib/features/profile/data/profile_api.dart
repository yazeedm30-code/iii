import '../../../core/network/api_client.dart';
import '../domain/profile_models.dart';

class ProfileApi {
  ProfileApi(this._client);

  final ApiClient _client;

  Future<CustomerProfile> getProfile() {
    return _client.getJson<CustomerProfile>(
      '/me',
      decode: (data) => CustomerProfile.fromJson(data! as Map<String, dynamic>),
    );
  }

  Future<CustomerProfile> updateProfile({
    String? firstName,
    String? lastName,
    String? gender,
    String? preferredLocale,
    bool? marketingOptIn,
  }) {
    return _client.patchJson<CustomerProfile>(
      '/me',
      body: {
        if (firstName != null) 'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
        if (gender != null) 'gender': gender,
        if (preferredLocale != null) 'preferredLocale': preferredLocale,
        if (marketingOptIn != null) 'marketingOptIn': marketingOptIn,
      },
      decode: (data) => CustomerProfile.fromJson(data! as Map<String, dynamic>),
    );
  }

  Future<List<Vehicle>> listVehicles() {
    return _client.getJson<List<Vehicle>>(
      '/me/vehicles',
      decode: (data) {
        final list = data! as List<dynamic>;
        return list
            .map((v) => Vehicle.fromJson(v as Map<String, dynamic>))
            .toList(growable: false);
      },
    );
  }

  Future<Vehicle> addVehicle({
    required String make,
    String? model,
    required String color,
    required String plateNumber,
    String? plateLetters,
    bool isDefault = false,
  }) {
    return _client.postJson<Vehicle>(
      '/me/vehicles',
      body: {
        'make': make,
        if (model != null) 'model': model,
        'color': color,
        'plateNumber': plateNumber,
        if (plateLetters != null) 'plateLetters': plateLetters,
        'isDefault': isDefault,
      },
      decode: (data) => Vehicle.fromJson(data! as Map<String, dynamic>),
    );
  }

  Future<void> deleteVehicle(String id) => _client.deleteVoid('/me/vehicles/$id');
}
