import 'package:intl/intl.dart';

String formatSum(num value) {
  final formatter = NumberFormat('#,###', 'uz_UZ');
  return "${formatter.format(value.round())} so'm";
}
