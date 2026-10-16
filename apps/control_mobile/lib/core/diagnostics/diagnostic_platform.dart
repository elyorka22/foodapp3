import 'package:flutter/foundation.dart';

import 'diagnostic_platform_stub.dart'
    if (dart.library.io) 'diagnostic_platform_io.dart' as impl;

String diagnosticPlatformSummary() {
  final bits = <String>[
    'kIsWeb=$kIsWeb',
    'target=$defaultTargetPlatform',
    impl.nativeOsSummary(),
  ];
  return bits.join(' ');
}

bool get diagnosticIsNativeIo => impl.isNativeIo;
