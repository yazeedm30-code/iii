import 'dart:async';

import 'package:dio/dio.dart';

import '../storage/auth_storage.dart';

typedef RefreshCallback = Future<({String accessToken, String refreshToken})?> Function(
  String refreshToken,
);

class RefreshInterceptor extends Interceptor {
  RefreshInterceptor({
    required this.dio,
    required this.storage,
    required this.refresh,
    required this.onAuthFailure,
  });

  final Dio dio;
  final AuthStorage storage;
  final RefreshCallback refresh;
  final Future<void> Function() onAuthFailure;

  Future<void>? _ongoingRefresh;

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    final response = err.response;
    final shouldRefresh = response?.statusCode == 401 &&
        err.requestOptions.extra['skipAuth'] != true &&
        err.requestOptions.extra['retried'] != true;

    if (!shouldRefresh) {
      handler.next(err);
      return;
    }

    final refreshToken = await storage.readRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      await onAuthFailure();
      handler.next(err);
      return;
    }

    try {
      _ongoingRefresh ??= _runRefresh(refreshToken);
      await _ongoingRefresh;
    } catch (_) {
      handler.next(err);
      return;
    } finally {
      _ongoingRefresh = null;
    }

    try {
      final retried = await dio.fetch<dynamic>(
        err.requestOptions.copyWith(extra: {...err.requestOptions.extra, 'retried': true}),
      );
      handler.resolve(retried);
    } on DioException catch (e) {
      handler.next(e);
    }
  }

  Future<void> _runRefresh(String token) async {
    final result = await refresh(token);
    if (result == null) {
      await storage.clear();
      await onAuthFailure();
      throw DioException(
        requestOptions: RequestOptions(path: ''),
        type: DioExceptionType.badResponse,
        error: 'refresh_failed',
      );
    }
  }
}

extension on RequestOptions {
  RequestOptions copyWith({Map<String, dynamic>? extra}) {
    return RequestOptions(
      path: path,
      method: method,
      baseUrl: baseUrl,
      headers: Map<String, dynamic>.from(headers),
      queryParameters: Map<String, dynamic>.from(queryParameters),
      data: data,
      extra: {...this.extra, ...?extra},
      responseType: responseType,
      contentType: contentType,
      receiveTimeout: receiveTimeout,
      sendTimeout: sendTimeout,
      connectTimeout: connectTimeout,
      followRedirects: followRedirects,
      validateStatus: validateStatus,
    );
  }
}
