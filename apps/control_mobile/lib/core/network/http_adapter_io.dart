import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';

import '../diagnostics/diagnostic_classifier.dart';
import '../diagnostics/diagnostic_log.dart';

/// ALPN protocol list advertised by Control's TLS client.
///
/// Must stay HTTP/1.1-only: production nginx uses `listen 443 ssl http2`, and
/// hop-by-hop `Connection: close` is ignored under HTTP/2. Dart's HttpClient
/// then can stall inside [HttpClientRequest.close] until Dio's receiveTimeout
/// fires — even after nginx already logged HTTP 201 with a full body.
const List<String> kControlClientAlpnProtocols = ['http/1.1'];

bool controlNativeHttpAdapterInstalled = false;

/// Builds the [SecurityContext] used on Android/iOS for Control API calls.
SecurityContext createControlSecurityContext() {
  final context = SecurityContext(withTrustedRoots: true);
  // isServer: false → client ALPN list.
  context.setAlpnProtocols(kControlClientAlpnProtocols, false);
  return context;
}

/// HttpClient used by Dio on native platforms.
HttpClient createControlHttpClient() {
  final client = HttpClient(context: createControlSecurityContext());
  client.idleTimeout = const Duration(seconds: 15);
  client.autoUncompress = true;
  return client;
}

/// Installs an [IOHttpClientAdapter] that forces HTTP/1.1 and logs safe timing.
void configureNativeHttpClient(Dio dio) {
  final inner = IOHttpClientAdapter(createHttpClient: createControlHttpClient);
  dio.httpClientAdapter = _TimedHttpClientAdapter(inner);
  controlNativeHttpAdapterInstalled = true;
  DiagnosticLog.instance.log(
    requestId: 'boot',
    stage: 'http_adapter',
    message:
        'custom IO adapter installed alpn=${kControlClientAlpnProtocols.join(",")}',
  );
}

/// Wraps the native adapter to emit stage logs without reading secret bodies.
class _TimedHttpClientAdapter implements HttpClientAdapter {
  _TimedHttpClientAdapter(this._inner);

  final IOHttpClientAdapter _inner;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    final started = DateTime.now();
    final requestId =
        options.extra['diag_request_id'] as String? ?? 'http';
    DiagnosticLog.instance.log(
      requestId: requestId,
      stage: 'adapter_fetch_start',
      message:
          '${options.method} ${options.uri.path} '
          'adapter=custom_io alpn=${kControlClientAlpnProtocols.join(",")}',
    );
    debugPrint(
      '[HTTP] start ${options.method} ${options.uri.path} '
      'alpn=${kControlClientAlpnProtocols.join(",")}',
    );
    try {
      final body = await _inner.fetch(options, requestStream, cancelFuture);
      final headerMs = DateTime.now().difference(started).inMilliseconds;
      final contentLength = body.contentLength;
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'adapter_headers',
        message: 'status=${body.statusCode} contentLength=$contentLength',
        elapsedMs: headerMs,
      );
      debugPrint(
        '[HTTP] headers ${options.method} ${options.uri.path} '
        'status=${body.statusCode} contentLength=$contentLength '
        'headerMs=$headerMs',
      );

      var bytes = 0;
      final monitored = body.stream.transform<Uint8List>(
        StreamTransformer.fromHandlers(
          handleData: (data, sink) {
            bytes += data.length;
            sink.add(data);
          },
          handleDone: (sink) {
            final totalMs = DateTime.now().difference(started).inMilliseconds;
            DiagnosticLog.instance.log(
              requestId: requestId,
              stage: 'adapter_body_done',
              message: 'status=${body.statusCode} bytes=$bytes',
              elapsedMs: totalMs,
            );
            debugPrint(
              '[HTTP] bodyDone ${options.method} ${options.uri.path} '
              'status=${body.statusCode} bytes=$bytes totalMs=$totalMs',
            );
            sink.close();
          },
          handleError: (error, stack, sink) {
            final totalMs = DateTime.now().difference(started).inMilliseconds;
            DiagnosticLog.instance.log(
              requestId: requestId,
              stage: 'adapter_body_error',
              message: 'type=${error.runtimeType}',
              elapsedMs: totalMs,
              failureClass: DiagnosticFailureClass.bodyNotCompleted,
            );
            debugPrint(
              '[HTTP] bodyError ${options.method} ${options.uri.path} '
              'type=${error.runtimeType} totalMs=$totalMs',
            );
            sink.addError(error, stack);
          },
        ),
      );

      final wrapped = ResponseBody(
        monitored,
        body.statusCode,
        statusMessage: body.statusMessage,
        isRedirect: body.isRedirect,
        redirects: body.redirects,
        headers: body.headers,
      );
      wrapped.extra.addAll(body.extra);
      return wrapped;
    } catch (e) {
      final totalMs = DateTime.now().difference(started).inMilliseconds;
      final type = e is DioException ? e.type : e.runtimeType;
      final status = e is DioException ? e.response?.statusCode : null;
      final cls = e is DioException
          ? DiagnosticClassifier.fromDio(e)
          : DiagnosticFailureClass.unknown;
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'adapter_fail',
        message: 'type=$type status=$status',
        elapsedMs: totalMs,
        failureClass: cls,
      );
      debugPrint(
        '[HTTP] fail ${options.method} ${options.uri.path} '
        'type=$type status=$status totalMs=$totalMs',
      );
      rethrow;
    }
  }

  @override
  void close({bool force = false}) => _inner.close(force: force);
}
