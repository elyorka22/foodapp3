import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../../core/router/routes.dart';

class ControlNavItem {
  const ControlNavItem({
    required this.label,
    required this.icon,
    required this.route,
    this.mobile = true,
  });

  final String label;
  final IconData icon;
  final String route;

  /// Shown in mobile bottom navigation when true.
  final bool mobile;
}

/// Flat list order MUST match [StatefulShellRoute] branch indices in app_router.
const controlNavItems = <ControlNavItem>[
  ControlNavItem(
    label: AppStrings.navDashboard,
    icon: Icons.grid_view_rounded,
    route: AppRoutes.dashboard,
  ),
  ControlNavItem(
    label: AppStrings.navEmployees,
    icon: Icons.badge_outlined,
    route: AppRoutes.employees,
    mobile: false,
  ),
  ControlNavItem(
    label: AppStrings.navBusinesses,
    icon: Icons.storefront_outlined,
    route: AppRoutes.businesses,
  ),
  ControlNavItem(
    label: AppStrings.navOrders,
    icon: Icons.receipt_long_outlined,
    route: AppRoutes.orders,
  ),
  ControlNavItem(
    label: AppStrings.navCatalog,
    icon: Icons.category_outlined,
    route: AppRoutes.catalog,
  ),
  ControlNavItem(
    label: AppStrings.navPromotions,
    icon: Icons.campaign_outlined,
    route: AppRoutes.promotions,
    mobile: false,
  ),
  ControlNavItem(
    label: AppStrings.navPush,
    icon: Icons.notifications_active_outlined,
    route: AppRoutes.push,
    mobile: false,
  ),
  ControlNavItem(
    label: AppStrings.navCouriers,
    icon: Icons.delivery_dining_outlined,
    route: AppRoutes.couriers,
    mobile: false,
  ),
  ControlNavItem(
    label: AppStrings.navCustomers,
    icon: Icons.people_outline,
    route: AppRoutes.customers,
    mobile: false,
  ),
  ControlNavItem(
    label: AppStrings.navCities,
    icon: Icons.location_city_outlined,
    route: AppRoutes.cities,
    mobile: false,
  ),
  ControlNavItem(
    label: AppStrings.navDeliveryZones,
    icon: Icons.map_outlined,
    route: AppRoutes.deliveryZones,
    mobile: false,
  ),
  ControlNavItem(
    label: AppStrings.navBusinessTypes,
    icon: Icons.apartment_outlined,
    route: AppRoutes.businessTypes,
    mobile: false,
  ),
  ControlNavItem(
    label: AppStrings.navBooking,
    icon: Icons.event_seat_outlined,
    route: AppRoutes.booking,
    mobile: false,
  ),
  ControlNavItem(
    label: AppStrings.navSettings,
    icon: Icons.settings_outlined,
    route: AppRoutes.settings,
    mobile: false,
  ),
  ControlNavItem(
    label: AppStrings.navAudit,
    icon: Icons.policy_outlined,
    route: AppRoutes.audit,
    mobile: false,
  ),
];

class ControlNavGroup {
  const ControlNavGroup({required this.label, required this.indices});

  final String label;

  /// Indices into [controlNavItems] / shell branches.
  final List<int> indices;
}

/// Grouped sidebar / drawer sections (indices stay aligned with router).
const controlNavGroups = <ControlNavGroup>[
  ControlNavGroup(
    label: AppStrings.navGroupMain,
    indices: [0, 3, 2, 4], // dashboard, orders, businesses, catalog
  ),
  ControlNavGroup(
    label: AppStrings.navGroupOps,
    indices: [7, 8, 1, 12], // couriers, customers, employees, booking
  ),
  ControlNavGroup(
    label: AppStrings.navGroupGrowth,
    indices: [5, 6], // promotions, push
  ),
  ControlNavGroup(
    label: AppStrings.navGroupPlatform,
    indices: [9, 10, 11], // cities, zones, business types
  ),
  ControlNavGroup(
    label: AppStrings.navGroupSystem,
    indices: [13, 14], // settings, audit
  ),
];
