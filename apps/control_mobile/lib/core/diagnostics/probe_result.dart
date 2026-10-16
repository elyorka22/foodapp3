import 'diagnostic_sanitizer.dart';

/// Comparable snapshot of one isolation probe (safe fields only).
class ProbeResult {
  ProbeResult({
    required this.probeKind,
    required this.ok,
    required this.elapsedMs,
    this.httpStatus,
    this.negotiatedAlpn,
    this.errorType,
    this.errorMessage,
    this.phaseTimingsMs = const {},
    this.extra = const {},
  });

  /// `dio_health` | `http_client_health` | `dns_tls`
  final String probeKind;
  final bool ok;
  final int elapsedMs;
  final int? httpStatus;

  /// Exact [SecureSocket.selectedProtocol], or `null/not negotiated`.
  final String? negotiatedAlpn;
  final String? errorType;
  final String? errorMessage;
  final Map<String, int> phaseTimingsMs;
  final Map<String, String> extra;

  String get negotiatedAlpnLabel {
    if (negotiatedAlpn == null || negotiatedAlpn!.isEmpty) {
      return 'null/not negotiated';
    }
    return negotiatedAlpn!;
  }

  /// One-line comparison row for UI / export.
  String get comparisonLine {
    final status = httpStatus != null ? 'http=$httpStatus' : 'http=n/a';
    final err = ok
        ? 'error=none'
        : 'errorType=${errorType ?? "unknown"} '
            'errorMessage=${errorMessage ?? ""}';
    final phases = phaseTimingsMs.entries
        .map((e) => '${e.key}=${e.value}ms')
        .join(' ');
    final extras = extra.entries.map((e) => '${e.key}=${e.value}').join(' ');
    return DiagnosticSanitizer.sanitizeTechnical(
      'probe=$probeKind ok=$ok $status elapsedMs=$elapsedMs '
      'alpn=$negotiatedAlpnLabel $err'
      '${phases.isEmpty ? "" : " phases:$phases"}'
      '${extras.isEmpty ? "" : " $extras"}',
    );
  }
}
