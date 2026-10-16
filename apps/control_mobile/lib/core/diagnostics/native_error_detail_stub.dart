import 'diagnostic_classifier.dart';

String negotiatedAlpnNote() => 'n/a_no_dart_io';

List<String> describeNative(Object error) {
  final out = <String>[];
  final text = error.toString();
  if (text.trim().isNotEmpty) {
    out.add('toString=$text');
  }
  return out;
}

DiagnosticFailureClass classifyNative(Object error) {
  return DiagnosticFailureClass.unknown;
}

String? inferNativeStage(Object error) => null;
