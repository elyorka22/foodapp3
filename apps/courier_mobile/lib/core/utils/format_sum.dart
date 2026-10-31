import 'package:intl/intl.dart';

String formatSumNumber(num value) {
  final formatter = NumberFormat('#,###', 'uz_UZ');
  return formatter.format(value.round());
}

String formatSum(num value) {
  return "${formatSumNumber(value)} so'm";
}

String initialsOf(String? name) {
  final parts = (name ?? '').trim().split(RegExp(r'\s+'));
  if (parts.isEmpty || parts.first.isEmpty) return '?';
  if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
  return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
}
