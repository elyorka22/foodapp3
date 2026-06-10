class CourierShiftStatsModel {
  const CourierShiftStatsModel({
    required this.todayDeliveries,
    required this.todayEarnings,
    required this.totalDeliveries,
    required this.totalEarnings,
  });

  final int todayDeliveries;
  final num todayEarnings;
  final int totalDeliveries;
  final num totalEarnings;

  factory CourierShiftStatsModel.fromJson(Map<String, dynamic> json) {
    return CourierShiftStatsModel(
      todayDeliveries: (json['todayDeliveries'] as num?)?.toInt() ?? 0,
      todayEarnings: json['todayEarnings'] as num? ?? 0,
      totalDeliveries: (json['totalDeliveries'] as num?)?.toInt() ?? 0,
      totalEarnings: json['totalEarnings'] as num? ?? 0,
    );
  }
}
