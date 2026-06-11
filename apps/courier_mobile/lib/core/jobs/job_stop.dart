import '../l10n/app_strings.dart';

enum JobStopRole { pickup, dropoff, waypoint }

class JobStop {
  const JobStop({
    required this.role,
    required this.title,
    this.subtitle,
    this.lat,
    this.lng,
    this.phone,
  });

  final JobStopRole role;
  final String title;
  final String? subtitle;
  final double? lat;
  final double? lng;
  final String? phone;

  String get roleLabel => switch (role) {
        JobStopRole.pickup => AppStrings.stopPickup,
        JobStopRole.dropoff => AppStrings.stopDropoff,
        JobStopRole.waypoint => AppStrings.stopWaypoint,
      };
}
