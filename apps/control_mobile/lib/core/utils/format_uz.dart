import 'package:intl/intl.dart';

/// Uzbek so'm with spaced thousands: `35 000 so'm`.
String formatMoney(num? amount) {
  final value = (amount ?? 0).toDouble();
  if (!value.isFinite) return "0 so'm";
  final n = value.round();
  final spaced = n.abs().toString().replaceAllMapped(
        RegExp(r'\B(?=(\d{3})+(?!\d))'),
        (m) => ' ',
      );
  final sign = n < 0 ? '−' : '';
  return "$sign$spaced so'm";
}

/// Local date/time for admin lists (uz locale when available).
String formatDateTime(DateTime? value) {
  if (value == null) return '—';
  return DateFormat('dd.MM.yyyy HH:mm').format(value.toLocal());
}
