class WorkingHourModel {
  const WorkingHourModel({
    required this.dayOfWeek,
    required this.openTime,
    required this.closeTime,
    this.isClosed = false,
  });

  final int dayOfWeek;
  final String openTime;
  final String closeTime;
  final bool isClosed;

  factory WorkingHourModel.fromJson(Map<String, dynamic> json) {
    return WorkingHourModel(
      dayOfWeek: (json['dayOfWeek'] as num?)?.toInt() ?? 0,
      openTime: json['openTime'] as String? ?? '09:00',
      closeTime: json['closeTime'] as String? ?? '22:00',
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

List<WorkingHourModel> buildWeeklyHours({
  required String openTime,
  required String closeTime,
  bool closedSunday = false,
}) {
  return List.generate(
    7,
    (day) => WorkingHourModel(
      dayOfWeek: day,
      openTime: openTime,
      closeTime: closeTime,
      isClosed: day == 0 && closedSunday,
    ),
  );
}
