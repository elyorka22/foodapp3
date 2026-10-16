import 'package:dio/dio.dart';

import '../diagnostics/diagnostic_log.dart';

/// No-op on platforms without `dart:io` (e.g. web).
void configureNativeHttpClient(Dio dio) {
  controlNativeHttpAdapterInstalled = false;
  DiagnosticLog.instance.log(
    requestId: 'boot',
    stage: 'http_adapter',
    message: 'stub adapter (no dart:io) — custom IO adapter NOT active',
  );
}

bool controlNativeHttpAdapterInstalled = false;

/// Stub for tests that import ALPN constants via conditional import.
const List<String> kControlClientAlpnProtocols = <String>['http/1.1'];
