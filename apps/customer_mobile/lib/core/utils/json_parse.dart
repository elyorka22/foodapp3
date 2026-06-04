/// Safe JSON coercions matching NestJS / Prisma API responses.
num parseNum(Object? value, {num defaultValue = 0}) {
  if (value == null) return defaultValue;
  if (value is num) return value;
  if (value is String) return num.tryParse(value) ?? defaultValue;
  return defaultValue;
}

String? parseString(Object? value) => value?.toString();

bool? parseBool(Object? value) {
  if (value == null) return null;
  if (value is bool) return value;
  if (value is String) return value.toLowerCase() == 'true';
  return null;
}

int? parseIntOrNull(Object? value) {
  if (value == null) return null;
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value) ?? double.tryParse(value)?.toInt();
  return null;
}

double? parseDoubleOrNull(Object? value) {
  if (value == null) return null;
  if (value is double) return value;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value);
  return null;
}

num? parseNumOrNull(Object? value) {
  if (value == null) return null;
  return parseNum(value);
}
