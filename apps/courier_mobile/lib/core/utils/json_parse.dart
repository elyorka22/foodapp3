double? parseDouble(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  return double.tryParse(value.toString());
}

String? parseString(dynamic value) {
  if (value == null) return null;
  return value.toString();
}
