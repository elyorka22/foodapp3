class CourierEarningsModel {
  const CourierEarningsModel({
    required this.totalEarnings,
    required this.assignmentEarnings,
    required this.totalDeliveries,
    required this.completedAssignments,
  });

  final num totalEarnings;
  final num assignmentEarnings;
  final int totalDeliveries;
  final int completedAssignments;

  factory CourierEarningsModel.fromJson(Map<String, dynamic> json) {
    return CourierEarningsModel(
      totalEarnings: json['totalEarnings'] as num? ?? 0,
      assignmentEarnings: json['assignmentEarnings'] as num? ?? 0,
      totalDeliveries: (json['totalDeliveries'] as num?)?.toInt() ?? 0,
      completedAssignments: (json['completedAssignments'] as num?)?.toInt() ?? 0,
    );
  }
}
