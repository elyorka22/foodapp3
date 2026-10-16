import 'package:dio/dio.dart';

/// No-op on platforms without `dart:io` (e.g. web).
void configureNativeHttpClient(Dio dio) {}

/// Stub for tests that import ALPN constants via conditional import.
const List<String> kControlClientAlpnProtocols = <String>['http/1.1'];
