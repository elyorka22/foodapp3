import '../config/app_config.dart';
import 'diagnostic_log.dart';
import 'probe_result.dart';

/// Web / non-IO stub — isolation probes require dart:io.
Future<ProbeResult> runDioHealthProbe({
  required Future<int> Function() dioGetHealthStatus,
  String? requestId,
}) async {
  final id = requestId ?? DiagnosticLog.instance.nextRequestId();
  DiagnosticLog.instance.log(
    requestId: id,
    stage: 'probe_dio_health_skip',
    message: 'dart:io unavailable on this platform',
  );
  return ProbeResult(
    probeKind: 'dio_health',
    ok: false,
    elapsedMs: 0,
    errorType: 'UnsupportedError',
    errorMessage: 'dart:io unavailable',
  );
}

Future<ProbeResult> runHttpClientHealthProbe({String? requestId}) async {
  final id = requestId ?? DiagnosticLog.instance.nextRequestId();
  DiagnosticLog.instance.log(
    requestId: id,
    stage: 'probe_http_client_skip',
    message: 'dart:io unavailable host=${AppConfig.apiHostLabel}',
  );
  return ProbeResult(
    probeKind: 'http_client_health',
    ok: false,
    elapsedMs: 0,
    errorType: 'UnsupportedError',
    errorMessage: 'dart:io unavailable',
  );
}

Future<ProbeResult> runDnsTlsProbe({String? requestId}) async {
  final id = requestId ?? DiagnosticLog.instance.nextRequestId();
  DiagnosticLog.instance.log(
    requestId: id,
    stage: 'probe_dns_tls_skip',
    message: 'dart:io unavailable host=${AppConfig.apiHostLabel}',
  );
  return ProbeResult(
    probeKind: 'dns_tls',
    ok: false,
    elapsedMs: 0,
    errorType: 'UnsupportedError',
    errorMessage: 'dart:io unavailable',
  );
}
