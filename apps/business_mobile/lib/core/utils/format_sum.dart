import 'package:intl/intl.dart';

String formatSum(num value) {
  final formatter = NumberFormat.decimalPattern('uz');
  return "${formatter.format(value)} so'm";
}
