class ApiResponse<T> {
  ApiResponse({required this.data, this.timestamp});

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? data) decode,
  ) {
    final bool success = json['success'] == true;
    if (!success) {
      throw ApiException.fromJson(json);
    }
    final meta = json['meta'] as Map<String, dynamic>?;
    return ApiResponse<T>(
      data: decode(json['data']),
      timestamp: meta == null ? null : DateTime.tryParse(meta['timestamp']?.toString() ?? ''),
    );
  }

  final T data;
  final DateTime? timestamp;
}

class ApiException implements Exception {
  ApiException({required this.code, required this.message, this.statusCode, this.details});

  factory ApiException.fromJson(Map<String, dynamic> json) {
    final error = json['error'] as Map<String, dynamic>?;
    return ApiException(
      code: error?['code']?.toString() ?? 'UNKNOWN',
      message: error?['message']?.toString() ?? 'Unexpected error',
      details: error?['details'],
    );
  }

  factory ApiException.network() => ApiException(
        code: 'NETWORK_UNREACHABLE',
        message: 'تعذّر الاتصال بالخادم',
      );

  factory ApiException.timeout() => ApiException(
        code: 'TIMEOUT',
        message: 'انتهت مهلة الاتصال',
      );

  factory ApiException.unauthorized() => ApiException(
        code: 'UNAUTHORIZED',
        message: 'انتهت الجلسة، يرجى تسجيل الدخول مجدداً',
        statusCode: 401,
      );

  final String code;
  final String message;
  final int? statusCode;
  final Object? details;

  @override
  String toString() => 'ApiException($code, $statusCode): $message';
}
