import 'dart:async';
import 'dart:io';

import '../config/app_config.dart';
import '../constants/api_paths.dart';
import '../network/http_adapter_io.dart';
import 'diagnostic_classifier.dart';
import 'diagnostic_log.dart';
import 'native_error_formatter.dart';
import 'probe_result.dart';

Uri _healthUri() {
  final base = AppConfig.normalizedApiBaseUrl;
  return Uri.parse('$base${ApiPaths.health}');
}

String _alpnLabel(String? selected) {
  if (selected == null || selected.isEmpty) return 'null/not negotiated';
  return selected;
}

/// A. Dio GET /health — caller supplies the Dio call (keeps Dio out of this file's deps loop).
Future<ProbeResult> runDioHealthProbe({
  required Future<int> Function() dioGetHealthStatus,
  String? requestId,
}) async {
  final id = requestId ?? DiagnosticLog.instance.nextRequestId();
  final uri = _healthUri();
  final started = DateTime.now();
  final phases = <String, int>{};

  DiagnosticLog.instance.log(
    requestId: id,
    stage: 'probe_dio_health_start',
    message: 'GET ${uri.host}${uri.path} via=Dio',
  );

  try {
    final t0 = DateTime.now();
    final status = await dioGetHealthStatus();
    phases['request_to_status'] = DateTime.now().difference(t0).inMilliseconds;
    final elapsed = DateTime.now().difference(started).inMilliseconds;
    final result = ProbeResult(
      probeKind: 'dio_health',
      ok: status >= 200 && status < 500,
      elapsedMs: elapsed,
      httpStatus: status,
      negotiatedAlpn: null, // Dio/HttpClient does not expose selectedProtocol
      phaseTimingsMs: phases,
      extra: const {'alpnSource': 'not_exposed_by_Dio_HttpClient'},
    );
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_dio_health_ok',
      message: result.comparisonLine,
      elapsedMs: elapsed,
    );
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_compare',
      message: result.comparisonLine,
      elapsedMs: elapsed,
    );
    return result;
  } catch (e, stack) {
    final elapsed = DateTime.now().difference(started).inMilliseconds;
    final detail = NativeErrorFormatter.describe(
      e,
      stackTrace: stack,
      host: uri.host,
      path: uri.path,
      stage: NativeErrorFormatter.inferFailStage(e),
      elapsedMs: elapsed,
      alpnAdvertised: kControlClientAlpnProtocols.join(','),
    );
    final result = ProbeResult(
      probeKind: 'dio_health',
      ok: false,
      elapsedMs: elapsed,
      negotiatedAlpn: null,
      errorType: e.runtimeType.toString(),
      errorMessage: detail,
      phaseTimingsMs: phases,
      extra: const {'alpnSource': 'not_exposed_by_Dio_HttpClient'},
    );
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_dio_health_fail',
      message: result.comparisonLine,
      elapsedMs: elapsed,
      failureClass: NativeErrorFormatter.classifyObject(e),
    );
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_compare',
      message: result.comparisonLine,
      elapsedMs: elapsed,
      failureClass: NativeErrorFormatter.classifyObject(e),
    );
    return result;
  }
}

/// B. Fresh dart:io HttpClient GET /health — no Dio, no interceptors.
Future<ProbeResult> runHttpClientHealthProbe({String? requestId}) async {
  final id = requestId ?? DiagnosticLog.instance.nextRequestId();
  final uri = _healthUri();
  final started = DateTime.now();
  final phases = <String, int>{};
  String? selectedAlpn;
  HttpClient? client;

  DiagnosticLog.instance.log(
    requestId: id,
    stage: 'probe_http_client_start',
    message:
        'GET ${uri.host}${uri.path} via=dart.io.HttpClient '
        'alpnAdvertised=${kControlClientAlpnProtocols.join(",")} '
        'tlsVerify=trusted_roots',
  );

  try {
    client = createControlHttpClient();
    // Capture negotiated ALPN via connectionFactory (HttpClient alone cannot).
    client.connectionFactory =
        (Uri u, String? proxyHost, int? proxyPort) async {
      if (proxyHost != null) {
        throw UnsupportedError('HttpClient probe does not use HTTP proxies');
      }
      final port = u.hasPort ? u.port : 443;
      final task = await SecureSocket.startConnect(
        u.host,
        port,
        context: createControlSecurityContext(),
      );
      final socketFuture = task.socket.then((SecureSocket socket) {
        selectedAlpn = socket.selectedProtocol;
        return socket;
      });
      return ConnectionTask.fromSocket<Socket>(
        socketFuture,
        () => task.cancel(),
      );
    };

    final openStarted = DateTime.now();
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_http_client_open',
      message: 'openUrl starting host=${uri.host} path=${uri.path}',
    );
    final request = await client.openUrl('GET', uri);
    phases['openUrl_ms'] = DateTime.now().difference(openStarted).inMilliseconds;
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_http_client_opened',
      message:
          'openUrl done openUrl_ms=${phases['openUrl_ms']} '
          'selectedProtocol=${_alpnLabel(selectedAlpn)}',
      elapsedMs: phases['openUrl_ms'],
    );

    request.followRedirects = false;
    request.persistentConnection = false;

    final closeStarted = DateTime.now();
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_http_client_waiting_headers',
      message: 'request.close waiting for response headers',
    );
    final response = await request.close();
    phases['headers_ms'] =
        DateTime.now().difference(closeStarted).inMilliseconds;
    final status = response.statusCode;
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_http_client_headers',
      message:
          'status=$status headers_ms=${phases['headers_ms']} '
          'selectedProtocol=${_alpnLabel(selectedAlpn)}',
      elapsedMs: phases['headers_ms'],
    );

    final bodyStarted = DateTime.now();
    var bytes = 0;
    await for (final chunk in response) {
      bytes += chunk.length;
    }
    phases['body_ms'] = DateTime.now().difference(bodyStarted).inMilliseconds;
    final elapsed = DateTime.now().difference(started).inMilliseconds;

    final result = ProbeResult(
      probeKind: 'http_client_health',
      ok: status >= 200 && status < 500,
      elapsedMs: elapsed,
      httpStatus: status,
      negotiatedAlpn: selectedAlpn,
      phaseTimingsMs: phases,
      extra: {
        'bodyBytes': '$bytes',
        'alpnSource': 'SecureSocket.selectedProtocol',
      },
    );
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_http_client_ok',
      message: result.comparisonLine,
      elapsedMs: elapsed,
    );
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_compare',
      message: result.comparisonLine,
      elapsedMs: elapsed,
    );
    return result;
  } catch (e, stack) {
    final elapsed = DateTime.now().difference(started).inMilliseconds;
    final detail = NativeErrorFormatter.describe(
      e,
      stackTrace: stack,
      host: uri.host,
      path: uri.path,
      stage: phases.containsKey('openUrl_ms')
          ? (phases.containsKey('headers_ms')
              ? 'reading_body'
              : 'waiting_response_headers')
          : 'connecting',
      elapsedMs: elapsed,
      alpnAdvertised: kControlClientAlpnProtocols.join(','),
    );
    final result = ProbeResult(
      probeKind: 'http_client_health',
      ok: false,
      elapsedMs: elapsed,
      negotiatedAlpn: selectedAlpn,
      errorType: e.runtimeType.toString(),
      errorMessage: detail,
      phaseTimingsMs: phases,
      extra: {
        'alpnSource': 'SecureSocket.selectedProtocol',
        'selectedProtocol': _alpnLabel(selectedAlpn),
      },
    );
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_http_client_fail',
      message: result.comparisonLine,
      elapsedMs: elapsed,
      failureClass: NativeErrorFormatter.classifyObject(e),
    );
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_compare',
      message: result.comparisonLine,
      elapsedMs: elapsed,
      failureClass: NativeErrorFormatter.classifyObject(e),
    );
    return result;
  } finally {
    try {
      client?.close(force: true);
    } catch (_) {}
  }
}

/// C. DNS lookup + TLS-only SecureSocket (no HTTP, no credentials).
Future<ProbeResult> runDnsTlsProbe({String? requestId}) async {
  final id = requestId ?? DiagnosticLog.instance.nextRequestId();
  final host = AppConfig.apiHostLabel;
  final started = DateTime.now();
  final phases = <String, int>{};
  String? selectedAlpn;
  SecureSocket? socket;

  DiagnosticLog.instance.log(
    requestId: id,
    stage: 'probe_dns_tls_start',
    message:
        'host=$host port=443 alpnAdvertised=${kControlClientAlpnProtocols.join(",")} '
        'tlsVerify=trusted_roots',
  );

  try {
    final dnsStarted = DateTime.now();
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_dns_start',
      message: 'InternetAddress.lookup($host)',
    );
    final addresses = await InternetAddress.lookup(host);
    phases['dns_ms'] = DateTime.now().difference(dnsStarted).inMilliseconds;
    final addrTypes = addresses.map((a) => a.type.name).toSet().join(',');
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_dns_ok',
      message:
          'dns_ms=${phases['dns_ms']} addressCount=${addresses.length} '
          'addressTypes=$addrTypes',
      elapsedMs: phases['dns_ms'],
    );

    if (addresses.isEmpty) {
      throw const SocketException('No addresses returned by lookup');
    }

    final tlsStarted = DateTime.now();
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_tls_start',
      message: 'SecureSocket.connect host=$host port=443',
    );
    socket = await SecureSocket.connect(
      host,
      443,
      context: createControlSecurityContext(),
      timeout: AppConfig.connectTimeout,
    );
    phases['tls_ms'] = DateTime.now().difference(tlsStarted).inMilliseconds;
    selectedAlpn = socket.selectedProtocol;
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_tls_ok',
      message:
          'tls_ms=${phases['tls_ms']} '
          'selectedProtocol=${_alpnLabel(selectedAlpn)}',
      elapsedMs: phases['tls_ms'],
    );

    final elapsed = DateTime.now().difference(started).inMilliseconds;
    final result = ProbeResult(
      probeKind: 'dns_tls',
      ok: true,
      elapsedMs: elapsed,
      negotiatedAlpn: selectedAlpn,
      phaseTimingsMs: phases,
      extra: {
        'addressCount': '${addresses.length}',
        'addressTypes': addrTypes,
        'alpnSource': 'SecureSocket.selectedProtocol',
      },
    );
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_dns_tls_ok',
      message: result.comparisonLine,
      elapsedMs: elapsed,
    );
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_compare',
      message: result.comparisonLine,
      elapsedMs: elapsed,
    );
    return result;
  } catch (e, stack) {
    final elapsed = DateTime.now().difference(started).inMilliseconds;
    final stage = phases.containsKey('dns_ms') ? 'tls_handshake' : 'dns';
    final detail = NativeErrorFormatter.describe(
      e,
      stackTrace: stack,
      host: host,
      path: '/',
      stage: stage,
      elapsedMs: elapsed,
      alpnAdvertised: kControlClientAlpnProtocols.join(','),
    );
    final result = ProbeResult(
      probeKind: 'dns_tls',
      ok: false,
      elapsedMs: elapsed,
      negotiatedAlpn: selectedAlpn,
      errorType: e.runtimeType.toString(),
      errorMessage: detail,
      phaseTimingsMs: phases,
      extra: {
        'alpnSource': 'SecureSocket.selectedProtocol',
        'selectedProtocol': _alpnLabel(selectedAlpn),
      },
    );
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_dns_tls_fail',
      message: result.comparisonLine,
      elapsedMs: elapsed,
      failureClass: e is HandshakeException ||
              e is CertificateException ||
              e is TlsException
          ? DiagnosticFailureClass.tls
          : NativeErrorFormatter.classifyObject(e),
    );
    DiagnosticLog.instance.log(
      requestId: id,
      stage: 'probe_compare',
      message: result.comparisonLine,
      elapsedMs: elapsed,
      failureClass: DiagnosticFailureClass.unknown,
    );
    return result;
  } finally {
    try {
      await socket?.close();
    } catch (_) {
      try {
        socket?.destroy();
      } catch (_) {}
    }
  }
}
