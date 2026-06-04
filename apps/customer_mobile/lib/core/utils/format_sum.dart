/// Uzbek so'm formatting aligned with web `formatSum`.
String formatSum(num amount) {
  final n = amount.round();
  final spaced = n.abs().toString().replaceAllMapped(
        RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]} ',
      );
  final sign = n < 0 ? '−' : '';
  return "$sign$spaced so'm";
}
