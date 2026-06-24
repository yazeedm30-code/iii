import '../../../core/network/api_client.dart';
import '../domain/auth_models.dart';

class AuthApi {
  AuthApi(this._client);

  final ApiClient _client;

  Future<OtpRequestResult> requestOtp(String phoneE164) {
    return _client.postJson<OtpRequestResult>(
      '/auth/otp/request',
      body: {'phoneE164': phoneE164},
      requireAuth: false,
      decode: (data) => OtpRequestResult.fromJson(data! as Map<String, dynamic>),
    );
  }

  Future<AuthSession> verifyOtp({
    required String phoneE164,
    required String code,
    String? deviceId,
    String? deviceKind,
  }) {
    return _client.postJson<AuthSession>(
      '/auth/otp/verify',
      body: {
        'phoneE164': phoneE164,
        'code': code,
        if (deviceId != null) 'deviceId': deviceId,
        if (deviceKind != null) 'deviceKind': deviceKind,
      },
      requireAuth: false,
      decode: (data) => AuthSession.fromJson(data! as Map<String, dynamic>),
    );
  }

  Future<AuthSession> completeRegistration({
    required String firstName,
    String? lastName,
    String? preferredLocale,
    String? referralCode,
  }) {
    return _client.postJson<AuthSession>(
      '/auth/register/complete',
      body: {
        'firstName': firstName,
        if (lastName != null) 'lastName': lastName,
        if (preferredLocale != null) 'preferredLocale': preferredLocale,
        if (referralCode != null && referralCode.isNotEmpty) 'referralCode': referralCode,
      },
      decode: (data) => AuthSession.fromJson(data! as Map<String, dynamic>),
    );
  }

  Future<void> logout(String refreshToken) async {
    await _client.postJson<void>(
      '/auth/logout',
      body: {'refreshToken': refreshToken},
      requireAuth: false,
      decode: (_) {},
    );
  }
}
