import 'diagnostic_classifier.dart';
import 'diagnostic_sanitizer.dart';

class DiagnosticEvent {
  DiagnosticEvent({
    required this.at,
    required this.requestId,
    required this.stage,
    required this.message,
    this.elapsedMs,
    this.failureClass = DiagnosticFailureClass.none,
  });

  final DateTime at;
  final String requestId;
  final String stage;
  final String message;
  final int? elapsedMs;
  final DiagnosticFailureClass failureClass;

  String get formattedLine {
    final ts = at.toIso8601String();
    final elapsed = elapsedMs != null ? ' +${elapsedMs}ms' : '';
    final cls = failureClass == DiagnosticFailureClass.none
        ? ''
        : ' [${DiagnosticClassifier.label(failureClass)}]';
    return '[$ts]$elapsed #$requestId $stage: $message$cls';
  }

  Map<String, dynamic> toJson() => {
        'at': at.toIso8601String(),
        'requestId': requestId,
        'stage': stage,
        'message': message,
        'elapsedMs': elapsedMs,
        'failureClass': failureClass.name,
      };

  factory DiagnosticEvent.fromJson(Map<String, dynamic> json) {
    final clsName = json['failureClass'] as String? ?? 'none';
    final cls = DiagnosticFailureClass.values.firstWhere(
      (e) => e.name == clsName,
      orElse: () => DiagnosticFailureClass.unknown,
    );
    return DiagnosticEvent(
      at: DateTime.tryParse(json['at'] as String? ?? '') ?? DateTime.now(),
      requestId: json['requestId'] as String? ?? '-',
      stage: json['stage'] as String? ?? '-',
      message: DiagnosticSanitizer.sanitize(json['message'] as String? ?? ''),
      elapsedMs: json['elapsedMs'] as int?,
      failureClass: cls,
    );
  }
}
