/// Parse owner login for legacy POST /users fallback (email is required there).
class OwnerLoginParts {
  const OwnerLoginParts({required this.email, this.phone});

  final String email;
  final String? phone;
}

OwnerLoginParts parseOwnerLogin(String login) {
  final trimmed = login.trim();
  if (trimmed.contains('@')) {
    return OwnerLoginParts(email: trimmed.toLowerCase());
  }

  final phone = normalizeOwnerPhone(trimmed);
  final digits = phone.replaceAll(RegExp(r'\D'), '');
  return OwnerLoginParts(email: '$digits@foodapp.local', phone: phone);
}

String normalizeOwnerPhone(String phone) {
  var digits = phone.replaceAll(RegExp(r'[\s\-()+]'), '');
  if (digits.startsWith('+')) {
    digits = digits.substring(1);
  }
  if (digits.length == 10 && digits.startsWith('8')) {
    digits = '998${digits.substring(1)}';
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
