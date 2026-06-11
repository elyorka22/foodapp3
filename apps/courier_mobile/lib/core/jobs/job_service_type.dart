import 'package:flutter/material.dart';
import '../l10n/app_strings.dart';
import '../theme/app_colors.dart';

/// Delivery platform service types. Food is live; taxi & cargo reserved for future apps.
enum JobServiceType {
  food,
  taxi,
  cargo,
}

extension JobServiceTypeX on JobServiceType {
  String get label => switch (this) {
        JobServiceType.food => AppStrings.serviceFood,
        JobServiceType.taxi => AppStrings.serviceTaxi,
        JobServiceType.cargo => AppStrings.serviceCargo,
      };

  Color get color => switch (this) {
        JobServiceType.food => AppColors.serviceFood,
        JobServiceType.taxi => AppColors.serviceTaxi,
        JobServiceType.cargo => AppColors.serviceCargo,
      };

  IconData get icon => switch (this) {
        JobServiceType.food => Icons.restaurant_outlined,
        JobServiceType.taxi => Icons.local_taxi_outlined,
        JobServiceType.cargo => Icons.inventory_2_outlined,
      };

  bool get isAvailable => this == JobServiceType.food;
}
