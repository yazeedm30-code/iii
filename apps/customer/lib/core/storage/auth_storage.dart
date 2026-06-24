import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthStorage {
  AuthStorage(this._storage);

  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userIdKey = 'user_id';
  static const String _profileCompleteKey = 'profile_complete';

  final FlutterSecureStorage _storage;

  Future<String?> readAccessToken() => _storage.read(key: _accessTokenKey);
  Future<String?> readRefreshToken() => _storage.read(key: _refreshTokenKey);
  Future<String?> readUserId() => _storage.read(key: _userIdKey);
  Future<bool> readProfileComplete() async {
    final v = await _storage.read(key: _profileCompleteKey);
    return v == 'true';
  }

  Future<void> saveSession({
    required String accessToken,
    required String refreshToken,
    required String userId,
    required bool profileComplete,
  }) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
    await _storage.write(key: _refreshTokenKey, value: refreshToken);
    await _storage.write(key: _userIdKey, value: userId);
    await _storage.write(key: _profileCompleteKey, value: profileComplete.toString());
  }

  Future<void> updateAccessToken(String accessToken) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
  }

  Future<void> clear() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: _userIdKey);
    await _storage.delete(key: _profileCompleteKey);
  }
}

final Provider<FlutterSecureStorage> secureStorageProvider =
    Provider<FlutterSecureStorage>((_) => const FlutterSecureStorage());

final Provider<AuthStorage> authStorageProvider = Provider<AuthStorage>(
  (ref) => AuthStorage(ref.watch(secureStorageProvider)),
);
