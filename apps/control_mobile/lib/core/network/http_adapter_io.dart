import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';

import '../diagnostics/diagnostic_classifier.dart';
import '../diagnostics/diagnostic_log.dart';
import '../diagnostics/native_error_formatter.dart';

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

/// Installs a diagnostic [IOHttpClientAdapter] that forces HTTP/1.1.
void configureNativeHttpClient(Dio dio) {
  final inner = IOHttpClientAdapter(createHttpClient: createControlHttpClient);
  dio.httpClientAdapter = _TimedHttpClientAdapter(inner);
  controlNativeHttpAdapterInstalled = true;
  DiagnosticLog.instance.log(
    requestId: 'boot',
    stage: 'http_adapter',
    message:
        'custom IO adapter installed alpn=${kControlClientAlpnProtocols.join(",")} '
        'negotiatedAlpn=not_exposed_by_HttpClient',
  );
}

/// Wraps the native adapter with stage timing and full native error detail.
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
    final host = options.uri.host;
    final path = options.uri.path;
    var stage = 'adapter_fetch_start';

    DiagnosticLog.instance.log(
      requestId: requestId,
      stage: stage,
      message:
          '${options.method} $path '
          'adapter=custom_io alpnAdvertised=${kControlClientAlpnProtocols.join(",")} '
          'negotiatedAlpn=not_exposed_by_HttpClient host=$host',
    );
    debugPrint(
      '[HTTP] start ${options.method} $path '
      'alpn=${kControlClientAlpnProtocols.join(",")} host=$host',
    );

    try {
      stage = 'connecting_or_waiting_headers';
      // Dio IO adapter: connectTimeout covers openUrl; receiveTimeout covers
      // request.close() (headers). We cannot split those without reimplementing
      // the adapter; stage is refined from the thrown error type below.
      final body = await _inner.fetch(options, requestStream, cancelFuture);

      final headerMs = DateTime.now().difference(started).inMilliseconds;
      final contentLength = body.contentLength;
      String? httpVersion;
      try {
        httpVersion =
            body.extra[HttpClientAdapter.extraKeyHttpVersion] as String?;
      } catch (_) {}

      stage = 'headers_received';
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'adapter_headers',
        message:
            'status=${body.statusCode} contentLength=$contentLength '
            'httpVersion=${httpVersion ?? "unknown"} '
            'alpnAdvertised=${kControlClientAlpnProtocols.join(",")} '
            'negotiatedAlpn=not_exposed_by_HttpClient host=$host path=$path',
        elapsedMs: headerMs,
      );
      debugPrint(
        '[HTTP] headers ${options.method} $path '
        'status=${body.statusCode} contentLength=$contentLength '
        'httpVersion=${httpVersion ?? "unknown"} headerMs=$headerMs',
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
              message:
                  'status=${body.statusCode} bytes=$bytes host=$host path=$path',
              elapsedMs: totalMs,
            );
            debugPrint(
              '[HTTP] bodyDone ${options.method} $path '
              'status=${body.statusCode} bytes=$bytes totalMs=$totalMs',
            );
            sink.close();
          },
          handleError: (error, stack, sink) {
            final totalMs = DateTime.now().difference(started).inMilliseconds;
            final detail = NativeErrorFormatter.describe(
              error,
              stackTrace: stack,
              host: host,
              path: path,
              stage: 'reading_body',
              elapsedMs: totalMs,
              alpnAdvertised: kControlClientAlpnProtocols.join(','),
            );
            DiagnosticLog.instance.log(
              requestId: requestId,
              stage: 'adapter_body_error',
              message: detail,
              elapsedMs: totalMs,
              failureClass: DiagnosticFailureClass.bodyNotCompleted,
            );
            debugPrint('[HTTP] bodyError $path $detail');
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
    } catch (e, stack) {
      final totalMs = DateTime.now().difference(started).inMilliseconds;
      final failStage = NativeErrorFormatter.inferFailStage(
        e,
        currentStage: stage,
      );
      final cls = NativeErrorFormatter.classifyObject(e);
      final detail = NativeErrorFormatter.describe(
        e,
        stackTrace: stack,
        host: host,
        path: path,
        stage: failStage,
        elapsedMs: totalMs,
        alpnAdvertised: kControlClientAlpnProtocols.join(','),
      );
      DiagnosticLog.instance.log(
        requestId: requestId,
        stage: 'adapter_fail',
        message: detail,
        elapsedMs: totalMs,
        failureClass: cls,
      );
      debugPrint('[HTTP] fail $path $detail');
      rethrow;
    }
  }

  @override
  void close({bool force = false}) => _inner.close(force: force);
}
