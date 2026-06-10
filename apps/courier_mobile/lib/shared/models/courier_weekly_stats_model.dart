class CourierWeeklyDayModel {
  const CourierWeeklyDayModel({
    required this.date,
    required this.deliveries,
    required this.earnings,
  });

  final String date;
  final int deliveries;
  final num earnings;

  factory CourierWeeklyDayModel.fromJson(Map<String, dynamic> json) {
    return CourierWeeklyDayModel(
      date: json['date'] as String? ?? '',
      deliveries: (json['deliveries'] as num?)?.toInt() ?? 0,
      earnings: json['earnings'] as num? ?? 0,
    );
  }
}

class CourierWeeklyStatsModel {
  const CourierWeeklyStatsModel({
    required this.days,
    required this.weekDeliveries,
    required this.weekEarnings,
  });

  final List<CourierWeeklyDayModel> days;
  final int weekDeliveries;
  final num weekEarnings;

  factory CourierWeeklyStatsModel.fromJson(Map<String, dynamic> json) {
    final rawDays = json['days'] as List<dynamic>? ?? [];
    return CourierWeeklyStatsModel(
      days: rawDays
          .whereType<Map<String, dynamic>>()
          .map(CourierWeeklyDayModel.fromJson)
          .toList(),
      weekDeliveries: (json['weekDeliveries'] as num?)?.toInt() ?? 0,
      weekEarnings: json['weekEarnings'] as num? ?? 0,
    );
  }
}
