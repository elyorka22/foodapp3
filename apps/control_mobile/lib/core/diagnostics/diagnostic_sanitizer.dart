/// Redacts secrets and PII from diagnostic strings before display/persist.
abstract final class DiagnosticSanitizer {
  static final _bearer = RegExp(
    r'(Bearer\s+)[A-Za-z0-9\-._~+/]+=*',
    caseSensitive: false,
  );
  static final _jwt = RegExp(
    r'\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b',
  );
  static final _passwordKv = RegExp(
    r'((?:password|passwd|pwd|secret|token|accessToken|refreshToken|authorization)\s*[:=]\s*)([^\s,;}"]+)',
    caseSensitive: false,
  );
  static final _email = RegExp(
    r'[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}',
    caseSensitive: false,
  );
  static final _phone = RegExp(r'\+?\d[\d\s\-()]{8,}\d');

  static String sanitize(String input) {
    var out = input;
    out = out.replaceAllMapped(_bearer, (m) => '${m[1]}***');
    out = out.replaceAllMapped(_jwt, (_) => '***JWT***');
    out = out.replaceAllMapped(_passwordKv, (m) => '${m[1]}***');
    out = out.replaceAllMapped(_email, (_) => '***@***');
    out = out.replaceAllMapped(_phone, (_) => '***PHONE***');
    return out;
  }

  /// Returns only JSON object keys (never values) for payload shape logging.
  static String payloadFieldNames(Map<String, dynamic> payload) {
    final keys = payload.keys.toList()..sort();
    return keys.join(',');
  }
}
