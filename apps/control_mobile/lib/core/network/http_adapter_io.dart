import 'dart:io';

import 'package:dio/dio.dart';
import 'package:dio/io.dart';

/// Native HttpClient tweaks for Android/iOS.
///
/// Keeps idle connections short so a completed nginx response is less likely to
/// leave Dio waiting until [DioExceptionType.receiveTimeout].
void configureNativeHttpClient(Dio dio) {
  dio.httpClientAdapter = IOHttpClientAdapter(
    createHttpClient: () {
      final client = HttpClient();
      client.idleTimeout = const Duration(seconds: 15);
      client.autoUncompress = true;
      return client;
    },
  );
}
