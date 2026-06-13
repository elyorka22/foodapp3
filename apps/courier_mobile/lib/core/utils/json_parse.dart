double? parseDouble(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  return double.tryParse(value.toString());
}

num parseNum(dynamic value, [num fallback = 0]) {
  if (value == null) return fallback;
  if (value is num) return value;
  return num.tryParse(value.toString()) ?? fallback;
}

int parseInt(dynamic value, [int fallback = 0]) {
  return parseNum(value, fallback).toInt();
}

String? parseString(dynamic value) {
  if (value == null) return null;
  return value.toString();
}
