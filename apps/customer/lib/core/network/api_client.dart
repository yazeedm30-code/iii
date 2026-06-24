import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

import '../storage/auth_storage.dart';
import 'api_response.dart';
import 'auth_interceptor.dart';
import 'refresh_interceptor.dart';

class ApiClient {
  ApiClient(this.dio);

  final Dio dio;

  Future<T> getJson<T>(
    String path, {
    Map<String, dynamic>? query,
    bool requireAuth = true,
    required T Function(Object? data) decode,
  }) async {
    return _send<T>(
      () => dio.get<dynamic>(
        path,
        queryParameters: query,
        options: Options(extra: {'skipAuth': !requireAuth}),
      ),
      decode,
    );
  }

  Future<T> postJson<T>(
    String path, {
    Object? body,
    bool requireAuth = true,
    required T Function(Object? data) decode,
  }) async {
    return _send<T>(
      () => dio.post<dynamic>(
        path,
        data: body,
        options: Options(extra: {'skipAuth': !requireAuth}),
      ),
      decode,
    );
  }

  Future<T> patchJson<T>(
    String path, {
    Object? body,
    bool requireAuth = true,
    required T Function(Object? data) decode,
  }) async {
    return _send<T>(
      () => dio.patch<dynamic>(
        path,
        data: body,
        options: Options(extra: {'skipAuth': !requireAuth}),
      ),
      decode,
    );
  }

  Future<void> deleteVoid(String path, {bool requireAuth = true}) async {
    try {
      await dio.delete<dynamic>(
        path,
        options: Options(extra: {'skipAuth': !requireAuth}),
      );
    } on DioException catch (e) {
      throw _mapDioError(e);
    }
  }

  Future<T> _send<T>(
    Future<Response<dynamic>> Function() send,
    T Function(Object? data) decode,
  ) async {
    try {
      final response = await send();
      final body = response.data;
      if (body is! Map<String, dynamic>) {
        throw ApiException(
          code: 'INVALID_RESPONSE',
          message: 'استجابة غير متوقعة من الخادم',
          statusCode: response.statusCode,
        );
      }
      return ApiResponse<T>.fromJson(body, decode).data;
    } on DioException catch (e) {
      throw _mapDioError(e);
    }
  }

  ApiException _mapDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiException.timeout();
      case DioExceptionType.connectionError:
        return ApiException.network();
      case DioExceptionType.badResponse:
        final body = e.response?.data;
        if (body is Map<String, dynamic>) {
          final api = ApiException.fromJson(body);
          return ApiException(
            code: api.code,
            message: api.message,
            statusCode: e.response?.statusCode,
            details: api.details,
          );
        }
        return ApiException(
          code: 'HTTP_${e.response?.statusCode ?? 0}',
          message: e.message ?? 'خطأ في الخادم',
          statusCode: e.response?.statusCode,
        );
      case DioExceptionType.cancel:
        return ApiException(code: 'CANCELLED', message: 'تم إلغاء الطلب');
      case DioExceptionType.badCertificate:
        return ApiException(code: 'BAD_CERTIFICATE', message: 'شهادة الخادم غير موثوقة');
      case DioExceptionType.unknown:
        return ApiException(code: 'UNKNOWN', message: e.message ?? 'خطأ غير متوقع');
    }
  }
}

const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:3000/api/v1',
);

final Provider<ApiClient> apiClientProvider = Provider<ApiClient>((ref) {
  final storage = ref.watch(authStorageProvider);
  final dio = Dio(
    BaseOptions(
      baseUrl: apiBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 20),
      headers: <String, String>{
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      validateStatus: (status) => status != null && status < 500,
    ),
  );
  dio.interceptors.add(AuthInterceptor(storage));
  dio.interceptors.add(
    RefreshInterceptor(
      dio: dio,
      storage: storage,
      refresh: (refreshToken) async {
        try {
          final response = await dio.post<dynamic>(
            '/auth/refresh',
            data: {'refreshToken': refreshToken},
            options: Options(extra: {'skipAuth': true, 'retried': true}),
          );
          final body = response.data;
          if (body is! Map<String, dynamic> || body['success'] != true) return null;
          final data = body['data'] as Map<String, dynamic>;
          final newAccess = data['accessToken'] as String;
          final newRefresh = data['refreshToken'] as String;
          await storage.updateAccessToken(newAccess);
          return (accessToken: newAccess, refreshToken: newRefresh);
        } catch (_) {
          return null;
        }
      },
      onAuthFailure: () async {
        await storage.clear();
      },
    ),
  );
  dio.interceptors.add(PrettyDioLogger(
    requestBody: true,
    responseBody: false,
    requestHeader: false,
    request: false,
    error: true,
    compact: true,
  ));
  return ApiClient(dio);
});
