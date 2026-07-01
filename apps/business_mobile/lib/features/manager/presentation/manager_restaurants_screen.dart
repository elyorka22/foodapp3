import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/router/routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/utils/safe_area_padding.dart';
import '../../../shared/models/restaurant_model.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/screen_header.dart';
import '../../restaurant/data/restaurant_repository.dart';

final restaurantsListProvider = FutureProvider.autoDispose<List<RestaurantModel>>((ref) async {
  return ref.watch(restaurantRepositoryProvider).fetchAllRestaurants(vertical: 'restaurant');
});

final storesListProvider = FutureProvider.autoDispose<List<RestaurantModel>>((ref) async {
  return ref.watch(restaurantRepositoryProvider).fetchAllRestaurants(vertical: 'store');
});

class _TelegramLinkCodeBadge extends StatelessWidget {
  const _TelegramLinkCodeBadge({required this.code});

  final String code;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 4),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.warning.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        '${AppStrings.telegramPairingCode}: $code',
        style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700),
      ),
    );
  }
}

class ManagerRestaurantsScreen extends StatelessWidget {
  const ManagerRestaurantsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ManagerBusinessesScreen(
      vertical: 'restaurant',
      title: AppStrings.restaurants,
      subtitle: 'Restoranlar va menyularni boshqaring',
      emptyTitle: AppStrings.noRestaurants,
      createLabel: AppStrings.createRestaurant,
      createRoute: AppRoutes.managerRestaurantNew,
      listProvider: restaurantsListProvider,
      listIcon: Icons.storefront,
    );
  }
}

class ManagerStoresScreen extends StatelessWidget {
  const ManagerStoresScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ManagerBusinessesScreen(
      vertical: 'store',
      title: AppStrings.stores,
      subtitle: 'Do\'konlar va mahsulotlarni boshqaring',
      emptyTitle: AppStrings.noStores,
      createLabel: AppStrings.createStore,
      createRoute: AppRoutes.managerRestaurantNew,
      listProvider: storesListProvider,
      listIcon: Icons.shopping_bag_outlined,
    );
  }
}

class ManagerBusinessesScreen extends ConsumerStatefulWidget {
  const ManagerBusinessesScreen({
    super.key,
    required this.vertical,
    required this.title,
    required this.subtitle,
    required this.emptyTitle,
    required this.createLabel,
    required this.createRoute,
    required this.listProvider,
    required this.listIcon,
  });

  final String vertical;
  final String title;
  final String subtitle;
  final String emptyTitle;
  final String createLabel;
  final String createRoute;
  final AutoDisposeFutureProvider<List<RestaurantModel>> listProvider;
  final IconData listIcon;

  @override
  ConsumerState<ManagerBusinessesScreen> createState() => _ManagerBusinessesScreenState();
}

class _ManagerBusinessesScreenState extends ConsumerState<ManagerBusinessesScreen> {
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (mounted) ref.invalidate(widget.listProvider);
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final businesses = ref.watch(widget.listProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(widget.createRoute, extra: widget.vertical),
        icon: const Icon(Icons.add),
        label: Text(widget.createLabel),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(widget.listProvider),
        child: ListView(
          padding: scrollFabPadding(context),
          children: [
            ScreenHeader(title: widget.title, subtitle: widget.subtitle),
            businesses.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(48),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => ErrorState(
                message: ApiException.formatError(e),
                onRetry: () => ref.invalidate(widget.listProvider),
              ),
              data: (list) {
                if (list.isEmpty) {
                  return EmptyState(
                    icon: widget.listIcon,
                    title: widget.emptyTitle,
                    actionLabel: widget.createLabel,
                    onAction: () => context.push(widget.createRoute, extra: widget.vertical),
                  );
                }
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Column(
                    children: list
                        .map(
                          (business) => AppCard(
                            onTap: () => context.push(AppRoutes.managerRestaurantEdit(business.id)),
                            child: Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: AppColors.primarySoft,
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: Icon(widget.listIcon, color: AppColors.primary),
                                ),
                                const SizedBox(width: AppSpacing.md),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(business.name, style: AppTypography.subtitle),
                                      if (business.phone != null)
                                        Text(business.phone!, style: AppTypography.bodySmall),
                                      if (business.telegramLinkCode != null &&
                                          business.telegramLinkCode!.isNotEmpty)
                                        _TelegramLinkCodeBadge(code: business.telegramLinkCode!),
                                      if (business.telegramOrderChatId != null &&
                                          business.telegramOrderChatId!.isNotEmpty)
                                        Text(
                                          AppStrings.telegramLinked,
                                          style: AppTypography.caption.copyWith(
                                            color: AppColors.success,
                                          ),
                                        ),
                                      if (business.branchAddress != null)
                                        Text(
                                          business.branchAddress!,
                                          style: AppTypography.caption,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                    ],
                                  ),
                                ),
                                Column(
                                  children: [
                                    Icon(
                                      business.isActive ? Icons.check_circle : Icons.block,
                                      color: business.isActive ? AppColors.success : AppColors.danger,
                                      size: 20,
                                    ),
                                    const SizedBox(height: 8),
                                    IconButton(
                                      onPressed: () => context.push(
                                        AppRoutes.managerRestaurantMenu(business.id),
                                      ),
                                      icon: Icon(
                                        widget.vertical == 'store'
                                            ? Icons.inventory_2_outlined
                                            : Icons.restaurant_menu_outlined,
                                      ),
                                      tooltip: AppStrings.manageMenu,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        )
                        .toList(),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
