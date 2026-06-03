import 'dart:io' show Platform;

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../config/app_config.dart';
import 'network_connectivity.dart';

/// Snapshot of environment and connectivity at app startup.
class StartupDiagnosticsSnapshot {
  const StartupDiagnosticsSnapshot({
    required this.apiBaseUrl,
    required this.wsBaseUrl,
    required this.normalizedApiBaseUrl,
    required this.hasDuplicateApiV1InBase,
    required this.connectivity,
    required this.hasNetwork,
    required this.platform,
    required this.osVersion,
    required this.appVersion,
    required this.buildMode,
  });

  final String apiBaseUrl;
  final String wsBaseUrl;
  final String normalizedApiBaseUrl;
  final bool hasDuplicateApiV1InBase;
  final List<String> connectivity;
  final bool hasNetwork;
  final String platform;
  final String osVersion;
  final String appVersion;
  final String buildMode;

  @override
  String toString() {
    return '''
Startup diagnostics
  buildMode: $buildMode
  API_BASE_URL: $apiBaseUrl
  WS_BASE_URL: $wsBaseUrl
  normalizedApiBaseUrl: $normalizedApiBaseUrl
  duplicate /api/v1 in base: $hasDuplicateApiV1InBase
  platform: $platform
  osVersion: $osVersion
  appVersion: $appVersion
  connectivity: ${connectivity.join(', ')}
  hasNetwork: $hasNetwork
''';
  }
}

final startupDiagnosticsProvider = FutureProvider<StartupDiagnosticsSnapshot>((ref) {
  return StartupDiagnostics.collect();
});

abstract final class StartupDiagnostics {
  static Future<StartupDiagnosticsSnapshot> collect() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    final connectivity = connectivityResult.map((e) => e.name).toList();
    final hasNetwork = await hasNetworkConnection();
    final packageInfo = await PackageInfo.fromPlatform();

    final snapshot = StartupDiagnosticsSnapshot(
      apiBaseUrl: AppConfig.apiBaseUrl,
      wsBaseUrl: AppConfig.wsBaseUrl,
      normalizedApiBaseUrl: AppConfig.normalizedApiBaseUrl,
      hasDuplicateApiV1InBase: AppConfig.hasDuplicateApiV1InBase,
      connectivity: connectivity,
      hasNetwork: hasNetwork,
      platform: Platform.operatingSystem,
      osVersion: Platform.operatingSystemVersion,
      appVersion: '${packageInfo.version}+${packageInfo.buildNumber}',
      buildMode: kReleaseMode
          ? 'release'
          : kProfileMode
              ? 'profile'
              : 'debug',
    );

    debugPrint(snapshot.toString());
    return snapshot;
  }

  /// Call once from [main] before [runApp].
  static Future<void> runAtStartup() async {
    await collect();
  }
}
