import 'dart:async';
import 'dart:io';

import 'diagnostic_classifier.dart';

/// Dart [HttpClient] does not expose the negotiated ALPN protocol publicly.
String negotiatedAlpnNote() => 'not_exposed_by_HttpClient';

List<String> describeNative(Object error) {
  final out = <String>[];

  if (error is HttpException) {
    out.add('httpExceptionType=${error.runtimeType}');
    if (error.message.trim().isNotEmpty) {
      out.add('httpExceptionMessage=${error.message}');
    }
    final uri = error.uri;
    if (uri != null) {
      out.add('uriHost=${uri.host}');
      out.add('uriPath=${uri.path}');
    }
    return out;
  }

  if (error is SocketException) {
    out.add('socketExceptionType=${error.runtimeType}');
    if (error.message.trim().isNotEmpty) {
      out.add('socketMessage=${error.message}');
    }
    final os = error.osError;
    if (os != null) {
      out.add('osErrorCode=${os.errorCode}');
      if (os.message.trim().isNotEmpty) {
        out.add('osErrorMessage=${os.message}');
      }
    }
    final addr = error.address;
    if (addr != null) {
      out.add('addressType=${addr.type.name}');
      // Avoid logging literal IP addresses.
    }
    if (error.port != null) {
      out.add('port=${error.port}');
    }
    return out;
  }

  if (error is HandshakeException) {
    out.add('tlsClass=HandshakeException');
    if (error.message.trim().isNotEmpty) {
      out.add('tlsMessage=${error.message}');
    }
    final os = error.osError;
    if (os != null) {
      out.add('osErrorCode=${os.errorCode}');
      if (os.message.trim().isNotEmpty) {
        out.add('osErrorMessage=${os.message}');
      }
    }
    return out;
  }

  if (error is CertificateException) {
    out.add('tlsClass=CertificateException');
    if (error.message.trim().isNotEmpty) {
      out.add('tlsMessage=${error.message}');
    }
    final os = error.osError;
    if (os != null) {
      out.add('osErrorCode=${os.errorCode}');
      if (os.message.trim().isNotEmpty) {
        out.add('osErrorMessage=${os.message}');
      }
    }
    return out;
  }

  if (error is TlsException) {
    out.add('tlsClass=${error.runtimeType}');
    if (error.message.trim().isNotEmpty) {
      out.add('tlsMessage=${error.message}');
    }
    final os = error.osError;
    if (os != null) {
      out.add('osErrorCode=${os.errorCode}');
      if (os.message.trim().isNotEmpty) {
        out.add('osErrorMessage=${os.message}');
      }
    }
    return out;
  }

  if (error is OSError) {
    out.add('osErrorCode=${error.errorCode}');
    if (error.message.trim().isNotEmpty) {
      out.add('osErrorMessage=${error.message}');
    }
    return out;
  }

  if (error is TimeoutException) {
    out.add('timeoutMessage=${error.message}');
    if (error.duration != null) {
      out.add('timeoutDurationMs=${error.duration!.inMilliseconds}');
    }
    return out;
  }

  final text = error.toString();
  if (text.trim().isNotEmpty) {
    out.add('toString=$text');
  }
  return out;
}

DiagnosticFailureClass classifyNative(Object error) {
  if (error is HandshakeException ||
      error is CertificateException ||
      error is TlsException) {
    return DiagnosticFailureClass.tls;
  }
  if (error is SocketException) {
    final msg = error.message.toLowerCase();
    final os = (error.osError?.message ?? '').toLowerCase();
    if (msg.contains('failed host lookup') ||
        msg.contains('name or service not known') ||
        os.contains('name or service not known')) {
      return DiagnosticFailureClass.dns;
    }
    return DiagnosticFailureClass.tcp;
  }
  if (error is HttpException) {
    final msg = error.message.toLowerCase();
    if (msg.contains('before full header') ||
        msg.contains('connection closed')) {
      return DiagnosticFailureClass.headersNotReceived;
    }
    return DiagnosticFailureClass.unknown;
  }
  return DiagnosticFailureClass.unknown;
}

String? inferNativeStage(Object error) {
  if (error is HandshakeException ||
      error is CertificateException ||
      error is TlsException) {
    return 'tls_handshake';
  }
  if (error is SocketException) {
    final msg = error.message.toLowerCase();
    if (msg.contains('failed host lookup')) return 'dns';
    if (msg.contains('timed out') || msg.contains('timeout')) {
      return 'connecting';
    }
    return 'connecting';
  }
  if (error is HttpException) {
    final msg = error.message.toLowerCase();
    if (msg.contains('before full header') ||
        msg.contains('connection closed')) {
      return 'waiting_response_headers';
    }
    return 'request_or_headers';
  }
  if (error is TimeoutException) {
    return 'waiting_response_headers';
  }
  return null;
}
