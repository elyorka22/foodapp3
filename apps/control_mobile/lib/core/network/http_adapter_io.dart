import 'dart:async';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';
import 'package:native_dio_adapter/native_dio_adapter.dart';

import '../diagnostics/diagnostic_classifier.dart';
import '../diagnostics/diagnostic_log.dart';
import '../diagnostics/native_error_formatter.dart';

/// ALPN protocol list for the dart:io fallback client (not used by Cronet).
///
/// Kept for isolation probes and Cronet-disabled fallback devices.
const List<String> kControlClientAlpnProtocols = ['http/1.1'];

bool controlNativeHttpAdapterInstalled = false;

/// `native_cronet` | `custom_io_alpn` | `stub`
String controlHttpAdapterKind = 'unset';

/// Builds the [SecurityContext] used by dart:io fallback / isolation probes.
SecurityContext createControlSecurityContext() {
  final context = SecurityContext(withTrustedRoots: true);
  context.setAlpnProtocols(kControlClientAlpnProtocols, false);
  return context;
}

/// HttpClient for dart:io fallback and diagnostic HttpClient probes.
HttpClient createControlHttpClient() {
  final client = HttpClient(context: createControlSecurityContext());
  client.idleTimeout = const Duration(seconds: 15);
  client.autoUncompress = true;
  return client;
}

IOHttpClientAdapter _createIoAlpnAdapter() {
  return IOHttpClientAdapter(createHttpClient: createControlHttpClient);
}

/// Installs the platform HTTP stack for Dio.
///
/// On Android uses Cronet via [NativeAdapter] (same family as Chrome) so VPN /
/// system proxy routing matches the browser. dart:io is only a fallback when
/// Cronet providers are disabled on the device.
void configureNativeHttpClient(Dio dio) {
  final HttpClientAdapter inner;
  if (Platform.isAndroid) {
    inner = NativeAdapter(
      createFallbackAdapter: (Object error, StackTrace stackTrace) {
        controlHttpAdapterKind = 'custom_io_alpn';
        DiagnosticLog.instance.log(
          requestId: 'boot',
          stage: 'http_adapter_fallback',
          message:
              'Cronet unavailable → dart:io ALPN fallback '
              'errorType=${error.runtimeType}',
        );
        // Outer _TimedHttpClientAdapter already wraps NativeAdapter.
        return _createIoAlpnAdapter();
      },
    );
    controlHttpAdapterKind = 'native_cronet';
    DiagnosticLog.instance.log(
      requestId: 'boot',
      stage: 'http_adapter',
      message:
          'NativeAdapter(Cronet) installed — VPN/proxy via Android system stack; '
          'TLS verify=system/Cronet defaults (not disabled)',
    );
  } else {
    inner = _TimedHttpClientAdapter(_createIoAlpnAdapter());
    controlHttpAdapterKind = 'custom_io_alpn';
    DiagnosticLog.instance.log(
      requestId: 'boot',
      stage: 'http_adapter',
      message:
          'custom IO adapter installed alpn=${kControlClientAlpnProtocols.join(",")} '
          'negotiatedAlpn=not_exposed_by_HttpClient',
    );
  }

  // Always wrap with timing logs (NativeAdapter or IO).
  dio.httpClientAdapter = inner is _TimedHttpClientAdapter
      ? inner
      : _TimedHttpClientAdapter(inner);
  controlNativeHttpAdapterInstalled = true;
}

/// Wraps any [HttpClientAdapter] with stage timing and safe error detail.
class _TimedHttpClientAdapter implements HttpClientAdapter {
  _TimedHttpClientAdapter(this._inner);

  final HttpClientAdapter _inner;

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
          'adapter=$controlHttpAdapterKind '
          'alpnAdvertised=${kControlClientAlpnProtocols.join(",")} host=$host',
    );
    debugPrint(
      '[HTTP] start ${options.method} $path '
      'adapter=$controlHttpAdapterKind host=$host',
    );

    try {
      stage = 'connecting_or_waiting_headers';
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
            'adapter=$controlHttpAdapterKind host=$host path=$path',
        elapsedMs: headerMs,
      );
      debugPrint(
        '[HTTP] headers ${options.method} $path '
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
        message: 'adapter=$controlHttpAdapterKind | $detail',
        elapsedMs: totalMs,
        failureClass: cls,
      );
      debugPrint('[HTTP] fail $path adapter=$controlHttpAdapterKind $detail');
      rethrow;
    }
  }

  @override
  void close({bool force = false}) => _inner.close(force: force);
}
