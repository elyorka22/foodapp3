class WorkingHourModel {
  const WorkingHourModel({
    required this.dayOfWeek,
    required this.openTime,
    required this.closeTime,
    this.isClosed = false,
  });

  final int dayOfWeek;
  /// When work resumes (end of non-working block). Stored as openTime in API.
  final String openTime;
  /// When work pauses (start of non-working block). Stored as closeTime in API.
  final String closeTime;
  final bool isClosed;

  /// Non-working period start (UI).
  String get closedFrom => closeTime;

  /// Non-working period end (UI).
  String get closedUntil => openTime;

  factory WorkingHourModel.fromJson(Map<String, dynamic> json) {
    return WorkingHourModel(
      dayOfWeek: (json['dayOfWeek'] as num?)?.toInt() ?? 0,
      openTime: json['openTime'] as String? ?? '09:00',
      closeTime: json['closeTime'] as String? ?? '01:00',
      isClosed: json['isClosed'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'dayOfWeek': dayOfWeek,
        'openTime': openTime,
        'closeTime': closeTime,
        'isClosed': isClosed,
      };
}

/// Same non-working hours for every day (e.g. closed 01:00–09:00 → open rest of day).
List<WorkingHourModel> buildWeeklyHours({
  required String closedFrom,
  required String closedUntil,
  bool closedSunday = false,
}) {
  return List.generate(
    7,
    (day) => WorkingHourModel(
      dayOfWeek: day,
      openTime: closedUntil,
      closeTime: closedFrom,
      isClosed: day == 0 && closedSunday,
    ),
  );
}
