class AuthUser {
  AuthUser({
    required this.id,
    required this.kind,
    required this.status,
    required this.locale,
    required this.profileComplete,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) => AuthUser(
        id: json['id'] as String,
        kind: json['kind'] as String,
        status: json['status'] as String,
        locale: json['locale'] as String,
        profileComplete: json['profileComplete'] == true,
      );

  final String id;
  final String kind;
  final String status;
  final String locale;
  final bool profileComplete;
}

class AuthSession {
  AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
    required this.user,
  });

  factory AuthSession.fromJson(Map<String, dynamic> json) => AuthSession(
        accessToken: json['accessToken'] as String,
        refreshToken: json['refreshToken'] as String,
        expiresIn: (json['expiresIn'] as num).toInt(),
        user: AuthUser.fromJson(json['user'] as Map<String, dynamic>),
      );

  final String accessToken;
  final String refreshToken;
  final int expiresIn;
  final AuthUser user;
}

class OtpRequestResult {
  OtpRequestResult({required this.ttlSeconds});

  factory OtpRequestResult.fromJson(Map<String, dynamic> json) =>
      OtpRequestResult(ttlSeconds: (json['ttlSeconds'] as num).toInt());

  final int ttlSeconds;
}
