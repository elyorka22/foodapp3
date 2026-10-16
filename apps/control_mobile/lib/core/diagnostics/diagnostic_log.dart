import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'diagnostic_classifier.dart';
import 'diagnostic_event.dart';
import 'diagnostic_sanitizer.dart';

/// Bounded in-memory + SharedPreferences diagnostic log (safe fields only).
class DiagnosticLog extends ChangeNotifier {
  DiagnosticLog._();
  static final DiagnosticLog instance = DiagnosticLog._();

  static const int maxMemoryEvents = 1000;
  static const int maxPersistedEvents = 300;
  static const _prefsKey = 'control_diag_log_v1';

  final List<DiagnosticEvent> _events = <DiagnosticEvent>[];
  SharedPreferences? _prefs;
  int _seq = 0;

  List<DiagnosticEvent> get events => List.unmodifiable(_events);

  Future<void> attachPrefs(SharedPreferences prefs) async {
    _prefs = prefs;
    final raw = prefs.getString(_prefsKey);
    if (raw == null || raw.isEmpty) return;
    try {
      final list = jsonDecode(raw) as List<dynamic>;
      for (final item in list) {
        if (item is Map<String, dynamic>) {
          _events.add(DiagnosticEvent.fromJson(item));
        } else if (item is Map) {
          _events.add(
            DiagnosticEvent.fromJson(Map<String, dynamic>.from(item)),
          );
        }
      }
      while (_events.length > maxMemoryEvents) {
        _events.removeAt(0);
      }
      notifyListeners();
    } catch (_) {
      // Ignore corrupt log.
    }
  }

  String nextRequestId() {
    _seq += 1;
    final t = DateTime.now().millisecondsSinceEpoch % 100000;
    return 'r${t}_$_seq';
  }

  void log({
    required String requestId,
    required String stage,
    required String message,
    int? elapsedMs,
    DiagnosticFailureClass failureClass = DiagnosticFailureClass.none,
    DateTime? at,
  }) {
    final event = DiagnosticEvent(
      at: at ?? DateTime.now(),
      requestId: requestId,
      stage: stage,
      message: DiagnosticSanitizer.sanitize(message),
      elapsedMs: elapsedMs,
      failureClass: failureClass,
    );
    _events.add(event);
    while (_events.length > maxMemoryEvents) {
      _events.removeAt(0);
    }
    notifyListeners();
    _persistSoon();
  }

  void clear() {
    _events.clear();
    notifyListeners();
    _prefs?.remove(_prefsKey);
  }

  String exportText({String? filter}) {
    final q = filter?.trim().toLowerCase();
    final lines = <String>[
      'FoodApp Control diagnostics',
      'exportedAt=${DateTime.now().toIso8601String()}',
      '---',
    ];
    for (final e in _events) {
      final line = e.formattedLine;
      if (q == null || q.isEmpty || line.toLowerCase().contains(q)) {
        lines.add(line);
      }
    }
    return DiagnosticSanitizer.sanitize(lines.join('\n'));
  }

  Future<void>? _persistFuture;

  void _persistSoon() {
    _persistFuture ??= Future<void>(() async {
      await Future<void>.delayed(const Duration(milliseconds: 200));
      _persistFuture = null;
      await _persistNow();
    });
  }

  Future<void> _persistNow() async {
    final prefs = _prefs;
    if (prefs == null) return;
    final slice = _events.length > maxPersistedEvents
        ? _events.sublist(_events.length - maxPersistedEvents)
        : List<DiagnosticEvent>.from(_events);
    final payload = jsonEncode(slice.map((e) => e.toJson()).toList());
    await prefs.setString(_prefsKey, payload);
  }
}
