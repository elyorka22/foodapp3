/// Uzbek so'm formatting — matches web `format-sum.ts`.
String formatSum(num? amount) {
  final n = (amount ?? 0).round();
  final abs = n.abs().toString();
  final buffer = StringBuffer();
  for (var i = 0; i < abs.length; i++) {
    if (i > 0 && (abs.length - i) % 3 == 0) buffer.write(' ');
    buffer.write(abs[i]);
  }
  final sign = n < 0 ? '−' : '';
  return "$sign${buffer.toString()} so'm";
}
