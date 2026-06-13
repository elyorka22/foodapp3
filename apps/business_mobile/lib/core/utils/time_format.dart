import 'package:flutter/material.dart';

/// Normalize user input to 24h HH:mm for the API.
String? normalizeTimeTo24h(String input) {
  final trimmed = input.trim();
  if (trimmed.isEmpty) return null;

  final compact = trimmed.replaceAll(RegExp(r'\s+'), ' ');

  final amPm = RegExp(
    r'^(\d{1,2})(?::(\d{2}))?\s*([AaPp])\.?\s*([Mm])\.?$',
  ).firstMatch(compact);
  if (amPm != null) {
    var hour = int.parse(amPm.group(1)!);
    final minute = int.parse(amPm.group(2) ?? '0');
    final isPm = amPm.group(3)!.toLowerCase() == 'p';
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
    if (hour == 12) {
      hour = isPm ? 12 : 0;
    } else if (isPm) {
      hour += 12;
    }
    return '${hour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')}';
  }

  final twentyFour = RegExp(r'^(\d{1,2}):(\d{2})$').firstMatch(compact);
  if (twentyFour != null && !RegExp(r'[AaPp]').hasMatch(compact)) {
    final hour = int.parse(twentyFour.group(1)!);
    final minute = int.parse(twentyFour.group(2)!);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
    return '${hour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')}';
  }

  return null;
}

String formatTime12h(String time24) {
  final normalized = normalizeTimeTo24h(time24) ?? time24;
  final parts = normalized.split(':');
  if (parts.length != 2) return time24;

  final h24 = int.tryParse(parts[0]);
  final min = int.tryParse(parts[1]);
  if (h24 == null || min == null) return time24;

  final period = h24 >= 12 ? 'PM' : 'AM';
  final h12 = h24 % 12 == 0 ? 12 : h24 % 12;
  return '$h12:${min.toString().padLeft(2, '0')} $period';
}

TimeOfDay? parseTimeOfDay(String value) {
  final normalized = normalizeTimeTo24h(value);
  if (normalized == null) return null;
  final parts = normalized.split(':');
  return TimeOfDay(hour: int.parse(parts[0]), minute: int.parse(parts[1]));
}

String timeOfDayTo24h(TimeOfDay time) {
  return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
}

String normalizeWorkingHourTime(String value, {String fallback = '09:00'}) {
  return normalizeTimeTo24h(value) ?? normalizeTimeTo24h(fallback) ?? fallback;
}
