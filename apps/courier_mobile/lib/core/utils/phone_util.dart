/// Canonical Uzbekistan mobile: +998XXXXXXXXX (9 digits after 998).
String normalizePhone(String phone) {
  var digits = phone.replaceAll(RegExp(r'[\s\-()+]'), '').trim();
  if (digits.isEmpty) return phone.trim();

  if (digits.startsWith('+')) {
    digits = digits.substring(1);
  }

  // Local trunk prefix: 8901234567 -> 998901234567
  if (digits.length == 10 && digits.startsWith('8')) {
    digits = '998${digits.substring(1)}';
  }

  if (digits.startsWith('998') && digits.length == 12) {
    return '+$digits';
  }

  if (RegExp(r'^\d{9}$').hasMatch(digits)) {
    return '+998$digits';
  }

  if (digits.startsWith('998')) {
    return '+$digits';
  }

  final legacy = phone.replaceAll(RegExp(r'[\s\-()]'), '').trim();
  return legacy.startsWith('+') ? legacy : '+$digits';
}
