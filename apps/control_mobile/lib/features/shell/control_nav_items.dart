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

const controlNavItems = <ControlNavItem>[
  ControlNavItem(
    label: AppStrings.navDashboard,
    icon: Icons.dashboard_outlined,
    route: AppRoutes.dashboard,
  ),
  ControlNavItem(
    label: AppStrings.navEmployees,
    icon: Icons.badge_outlined,
    route: AppRoutes.employees,
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
    icon: Icons.inventory_2_outlined,
    route: AppRoutes.catalog,
    mobile: false,
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
    label: AppStrings.navBusinessTypes,
    icon: Icons.category_outlined,
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
    label: AppStrings.navTelegram,
    icon: Icons.chat_outlined,
    route: AppRoutes.telegram,
    mobile: false,
  ),
  ControlNavItem(
    label: AppStrings.navSettings,
    icon: Icons.settings_outlined,
    route: AppRoutes.settings,
  ),
  ControlNavItem(
    label: AppStrings.navAudit,
    icon: Icons.policy_outlined,
    route: AppRoutes.audit,
    mobile: false,
  ),
];
