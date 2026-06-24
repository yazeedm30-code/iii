import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/storage/auth_storage.dart';
import '../data/auth_api.dart';
import '../domain/auth_models.dart';

enum AuthStatus { unknown, anonymous, needsProfile, authenticated }

class AuthState {
  const AuthState({required this.status, this.user});

  const AuthState.unknown() : this(status: AuthStatus.unknown);
  const AuthState.anonymous() : this(status: AuthStatus.anonymous);

  final AuthStatus status;
  final AuthUser? user;

  AuthState copyWith({AuthStatus? status, AuthUser? user}) =>
      AuthState(status: status ?? this.status, user: user ?? this.user);
}

class AuthController extends Notifier<AuthState> {
  late final AuthApi _api = ref.read(authApiProvider);
  late final AuthStorage _storage = ref.read(authStorageProvider);

  @override
  AuthState build() => const AuthState.unknown();

  Future<void> bootstrap() async {
    final accessToken = await _storage.readAccessToken();
    if (accessToken == null || accessToken.isEmpty) {
      state = const AuthState.anonymous();
      return;
    }
    final profileComplete = await _storage.readProfileComplete();
    final userId = await _storage.readUserId() ?? '';
    state = AuthState(
      status: profileComplete ? AuthStatus.authenticated : AuthStatus.needsProfile,
      user: AuthUser(
        id: userId,
        kind: 'CUSTOMER',
        status: 'ACTIVE',
        locale: 'AR',
        profileComplete: profileComplete,
      ),
    );
  }

  Future<OtpRequestResult> requestOtp(String phone) => _api.requestOtp(phone);

  Future<void> verifyOtp({required String phoneE164, required String code, String? deviceKind}) async {
    final session = await _api.verifyOtp(
      phoneE164: phoneE164,
      code: code,
      deviceKind: deviceKind,
    );
    await _persist(session);
  }

  Future<void> completeRegistration({
    required String firstName,
    String? lastName,
    String? preferredLocale,
    String? referralCode,
  }) async {
    final session = await _api.completeRegistration(
      firstName: firstName,
      lastName: lastName,
      preferredLocale: preferredLocale,
      referralCode: referralCode,
    );
    await _persist(session);
  }

  Future<void> logout() async {
    final refresh = await _storage.readRefreshToken();
    if (refresh != null && refresh.isNotEmpty) {
      try {
        await _api.logout(refresh);
      } catch (_) {
        // ignore network errors during logout
      }
    }
    await _storage.clear();
    state = const AuthState.anonymous();
  }

  Future<void> _persist(AuthSession session) async {
    await _storage.saveSession(
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      userId: session.user.id,
      profileComplete: session.user.profileComplete,
    );
    state = AuthState(
      status: session.user.profileComplete ? AuthStatus.authenticated : AuthStatus.needsProfile,
      user: session.user,
    );
  }
}

final Provider<AuthApi> authApiProvider =
    Provider<AuthApi>((ref) => AuthApi(ref.watch(apiClientProvider)));

final NotifierProvider<AuthController, AuthState> authControllerProvider =
    NotifierProvider<AuthController, AuthState>(AuthController.new);
