/// Canonical Uzbekistan mobile: +998XXXXXXXXX (9 digits after 998).
const uzPhonePrefix = '+998';

String extractUzLocalDigits(String phone) {
  var digits = phone.replaceAll(RegExp(r'\D'), '');
  if (digits.startsWith('998')) {
    digits = digits.substring(3);
  } else if (digits.length == 10 && digits.startsWith('8')) {
    digits = digits.substring(1);
  }
  if (digits.length > 9) digits = digits.substring(0, 9);
  return digits;
}

String formatUzLocalDigits(String digits) {
  final d = extractUzLocalDigits(digits);
  if (d.length <= 2) return d;
  if (d.length <= 5) return '${d.substring(0, 2)} ${d.substring(2)}';
  if (d.length <= 7) {
    return '${d.substring(0, 2)} ${d.substring(2, 5)} ${d.substring(5)}';
  }
  return '${d.substring(0, 2)} ${d.substring(2, 5)} ${d.substring(5, 7)} ${d.substring(7)}';
}

String normalizePhone(String phone) {
  var digits = phone.replaceAll(RegExp(r'[\s\-()+]'), '').trim();
  if (digits.isEmpty) return phone.trim();

  if (digits.startsWith('+')) {
    digits = digits.substring(1);
  }

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

bool isValidUzPhone(String phone) {
  return RegExp(r'^\+998\d{9}$').hasMatch(normalizePhone(phone));
}
