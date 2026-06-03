class ApiException implements Exception {
  ApiException({
    required this.message,
    this.statusCode,
    this.raw,
  });

  final String message;
  final int? statusCode;
  final Object? raw;

  @override
  String toString() => message;

  static String parseMessage(Object? data) {
    if (data is Map<String, dynamic>) {
      final msg = data['message'];
      if (msg is List) return msg.map((e) => e.toString()).join(', ');
      if (msg is String) return msg;
    }
    return 'So‘rov bajarilmadi';
  }
}
