import 'dart:io';

String nativeOsSummary() {
  return 'os=${Platform.operatingSystem} '
      'osVersion=${Platform.operatingSystemVersion} '
      'localHostname=redacted';
}

bool get isNativeIo => true;
