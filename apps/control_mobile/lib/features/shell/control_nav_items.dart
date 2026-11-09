import 'package:flutter/material.dart';
import '../../core/l10n/app_strings.dart';
import '../business_types/data/business_types_repository.dart';
import 'control_vertical_scope.dart';

/// Shell branch indices — MUST match [StatefulShellRoute] order in app_router.
abstract final class ControlBranches {
  static const dashboard = 0;
  static const employees = 1;
  static const businesses = 2;
  static const orders = 3;
  static const catalog = 4;
  static const promotions = 5;
  static const push = 6;
  static const couriers = 7;
  static const customers = 8;
  static const cities = 9;
  static const deliveryZones = 10;
  static const businessTypes = 11;
  static const booking = 12;
  static const settings = 13;
  static const audit = 14;
}

class ControlNavEntry {
  const ControlNavEntry({
    required this.id,
    required this.label,
    required this.icon,
    required this.branchIndex,
    this.scope = ControlVerticalScope.all,
    this.catalogIntent,
    this.mobile = false,
  });

  final String id;
  final String label;
  final IconData icon;
  final int branchIndex;
  final ControlVerticalScope scope;
  final CatalogNavIntent? catalogIntent;

  /// Shown in mobile bottom navigation when true.
  final bool mobile;
}

class ControlNavSection {
  const ControlNavSection({
    required this.label,
    required this.entries,
  });

  final String label;
  final List<ControlNavEntry> entries;
}

/// Flat mobile bottom destinations (stable order).
const controlMobileNavEntries = <ControlNavEntry>[
  ControlNavEntry(
    id: 'mobile-dashboard',
    label: AppStrings.navDashboard,
    icon: Icons.grid_view_rounded,
    branchIndex: ControlBranches.dashboard,
    mobile: true,
  ),
  ControlNavEntry(
    id: 'mobile-businesses',
    label: AppStrings.navBusinesses,
    icon: Icons.storefront_outlined,
    branchIndex: ControlBranches.businesses,
    mobile: true,
  ),
  ControlNavEntry(
    id: 'mobile-orders',
    label: AppStrings.navOrders,
    icon: Icons.receipt_long_outlined,
    branchIndex: ControlBranches.orders,
    mobile: true,
  ),
  ControlNavEntry(
    id: 'mobile-catalog',
    label: AppStrings.navCatalog,
    icon: Icons.category_outlined,
    branchIndex: ControlBranches.catalog,
    catalogIntent: CatalogNavIntent.dishCategories,
    mobile: true,
  ),
];

ControlNavEntry _entry({
  required String id,
  required String label,
  required IconData icon,
  required int branch,
  ControlVerticalScope scope = ControlVerticalScope.all,
  CatalogNavIntent? catalogIntent,
  bool mobile = false,
}) {
  return ControlNavEntry(
    id: id,
    label: label,
    icon: icon,
    branchIndex: branch,
    scope: scope,
    catalogIntent: catalogIntent,
    mobile: mobile,
  );
}

List<ControlNavEntry> _verticalEntries({
  required String prefix,
  required ControlVerticalScope scope,
  required bool restaurant,
}) {
  return [
    _entry(
      id: '$prefix-list',
      label: AppStrings.navList,
      icon: Icons.storefront_outlined,
      branch: ControlBranches.businesses,
      scope: scope,
    ),
    _entry(
      id: '$prefix-categories',
      label: restaurant
          ? AppStrings.navDishCategories
          : AppStrings.navStoreCategories,
      icon: Icons.sell_outlined,
      branch: ControlBranches.catalog,
      scope: scope,
      catalogIntent: restaurant
          ? CatalogNavIntent.dishCategories
          : CatalogNavIntent.storeCategories,
    ),
    _entry(
      id: '$prefix-products',
      label: restaurant
          ? AppStrings.navRestaurantMenu
          : AppStrings.navStoreProducts,
      icon: Icons.inventory_2_outlined,
      branch: ControlBranches.catalog,
      scope: scope,
      catalogIntent: CatalogNavIntent.products,
    ),
    _entry(
      id: '$prefix-banners',
      label: AppStrings.navBanners,
      icon: Icons.image_outlined,
      branch: ControlBranches.promotions,
      scope: scope,
    ),
    _entry(
      id: '$prefix-orders',
      label: AppStrings.navOrders,
      icon: Icons.receipt_long_outlined,
      branch: ControlBranches.orders,
      scope: scope,
    ),
  ];
}

/// Sidebar / drawer: Dashboard → Restoranlar → each store type → ops…
List<ControlNavSection> buildControlNavSections(
  List<ControlBusinessType> businessTypes,
) {
  final marketplace = businessTypes.where(isMarketplaceBusinessType).toList()
    ..sort((a, b) {
      final byOrder = a.sortOrder.compareTo(b.sortOrder);
      if (byOrder != 0) return byOrder;
      return a.name.toLowerCase().compareTo(b.name.toLowerCase());
    });

  return [
    ControlNavSection(
      label: AppStrings.navGroupManagement,
      entries: [
        _entry(
          id: 'dashboard',
          label: AppStrings.navDashboard,
          icon: Icons.grid_view_rounded,
          branch: ControlBranches.dashboard,
          mobile: true,
        ),
      ],
    ),
    ControlNavSection(
      label: AppStrings.navGroupRestaurants,
      entries: _verticalEntries(
        prefix: 'restaurant',
        scope: ControlVerticalScope.restaurant,
        restaurant: true,
      ),
    ),
    for (final type in marketplace)
      ControlNavSection(
        label: type.name,
        entries: _verticalEntries(
          prefix: 'type-${type.slug ?? type.id}',
          scope: ControlVerticalScope.marketplace(type),
          restaurant: false,
        ),
      ),
    ControlNavSection(
      label: AppStrings.navGroupOpsOrders,
      entries: [
        _entry(
          id: 'orders-all',
          label: AppStrings.navAllOrders,
          icon: Icons.receipt_long_outlined,
          branch: ControlBranches.orders,
          mobile: true,
        ),
      ],
    ),
    ControlNavSection(
      label: AppStrings.navGroupOps,
      entries: [
        _entry(
          id: 'couriers',
          label: AppStrings.navCouriers,
          icon: Icons.delivery_dining_outlined,
          branch: ControlBranches.couriers,
        ),
        _entry(
          id: 'customers',
          label: AppStrings.navCustomers,
          icon: Icons.people_outline,
          branch: ControlBranches.customers,
        ),
        _entry(
          id: 'employees',
          label: AppStrings.navEmployees,
          icon: Icons.badge_outlined,
          branch: ControlBranches.employees,
        ),
        _entry(
          id: 'booking',
          label: AppStrings.navBooking,
          icon: Icons.event_seat_outlined,
          branch: ControlBranches.booking,
        ),
      ],
    ),
    ControlNavSection(
      label: AppStrings.navGroupGrowth,
      entries: [
        _entry(
          id: 'promotions',
          label: AppStrings.navPromotions,
          icon: Icons.campaign_outlined,
          branch: ControlBranches.promotions,
        ),
        _entry(
          id: 'push',
          label: AppStrings.navPush,
          icon: Icons.notifications_active_outlined,
          branch: ControlBranches.push,
        ),
      ],
    ),
    ControlNavSection(
      label: AppStrings.navGroupPlatform,
      entries: [
        _entry(
          id: 'cities',
          label: AppStrings.navCities,
          icon: Icons.location_city_outlined,
          branch: ControlBranches.cities,
        ),
        _entry(
          id: 'zones',
          label: AppStrings.navDeliveryZones,
          icon: Icons.map_outlined,
          branch: ControlBranches.deliveryZones,
        ),
        _entry(
          id: 'business-types',
          label: AppStrings.navBusinessTypes,
          icon: Icons.apartment_outlined,
          branch: ControlBranches.businessTypes,
        ),
      ],
    ),
    ControlNavSection(
      label: AppStrings.navGroupSystem,
      entries: [
        _entry(
          id: 'settings',
          label: AppStrings.navSettings,
          icon: Icons.settings_outlined,
          branch: ControlBranches.settings,
        ),
        _entry(
          id: 'audit',
          label: AppStrings.navAudit,
          icon: Icons.policy_outlined,
          branch: ControlBranches.audit,
        ),
      ],
    ),
  ];
}
